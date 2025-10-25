import type { PDFDocumentProxy, TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';
import { formatError, updateBootStatus } from '../boot-status';

export interface PositionedTextItem {
  x: number;
  y: number;
  str: string;
}

type PageTextItems = PositionedTextItem[];

type PdfjsModule = typeof import('pdfjs-dist');

let pdfjsPromise: Promise<PdfjsModule> | null = null;
let pdfjsModule: PdfjsModule | null = null;

async function ensurePdfjs(): Promise<PdfjsModule> {
  if (pdfjsModule) {
    return pdfjsModule;
  }

  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?worker&url');
        pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default;
        updateBootStatus('pdfjsLoaded', { ok: true, error: null });
        pdfjsModule = pdfjs;
        return pdfjs;
      } catch (error) {
        console.error('Failed to load pdfjs-dist', error);
        updateBootStatus('pdfjsLoaded', { ok: false, error: formatError(error) });
        pdfjsModule = null;
        pdfjsPromise = null;
        throw error;
      }
    })();
  }

  return pdfjsPromise;
}

export async function getPdfDocument(file: File): Promise<PDFDocumentProxy> {
  const data = await file.arrayBuffer();
  const pdfjs = await ensurePdfjs();
  return pdfjs.getDocument({ data }).promise;
}

function isTextItem(item: TextItem | TextMarkedContent): item is TextItem {
  return typeof (item as TextItem).str === 'string' && Array.isArray((item as TextItem).transform);
}

export async function extractTextItems(file: File): Promise<PageTextItems[]> {
  const pdf = await getPdfDocument(file);
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
