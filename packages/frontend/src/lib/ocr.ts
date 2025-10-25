import * as Tesseract from 'tesseract.js';

let worker: Tesseract.Worker | null = null;

async function ensureWorker(lang = 'eng'): Promise<Tesseract.Worker> {
  if (!worker) {
    worker = (await Tesseract.createWorker()) as unknown as Tesseract.Worker;
    await worker.load();
    await worker.loadLanguage(lang);
    await worker.initialize(lang);
  }
  return worker;
}

export async function ocrToText(input: ImageBitmapSource | Blob, lang = 'eng'): Promise<string> {
  const w = await ensureWorker(lang);
  const { data } = await w.recognize(input);
  return data.text ?? '';
}

export async function disposeOcr() {
  if (worker) { await worker.terminate(); worker = null; }
}
