import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { SupabaseProvider } from './providers/SupabaseProvider';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './providers/theme-provider';
import { MantineProvider } from './providers/mantine-provider';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

const Main = () => {
  return (
    <React.StrictMode>
      <SupabaseProvider>
        <AuthProvider>
          <ThemeProvider defaultTheme="system" enableSystem>
            <MantineProvider>
              <App />
            </MantineProvider>
          </ThemeProvider>
        </AuthProvider>
      </SupabaseProvider>
    </React.StrictMode>
  );
};

root.render(<Main />);
