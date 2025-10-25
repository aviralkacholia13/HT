import { LabResultRow } from '../types';

type Status = 'high' | 'low' | 'normal' | 'na';

interface LabTableProps {
  rows: LabResultRow[];
}

function computeStatus(row: LabResultRow): Status {
  if (!row.referenceRange || row.value === null) {
    return 'na';
  }

  const { low, high } = row.referenceRange;
  if (low !== null && row.value < low) {
    return 'low';
  }

  if (high !== null && row.value > high) {
    return 'high';
  }

  return 'normal';
}

const statusLabel: Record<Status, string> = {
  high: 'High',
  low: 'Low',
  normal: 'Normal',
  na: 'N/A'
};

export function LabTable({ rows }: LabTableProps) {
  if (!rows.length) {
    return <p>No parsed lab rows yet. Upload a PDF or image report to get started.</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Test</th>
            <th>Value</th>
            <th>Unit</th>
            <th>Reference</th>
            <th>Status</th>
            <th>Date</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const status = computeStatus(row);
            return (
              <tr key={row.id}>
                <td>{row.testName}</td>
                <td>{row.valueRaw}</td>
                <td>{row.unit}</td>
                <td>{row.referenceRange?.raw ?? '—'}</td>
                <td>
                  <span className={`status-dot ${status}`} />
                  <span className={`badge ${status}`}>{statusLabel[status]}</span>
                </td>
                <td>{row.date ?? '—'}</td>
                <td>{row.sourceFile}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
