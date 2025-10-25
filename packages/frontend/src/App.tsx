import { useEffect } from 'react';
import { updateBootStatus } from './boot-status';
import Home from './routes/Home';

export default function App() {
  useEffect(() => {
    updateBootStatus('appMounted', { ok: true, error: null });
    return () => {
      updateBootStatus('appMounted', { ok: false, error: null });
    };
  }, []);

  return <Home />;
}
