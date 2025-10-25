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
        const worker = await createWorker({
          langPath: '/tesseract'
        });
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        workerInstance = worker;
        updateBootStatus('ocrReady', { ok: true, error: null });
        return worker;
      } catch (error) {
        console.error('Failed to initialize OCR worker', error);
        updateBootStatus('ocrReady', { ok: false, error: formatError(error) });
        workerPromise = null;
        workerInstance = null;
        throw error;
      }
    })();
  }

  return workerPromise;
}

export async function ocrToText(input: Blob): Promise<string> {
  try {
    const worker = await ensureWorker();
    const { data } = await worker.recognize(input);
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
