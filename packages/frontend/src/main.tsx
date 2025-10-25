import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { formatError, updateBootStatus } from './boot-status';
import './index.css';

interface ErrorBoundaryState {
  error: Error | null;
}

class RootErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Unhandled application error', error);
    updateBootStatus('appMounted', { ok: false, error: formatError(error) });
  }

  render() {
    const { error } = this.state;
    if (error) {
      const stack = error.stack ?? '';
      const combined = stack.includes(error.message)
        ? stack
        : `${error.message}${stack ? `\n${stack}` : ''}`;
      return (
        <div className="container" style={{ marginTop: '2rem' }}>
          <h1>Application error</h1>
          <pre data-test="boot-error" style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
            {combined}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
);
