import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // هادي هي اللي تنحي الشاشة البيضاء
  build: {
    outDir: '.',
  }
});
