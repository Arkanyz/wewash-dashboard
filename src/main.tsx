import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { SupabaseProvider } from './providers/SupabaseProvider';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

const Main = () => {
  return (
    <React.StrictMode>
      <SupabaseProvider>
        <App />
      </SupabaseProvider>
    </React.StrictMode>
  );
};

root.render(<Main />);
