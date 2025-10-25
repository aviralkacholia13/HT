import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { db } from './db';
import { LabDocument, InsightCard } from './types';
import { extractPdfText } from './lib/pdf';
import { extractImageText } from './lib/ocr';
import { parseLabTable } from './lib/parser';
import insightsData from './data/insights.json';
import { LabTable } from './components/LabTable';
import { TrendChart } from './components/TrendChart';
import { InsightGrid } from './components/InsightGrid';

const supportedImageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

function isPdf(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function isImage(file: File) {
  return supportedImageTypes.some((type) => file.type === type) || /\.(png|jpg|jpeg|webp|gif)$/i.test(file.name);
}

export default function App() {
  const [documents, setDocuments] = useState<LabDocument[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const insights = insightsData as InsightCard[];

  useEffect(() => {
    (async () => {
      const stored = await db.labDocuments.orderBy('uploadedAt').toArray();
      setDocuments(stored);
    })();
  }, []);

  const allRows = useMemo(
    () =>
      documents
        .flatMap((doc) => doc.rows)
        .sort((a, b) => {
          const dateA = a.date ?? '';
          const dateB = b.date ?? '';
          return dateB.localeCompare(dateA);
        }),
    [documents]
  );

  const testNames = useMemo(() => {
    const names = new Set<string>();
    allRows.forEach((row) => {
      if (row.testName) {
        names.add(row.testName);
      }
    });
    return Array.from(names).sort();
  }, [allRows]);

  useEffect(() => {
    if (!selectedTest && testNames.length) {
      setSelectedTest(testNames[0]);
    }
  }, [selectedTest, testNames]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        let text = '';
        if (isPdf(file)) {
          text = await extractPdfText(file);
        } else if (isImage(file)) {
          text = await extractImageText(file);
        } else {
          continue;
        }

        const rows = parseLabTable(text, file.name);
        const documentRecord: LabDocument = {
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          rows,
          plainText: text
        };
        await db.labDocuments.add(documentRecord);
      }
      const stored = await db.labDocuments.orderBy('uploadedAt').toArray();
      setDocuments(stored);
    } catch (err) {
      console.error(err);
      setError('We were unable to process one of the files. Please verify the format and try again.');
    } finally {
      setProcessing(false);
      event.target.value = '';
    }
  };

  const handleGenerateSummary = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Visit summary', 14, 20);
    doc.setFontSize(11);
    let y = 30;

    allRows.slice(0, 40).forEach((row) => {
      const line = `${row.testName} — ${row.valueRaw} ${row.unit} (${row.referenceRange?.raw ?? 'ref n/a'}) on ${row.date ?? 'unknown'} from ${row.sourceFile}`;
      doc.text(line, 14, y, { maxWidth: 180 });
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save('visit-summary.pdf');
  };

  const handleClear = async () => {
    await db.labDocuments.clear();
    setDocuments([]);
    setSelectedTest(null);
  };

  return (
    <div className="container">
      <header className="card" style={{ marginTop: '2rem' }}>
        <div className="flex-between">
          <div>
            <h1>Health Trends PWA</h1>
            <p style={{ color: '#475569', maxWidth: '640px' }}>
              Upload PDF or image lab reports, extract the structured results entirely in your browser, review trends, and keep a
              private offline history.
            </p>
          </div>
          <div className="grid" style={{ gap: '0.5rem' }}>
            <button className="primary" onClick={handleGenerateSummary} disabled={!allRows.length}>
              Download visit summary PDF
            </button>
            <button className="secondary" onClick={handleClear} disabled={!allRows.length}>
              Clear stored data
            </button>
          </div>
        </div>
      </header>

      <section className="card">
        <h2>Upload lab reports</h2>
        <p style={{ color: '#475569' }}>PDF and common image formats are supported. Everything happens locally.</p>
        <input type="file" multiple accept="application/pdf,image/*" onChange={handleFileChange} />
        {processing && <p style={{ marginTop: '1rem' }}>Processing… This may take a moment for large files.</p>}
        {error && (
          <p style={{ marginTop: '1rem', color: '#b91c1c', fontWeight: 600 }}>
            {error}
          </p>
        )}
      </section>

      <section className="card">
        <div className="flex-between">
          <h2>Parsed lab values</h2>
          {testNames.length > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#475569' }}>Highlight trend</span>
              <select value={selectedTest ?? ''} onChange={(event) => setSelectedTest(event.target.value)}>
                <option value="" disabled>
                  Select test
                </option>
                {testNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <LabTable rows={allRows} />
      </section>

      <section className="card">
        <h2>Trend chart</h2>
        <TrendChart rows={allRows} selectedTest={selectedTest} />
      </section>

      <section className="card">
        <h2>Insights</h2>
        <InsightGrid insights={insights} />
      </section>
    </div>
  );
}
