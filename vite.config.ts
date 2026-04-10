import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', 
  build: {
    outDir: 'dist', // باش Vite يخدم مجلد dist اللي يحبو Vercel
  }
});
