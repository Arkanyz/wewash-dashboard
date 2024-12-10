import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Désactive la vérification des types TypeScript pendant le build
    typescript: {
      noEmit: false,
      noUnusedLocals: false,
      noUnusedParameters: false
    }
  }
});
