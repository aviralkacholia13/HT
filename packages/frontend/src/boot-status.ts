export type BootStatusKey = 'appMounted' | 'dexieOpen' | 'pdfjsLoaded' | 'ocrReady';

export interface BootStatusEntry {
  ok: boolean;
  error: string | null;
}

export type BootStatusState = Record<BootStatusKey, BootStatusEntry>;

type BootStatusListener = (state: BootStatusState) => void;

const defaultEntry: BootStatusEntry = { ok: false, error: null };

let state: BootStatusState = {
  appMounted: { ...defaultEntry },
  dexieOpen: { ...defaultEntry },
  pdfjsLoaded: { ...defaultEntry },
  ocrReady: { ...defaultEntry }
};

const listeners = new Set<BootStatusListener>();

function notify() {
  listeners.forEach((listener) => {
    listener(state);
  });
}

export function subscribeBootStatus(listener: BootStatusListener): () => void {
  listeners.add(listener);
  listener(state);
  return () => {
    listeners.delete(listener);
  };
}

export function updateBootStatus(key: BootStatusKey, entry: BootStatusEntry) {
  state = { ...state, [key]: entry };
  notify();
}

export function getBootStatus(): BootStatusState {
  return state;
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch (serializationError) {
    console.error('Unable to serialize error', serializationError);
    return String(error);
  }
}
