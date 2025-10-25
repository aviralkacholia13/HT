import { useEffect, useState } from 'react';
import { BootStatusKey, BootStatusState, getBootStatus, subscribeBootStatus } from '../boot-status';

const STATUS_LABELS: Record<BootStatusKey, string> = {
  appMounted: 'App mounted',
  dexieOpen: 'Dexie open',
  pdfjsLoaded: 'pdfjs loaded',
  ocrReady: 'OCR ready (lazy)'
};

export function BootStatus() {
  const [status, setStatus] = useState<BootStatusState>(() => getBootStatus());

  useEffect(() => {
    const unsubscribe = subscribeBootStatus(setStatus);
    return unsubscribe;
  }, []);

  return (
    <section className="card" aria-live="polite" style={{ marginTop: '1.5rem' }}>
      <h2 style={{ marginBottom: '0.75rem' }}>Boot diagnostics</h2>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.5rem' }}>
        {(Object.keys(STATUS_LABELS) as BootStatusKey[]).map((key) => {
          const entry = status[key];
          const icon = entry.ok ? '✅' : '❌';
          return (
            <li key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontWeight: 500 }}>
                {icon} {STATUS_LABELS[key]}
              </span>
              {!entry.ok && entry.error && (
                <span style={{ color: '#b91c1c', fontSize: '0.9rem' }}>{entry.error}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default BootStatus;
