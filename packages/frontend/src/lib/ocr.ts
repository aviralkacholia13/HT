import { createWorker, RecognizeResult } from 'tesseract.js';

let workerPromise: Promise<Awaited<ReturnType<typeof createWorker>>> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker();
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      return worker;
    })();
  }

  return workerPromise;
}

export async function extractImageText(file: File): Promise<string> {
  const worker = await getWorker();
  const dataUrl = await fileToDataUrl(file);
  const { data }: RecognizeResult = await worker.recognize(dataUrl);
  return data.text;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
