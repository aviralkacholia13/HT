import { createWorker, RecognizeResult } from 'tesseract.js';

let workerPromise: ReturnType<typeof createWorker> | null = null;

const workerUrl = new URL('tesseract.js/dist/worker.min.js', import.meta.url).toString();
const coreUrl = new URL('tesseract.js-core/tesseract-core.wasm.js', import.meta.url).toString();
const langDataUrl = new URL('tesseract.js/dist/lang-data/eng.traineddata.gz', import.meta.url).toString();

async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker({
      workerPath: workerUrl,
      corePath: coreUrl
    });
    const worker = await workerPromise;
    await worker.load();
    await worker.loadLanguage('eng', langDataUrl);
    await worker.initialize('eng');
    return worker;
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
