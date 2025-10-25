import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
// eslint-disable-next-line import/no-unresolved
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&url';

GlobalWorkerOptions.workerSrc = workerSrc;

export async function extractPdfText(file: File): Promise<string> {
  const data = await file.arrayBuffer();
  const pdf = await getDocument({ data }).promise;
  let text = '';

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    text += pageText + '\n';
  }

  return text;
}
