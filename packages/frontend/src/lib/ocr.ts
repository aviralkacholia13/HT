import { createWorker, type Worker as TesseractWorker } from 'tesseract.js';

let worker: TesseractWorker | null = null;

export async function ocrToText(input: ImageBitmapSource | Blob, lang = 'eng'): Promise<string> {
  if (!worker) {
    worker = await createWorker();
    await worker.load();
    await worker.loadLanguage(lang);
    await worker.initialize(lang);
  }
  const { data } = await worker.recognize(input);
  return data.text ?? '';
}

export async function disposeOcr() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
