export interface ReferenceRange {
  low: number | null;
  high: number | null;
  raw: string;
}

export interface LabResultRow {
  id: string;
  testName: string;
  value: number | null;
  unit: string;
  valueRaw: string;
  referenceRange: ReferenceRange | null;
  date: string | null;
  sourceFile: string;
}

export interface LabDocument {
  id?: number;
  fileName: string;
  uploadedAt: string;
  rows: LabResultRow[];
  plainText: string;
}

export interface InsightCard {
  id: string;
  title: string;
  summary: string;
  detail: string;
  relatedTests: string[];
}

export interface ParsedObservationRow {
  rawName: string;
  value: string;
  unit: string;
  ref: string;
  date: string | null;
}

export interface DocumentRecord {
  id?: number;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  pageCount: number;
}

export interface ObservationRecord {
  id?: number;
  documentId: number;
  rawName: string;
  value: string;
  unit: string;
  ref: string;
  date: string | null;
  createdAt: string;
}
