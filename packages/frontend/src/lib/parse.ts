import type { ParsedObservationRow } from '../types';
import type { PositionedTextItem } from './pdf';

type HeaderKey = 'test' | 'result' | 'unit' | 'reference' | 'date';

type HeaderPositions = Partial<Record<HeaderKey, number>>;

type ItemGroup = {
  y: number;
  items: PositionedTextItem[];
};

const HEADER_PATTERNS: Record<HeaderKey, RegExp> = {
  test: /\b(test|analyte|name)\b/i,
  result: /\b(result|value)\b/i,
  unit: /\b(unit|units)\b/i,
  reference: /\b(reference|ref\.?|range)\b/i,
  date: /\b(date|collected|reported)\b/i
};

const Y_TOLERANCE = 4;

const WHITESPACE_RE = /\s+/g;

function normaliseText(value: string): string {
  return value.replace(WHITESPACE_RE, ' ').trim();
}

function groupItemsByLine(items: PositionedTextItem[]): ItemGroup[] {
  if (!items.length) {
    return [];
  }

  const sorted = [...items]
    .map((item) => ({ ...item, str: normaliseText(item.str) }))
    .filter((item) => item.str.length > 0)
    .sort((a, b) => {
      if (b.y === a.y) {
        return a.x - b.x;
      }
      return b.y - a.y;
    });

  const groups: ItemGroup[] = [];
  let current: ItemGroup | null = null;

  sorted.forEach((item) => {
    if (!current || Math.abs(current.y - item.y) > Y_TOLERANCE) {
      current = { y: item.y, items: [item] };
      groups.push(current);
    } else {
      current.items.push(item);
      current.y = (current.y * (current.items.length - 1) + item.y) / current.items.length;
    }
  });

  groups.forEach((group) => {
    group.items.sort((a, b) => a.x - b.x);
  });

  return groups;
}

function detectHeaderPositions(group: ItemGroup): HeaderPositions | null {
  const matches: HeaderPositions = {};
  group.items.forEach((item) => {
    const text = item.str.toLowerCase();
    (Object.keys(HEADER_PATTERNS) as HeaderKey[]).forEach((key) => {
      if (!matches[key] && HEADER_PATTERNS[key].test(text)) {
        matches[key] = item.x;
      }
    });
  });

  const matchCount = Object.keys(matches).length;
  return matchCount >= 2 ? matches : null;
}

function assignColumn(x: number, positions: HeaderPositions): HeaderKey | null {
  let selected: HeaderKey | null = null;
  let distance = Number.POSITIVE_INFINITY;

  (Object.entries(positions) as [HeaderKey, number][]).forEach(([key, headerX]) => {
    if (typeof headerX !== 'number' || Number.isNaN(headerX)) {
      return;
    }
    const delta = Math.abs(x - headerX);
    if (delta < distance) {
      distance = delta;
      selected = key;
    }
  });

  return selected;
}

function buildRowFromGroup(group: ItemGroup, positions: HeaderPositions): ParsedObservationRow | null {
  const buckets: Record<HeaderKey, string[]> = {
    test: [],
    result: [],
    unit: [],
    reference: [],
    date: []
  };

  group.items.forEach((item) => {
    const key = assignColumn(item.x, positions);
    if (!key) {
      return;
    }
    buckets[key].push(item.str);
  });

  const rawName = normaliseText(buckets.test.join(' '));
  const value = normaliseText(buckets.result.join(' '));
  const unit = normaliseText(buckets.unit.join(' '));
  const ref = normaliseText(buckets.reference.join(' '));
  const dateText = normaliseText(buckets.date.join(' '));

  if (!rawName || !value) {
    return null;
  }

  if (HEADER_PATTERNS.test.test(rawName.toLowerCase()) && HEADER_PATTERNS.result.test(value.toLowerCase())) {
    return null;
  }

  return {
    rawName,
    value,
    unit,
    ref,
    date: dateText || null
  };
}

export function rowsFromTextItems(pages: PositionedTextItem[][]): ParsedObservationRow[] {
  const rows: ParsedObservationRow[] = [];
  const seen = new Set<string>();

  pages.forEach((pageItems) => {
    const groups = groupItemsByLine(pageItems);
    let headerPositions: HeaderPositions | null = null;

    groups.forEach((group) => {
      const candidate = detectHeaderPositions(group);
      if (candidate) {
        headerPositions = candidate;
        return;
      }

      if (!headerPositions) {
        return;
      }

      const row = buildRowFromGroup(group, headerPositions);
      if (!row) {
        return;
      }

      const key = `${row.rawName}-${row.value}-${row.date ?? ''}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      rows.push(row);
    });
  });

  return rows;
}

export function rowsFromOcrText(text: string): ParsedObservationRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => normaliseText(line))
    .filter((line) => line.length > 0);

  const headerIndex = lines.findIndex((line) => {
    const lower = line.toLowerCase();
    let hits = 0;
    (Object.keys(HEADER_PATTERNS) as HeaderKey[]).forEach((key) => {
      if (HEADER_PATTERNS[key].test(lower)) {
        hits += 1;
      }
    });
    return hits >= 2;
  });

  const dataLines = headerIndex >= 0 ? lines.slice(headerIndex + 1) : lines;

  const rows: ParsedObservationRow[] = [];
  const seen = new Set<string>();
  let pendingName = '';

  dataLines.forEach((line) => {
    const segments = line.split(/\s{2,}/).map((segment) => segment.trim()).filter(Boolean);

    if (!segments.length) {
      return;
    }

    if (segments.length === 1) {
      pendingName = pendingName ? `${pendingName} ${segments[0]}` : segments[0];
      return;
    }

    const [namePart, value = '', unit = '', ref = '', date = ''] = segments;
    const rawName = normaliseText([pendingName, namePart].filter(Boolean).join(' '));
    pendingName = '';

    if (!rawName || !value) {
      return;
    }

    const row: ParsedObservationRow = {
      rawName,
      value,
      unit,
      ref,
      date: date || null
    };

    const key = `${row.rawName}-${row.value}-${row.date ?? ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      rows.push(row);
    }
  });

  return rows;
}
