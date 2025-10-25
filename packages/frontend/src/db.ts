import Dexie, { Table } from 'dexie';
import { LabDocument } from './types';

export class LabDatabase extends Dexie {
  labDocuments!: Table<LabDocument, number>;

  constructor() {
    super('ht-lab-database');
    this.version(1).stores({
      labDocuments: '++id, fileName, uploadedAt'
    });
  }
}

export const db = new LabDatabase();
