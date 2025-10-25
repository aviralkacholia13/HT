import { useCallback, useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { db } from './db';
import { LabDocument, InsightCard, ObservationRecord, ReferenceRange } from './types';
import insightsData from './data/insights.json';
import { LabTable } from './components/LabTable';
import { TrendChart } from './components/TrendChart';
import { InsightGrid } from './components/InsightGrid';
import Upload from './routes/Upload';

function extractNumericValue(raw: string): number | null {
  const match = raw.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  if (!match) {
    return null;
  }
  const parsed = parseFloat(match[0]);
  return Number.isNaN(parsed) ? null : parsed;
}

function normaliseDateValue(input: string | null): string | null {
  if (!input) {
    return null;
  }
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (match) {
    let [, monthRaw, dayRaw, yearRaw] = match;
    const month = monthRaw.padStart(2, '0');
    const day = dayRaw.padStart(2, '0');
    let year = yearRaw;
    if (yearRaw.length === 2) {
      const yearNum = parseInt(yearRaw, 10);
      year = yearNum > 80 ? `19${yearRaw}` : `20${yearRaw}`;
    } else if (yearRaw.length === 3) {
      year = `2${yearRaw}`;
    }
    return `${year.padStart(4, '0')}-${month}-${day}`;
  }

  return trimmed;
}

function buildReferenceRange(ref: string): ReferenceRange | null {
  const trimmed = ref.trim();
  if (!trimmed) {
    return null;
  }

  const sanitized = trimmed.replace(/,/g, '');
  const rangeMatch = sanitized.match(/(-?\d+(?:\.\d+)?)\s*[-–]\s*(-?\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    return {
      low: Number.isNaN(low) ? null : low,
      high: Number.isNaN(high) ? null : high,
      raw: trimmed
    };
  }

  const singleMatch = sanitized.match(/-?\d+(?:\.\d+)?/);
  if (singleMatch) {
    const numeric = parseFloat(singleMatch[0]);
    if (!Number.isNaN(numeric)) {
      return {
        low: null,
        high: numeric,
        raw: trimmed
      };
    }
  }

  return {
    low: null,
    high: null,
    raw: trimmed
  };
}

function observationToRow(observation: ObservationRecord, sourceFile: string, index: number) {
  const valueRaw = observation.value;
  const parsedDate = normaliseDateValue(observation.date ?? null);
  return {
    id: `${observation.documentId}-${index}-${observation.rawName}`,
    testName: observation.rawName,
    value: extractNumericValue(valueRaw),
    unit: observation.unit,
    valueRaw,
    referenceRange: observation.ref ? buildReferenceRange(observation.ref) : null,
    date: parsedDate,
    sourceFile
  } satisfies LabDocument['rows'][number];
}

export default function App() {
  const [documents, setDocuments] = useState<LabDocument[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const insights = insightsData as InsightCard[];

  const loadDocuments = useCallback(async () => {
    const [storedDocuments, storedObservations] = await Promise.all([
      db.documents.orderBy('uploadedAt').toArray(),
      db.observations.toArray()
    ]);

    const observationMap = new Map<number, ObservationRecord[]>();
    storedObservations.forEach((observation) => {
      if (!observation.documentId) {
        return;
      }
      if (!observationMap.has(observation.documentId)) {
        observationMap.set(observation.documentId, []);
      }
      observationMap.get(observation.documentId)!.push(observation);
    });

    const mapped: LabDocument[] = storedDocuments.map((doc) => {
      const rows = (doc.id ? observationMap.get(doc.id) ?? [] : [])
        .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))
        .map((observation, index) => observationToRow(observation, doc.fileName, index));

      return {
        id: doc.id,
        fileName: doc.fileName,
        uploadedAt: doc.uploadedAt,
        rows,
        plainText: ''
      };
    });

    setDocuments(mapped);
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

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
    await Promise.all([db.documents.clear(), db.observations.clear()]);
    setDocuments([]);
    setSelectedTest(null);
  };

  return (
    <div className="container">
      <div data-test="boot-ok">App loaded</div>
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
        <Upload onComplete={loadDocuments} />
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
