import { ChangeEvent, useState } from 'react';
import { getDocument } from 'pdfjs-dist';
import { db } from '../db';
import { ocrToText } from '../lib/ocr';
import { extractTextItems } from '../lib/pdf';
import { rowsFromOcrText, rowsFromTextItems } from '../lib/parse';
import type { ParsedObservationRow } from '../types';

type UploadProps = {
  onComplete?: () => Promise<void> | void;
  onStatus?: (status: { type: 'info' | 'error'; message: string }) => void;
};

type ExtractionMethod = 'pdf-text' | 'ocr';

const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/heic'];

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function isImage(file: File): boolean {
  return IMAGE_MIME_TYPES.includes(file.type) || /\.(png|jpe?g|webp|gif|heic)$/i.test(file.name);
}

async function renderPdfToOcrText(file: File): Promise<string> {
  const data = await file.arrayBuffer();
  const pdf = await getDocument({ data }).promise;
  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    if (!context) {
      continue;
    }

    await page.render({ canvasContext: context, viewport }).promise;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
    canvas.width = 0;
    canvas.height = 0;
    if (!blob) {
      continue;
    }
    const text = await ocrToText(blob);
    if (text.trim().length > 0) {
      pageTexts.push(text);
    }
  }

  return pageTexts.join('\n');
}

export default function Upload({ onComplete, onStatus }: UploadProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<ParsedObservationRow[]>([]);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [method, setMethod] = useState<ExtractionMethod | null>(null);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList?.length) {
      return;
    }

    setProcessing(true);
    setError(null);
    onStatus?.({ type: 'info', message: `Processing ${fileList.length} file${fileList.length === 1 ? '' : 's'}…` });

    try {
      for (const file of Array.from(fileList)) {
        let parsedRows: ParsedObservationRow[] = [];
        let extraction: ExtractionMethod = 'pdf-text';
        let pageCount = 1;

        if (isPdf(file)) {
          const pages = await extractTextItems(file);
          pageCount = pages.length || 1;
          parsedRows = rowsFromTextItems(pages);

          if (!parsedRows.length) {
            const ocrText = await renderPdfToOcrText(file);
            if (ocrText.trim().length) {
              parsedRows = rowsFromOcrText(ocrText);
              extraction = 'ocr';
            }
          }
        } else if (isImage(file)) {
          const text = await ocrToText(file);
          parsedRows = rowsFromOcrText(text);
          extraction = 'ocr';
        } else {
          throw new Error('Unsupported file type');
        }

        if (!parsedRows.length) {
          throw new Error(`No structured rows detected in ${file.name}`);
        }

        const documentId = await db.documents.add({
          fileName: file.name,
          fileType: file.type || (isPdf(file) ? 'application/pdf' : 'image'),
          uploadedAt: new Date().toISOString(),
          pageCount
        });

        const timestamp = new Date().toISOString();
        await db.observations.bulkAdd(
          parsedRows.map((row) => ({
            documentId,
            rawName: row.rawName,
            value: row.value,
            unit: row.unit,
            ref: row.ref,
            date: row.date,
            createdAt: timestamp
          }))
        );

        setPreviewRows(parsedRows);
        setPreviewFile(file.name);
        setMethod(extraction);

        if (onComplete) {
          await onComplete();
        }

        const description =
          extraction === 'ocr'
            ? 'Optical Character Recognition'
            : 'the embedded PDF text layout';
        onStatus?.({
          type: 'info',
          message: `Parsed ${parsedRows.length} rows from ${file.name} using ${description}.`
        });
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to parse the selected file.');
      onStatus?.({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unable to parse the selected file.'
      });
    } finally {
      setProcessing(false);
      event.target.value = '';
    }
  };

  return (
    <div>
      <input type="file" multiple accept="application/pdf,image/*" onChange={handleChange} />
      {processing && <p style={{ marginTop: '1rem' }}>Processing…</p>}
      {error && (
        <p style={{ marginTop: '1rem', color: '#b91c1c', fontWeight: 600 }}>
          {error}
        </p>
      )}
      {previewRows.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem' }}>
            Preview for <strong>{previewFile}</strong> ({method === 'ocr' ? 'OCR' : 'PDF text'} extraction)
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Result</th>
                  <th>Unit</th>
                  <th>Reference</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, index) => (
                  <tr key={`${row.rawName}-${row.value}-${index}`}>
                    <td>{row.rawName}</td>
                    <td>{row.value}</td>
                    <td>{row.unit || '—'}</td>
                    <td>{row.ref || '—'}</td>
                    <td>{row.date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
