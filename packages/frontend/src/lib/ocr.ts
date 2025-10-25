import { createWorker, type Worker as TesseractWorker } from 'tesseract.js';

let worker: TesseractWorker | null = null;

async function getWorker(lang = 'eng'): Promise<TesseractWorker> {
  if (!worker) {
    worker = await createWorker();
    await worker.load();
    await worker.loadLanguage(lang);
    await worker.initialize(lang);
  }
  return worker;
}

export async function ocrToText(input: ImageBitmapSource | Blob, lang = 'eng'): Promise<string> {
  const w = await getWorker(lang);
  const { data } = await w.recognize(input);
  return data.text ?? '';
}

export async function disposeOcr() {
  if (worker) { await worker.terminate(); worker = null; }
}
