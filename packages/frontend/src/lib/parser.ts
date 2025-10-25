import { LabResultRow, ReferenceRange } from '../types';

const LINE_PATTERN = /^(?<test>[A-Za-z0-9\/%()\-\s]+?)\s{2,}(?<value>-?[0-9.]+|[A-Za-z]+)\s+(?<unit>[A-Za-z%/µ]+)?\s+(?<range>[0-9.]+\s?-\s?[0-9.]+|[A-Za-z]+)\s+(?<date>(?:\d{4}-\d{2}-\d{2})|(?:\d{2}\/\d{2}\/\d{4}))/;

export function parseLabTable(text: string, sourceFile: string): LabResultRow[] {
  const rows: LabResultRow[] = [];
  const seen = new Set<string>();

  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .forEach((line, index) => {
      const match = line.match(LINE_PATTERN);
      if (!match || !match.groups) {
        return;
      }

      const { test, value, unit = '', range, date } = match.groups as Record<string, string>;
      const normalized = test.replace(/\s+/g, ' ').trim();
      const id = `${normalized}-${index}-${date}`;
      if (seen.has(id)) {
        return;
      }
      seen.add(id);

      const parsedValue = parseFloat(value);
      const referenceRange = normaliseRange(range);
      rows.push({
        id,
        testName: normalized,
        value: Number.isFinite(parsedValue) ? parsedValue : null,
        unit,
        valueRaw: value,
        referenceRange,
        date: normaliseDate(date),
        sourceFile
      });
    });

  return rows;
}

function normaliseRange(range: string): ReferenceRange | null {
  const cleaned = range.replace(/[^0-9.\-]/g, '');
  if (cleaned.includes('-')) {
    const [lowStr, highStr] = cleaned.split('-').map((token) => token.trim());
    const low = parseFloat(lowStr);
    const high = parseFloat(highStr);
    if (!Number.isNaN(low) || !Number.isNaN(high)) {
      return {
        low: Number.isNaN(low) ? null : low,
        high: Number.isNaN(high) ? null : high,
        raw: range
      };
    }
  }

  const numeric = parseFloat(cleaned);
  if (!Number.isNaN(numeric)) {
    return {
      low: null,
      high: numeric,
      raw: range
    };
  }

  return null;
}

function normaliseDate(date: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [month, day, year] = date.split('/');
    return `${year}-${month}-${day}`;
  }

  return null;
}
