import Dexie, { Table } from 'dexie';
import { formatError, updateBootStatus } from './boot-status';
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

let dbInstance: LabDatabase;

try {
  dbInstance = new LabDatabase();
} catch (error) {
  console.error('Failed to create Dexie instance', error);
  updateBootStatus('dexieOpen', { ok: false, error: formatError(error) });
  throw error;
}

dbInstance
  .open()
  .then(() => {
    updateBootStatus('dexieOpen', { ok: true, error: null });
  })
  .catch((error) => {
    console.error('Failed to open Dexie database', error);
    updateBootStatus('dexieOpen', { ok: false, error: formatError(error) });
  });

export const db = dbInstance;
