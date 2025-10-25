import { createWorker } from 'tesseract.js';

type TWorker = Awaited<ReturnType<typeof createWorker>>;
let worker: TWorker | null = null;

async function getWorker(lang = 'eng'): Promise<TWorker> {
  if (!worker) {
    worker = await createWorker();
    await worker.load();
    await (worker as any).loadLanguage(lang);
    await (worker as any).initialize(lang);
  }
  return worker;
}

export async function ocrToText(input: ImageBitmapSource | Blob, lang = 'eng'): Promise<string> {
  const w = await getWorker(lang);
  // use 'any' to bypass mis-typed methods if needed
  const { data } = await (w as any).recognize(input);
  return data?.text ?? '';
}

export async function disposeOcr() {
  if (worker) { await worker.terminate(); worker = null; }
}

// IMPORTANT:
// - Do NOT import or reference the DOM 'Worker' type anywhere.
// - Do NOT alias anything as just 'Worker'.
