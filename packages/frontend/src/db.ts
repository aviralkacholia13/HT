import Dexie, { Table } from 'dexie';
import { DocumentRecord, ObservationRecord } from './types';

export class LabDatabase extends Dexie {
  documents!: Table<DocumentRecord, number>;
  observations!: Table<ObservationRecord, number>;

  constructor() {
    super('ht-lab-database');
    this.version(1).stores({
      documents: '++id, fileName, uploadedAt',
      observations: '++id, documentId, rawName'
    });
  }
}

export const db = new LabDatabase();
