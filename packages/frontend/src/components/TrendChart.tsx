import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { LabResultRow } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface TrendChartProps {
  rows: LabResultRow[];
  selectedTest: string | null;
}

export function TrendChart({ rows, selectedTest }: TrendChartProps) {
  const filtered = useMemo(() => {
    if (!selectedTest) {
      return [];
    }

    return rows
      .filter((row) => row.testName === selectedTest && row.date)
      .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  }, [rows, selectedTest]);

  const labels = filtered.map((row) => row.date ?? row.id);
  const values = filtered.map((row) => row.value);
  const rangeLow = filtered.map((row) => row.referenceRange?.low ?? null);
  const rangeHigh = filtered.map((row) => row.referenceRange?.high ?? null);

  const dataset = useMemo(() => {
    if (!filtered.length) {
      return null;
    }

    return {
      labels,
      datasets: [
        {
          label: 'Reference Low',
          data: rangeLow,
          borderColor: 'rgba(34,197,94,0)',
          backgroundColor: 'rgba(74, 222, 128, 0.15)',
          fill: '+1',
          pointRadius: 0,
          spanGaps: true
        },
        {
          label: 'Reference High',
          data: rangeHigh,
          borderColor: 'rgba(34,197,94,0)',
          backgroundColor: 'rgba(74, 222, 128, 0.15)',
          pointRadius: 0,
          spanGaps: true
        },
        {
          label: selectedTest,
          data: values,
          borderColor: 'rgba(59,130,246,1)',
          backgroundColor: 'rgba(59,130,246,0.25)',
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          spanGaps: true
        }
      ]
    };
  }, [filtered, labels, rangeLow, rangeHigh, selectedTest, values]);

  if (!dataset) {
    return <p>No data available for the selected test yet.</p>;
  }

  return (
    <Line
      data={dataset}
      options={{
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: `${selectedTest} trend`
          }
        },
        scales: {
          y: {
            title: {
              display: true,
              text: filtered[0]?.unit ?? ''
            }
          }
        }
      }}
    />
  );
}
