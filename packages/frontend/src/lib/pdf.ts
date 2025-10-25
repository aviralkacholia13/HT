import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
// eslint-disable-next-line import/no-unresolved
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&url';
import type { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';

export interface PositionedTextItem {
  x: number;
  y: number;
  str: string;
}

type PageTextItems = PositionedTextItem[];

GlobalWorkerOptions.workerSrc = workerSrc;

function isTextItem(item: TextItem | TextMarkedContent): item is TextItem {
  return typeof (item as TextItem).str === 'string' && Array.isArray((item as TextItem).transform);
}

export async function extractTextItems(file: File): Promise<PageTextItems[]> {
  const data = await file.arrayBuffer();
  const pdf = await getDocument({ data }).promise;
  const pages: PageTextItems[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const items: PageTextItems = content.items
      .filter(isTextItem)
      .map((item) => {
        const [,,,, x, y] = item.transform;
        return {
          x,
          y,
          str: item.str ?? ''
        } satisfies PositionedTextItem;
      });

    pages.push(items);
  }

  return pages;
}
