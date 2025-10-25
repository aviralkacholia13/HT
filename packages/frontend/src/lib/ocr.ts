import { createWorker } from 'tesseract.js';
import { formatError, updateBootStatus } from '../boot-status';

type WorkerInstance = Awaited<ReturnType<typeof createWorker>>;

let workerPromise: Promise<WorkerInstance> | null = null;
let workerInstance: WorkerInstance | null = null;

async function ensureWorker(): Promise<WorkerInstance> {
  if (workerInstance) {
    return workerInstance;
  }

  if (!workerPromise) {
    workerPromise = (async () => {
      try {
        const worker = await createWorker({ langPath: '/tesseract' } as any);
        try {
          await worker.load();
          await (worker as any).loadLanguage('eng');
          await (worker as any).initialize('eng');
        } catch (error) {
          try {
            await worker.terminate();
          } catch (terminationError) {
            console.error('Failed to terminate OCR worker after init error', terminationError);
          }
          throw error;
        }
        workerInstance = worker;
        updateBootStatus('ocrReady', { ok: true, error: null });
        return worker;
      } catch (error) {
        console.error('Failed to initialize OCR worker', error);
        const message = formatError(error);
        updateBootStatus('ocrReady', { ok: false, error: message });
        workerPromise = null;
        workerInstance = null;
        const wrappedError =
          error instanceof Error ? new Error(`OCR init failed: ${error.message}`) : new Error(`OCR init failed: ${message}`);
        throw wrappedError;
      }
    })();
  }

  return workerPromise;
}

type RecognitionResult = Awaited<ReturnType<WorkerInstance['recognize']>>;

export async function recognizeWithTimeout(input: Blob, ms = 20000): Promise<RecognitionResult> {
  const worker = await ensureWorker();
  const recognitionPromise = worker.recognize(input) as Promise<RecognitionResult>;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('OCR timeout'));
    }, ms);
  });

  try {
    const result = await Promise.race([recognitionPromise, timeoutPromise]);
    return result as RecognitionResult;
  } catch (error) {
    if (error instanceof Error && error.message === 'OCR timeout') {
      recognitionPromise.catch(() => {
        // Ignore rejections after timeout to avoid unhandled promise warnings.
      });
    }
    throw error;
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

export async function ocrToText(input: Blob, ms = 20000): Promise<string> {
  try {
    const { data } = await recognizeWithTimeout(input, ms);
    return data?.text ?? '';
  } catch (error) {
    console.error('OCR failed', error);
    updateBootStatus('ocrReady', { ok: false, error: formatError(error) });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(formatError(error));
  }
}

export async function disposeOcr() {
  if (workerInstance) {
    await workerInstance.terminate();
    workerInstance = null;
    workerPromise = null;
  }
}

// IMPORTANT:
// - Do NOT import or reference the DOM 'Worker' type anywhere.
// - Do NOT alias anything as just 'Worker'.
