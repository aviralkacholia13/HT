import { createWorker } from 'tesseract.js';

type WorkerInstance = Awaited<ReturnType<typeof createWorker>>;

let workerPromise: Promise<WorkerInstance> | null = null;
let workerInstance: WorkerInstance | null = null;

async function ensureWorker(): Promise<WorkerInstance> {
  if (workerInstance) {
    return workerInstance;
  }

  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker();
      await worker.load();
      await (worker as any).loadLanguage('eng');
      await (worker as any).initialize('eng');
      workerInstance = worker;
      return worker;
    })();
  }

  return workerPromise;
}

export async function ocrToText(input: Blob): Promise<string> {
  const worker = await ensureWorker();
  const { data } = await (worker as any).recognize(input);
  return data?.text ?? '';
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
