import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // باش يخدم المجلد اللي راهو يحوس عليه Vercel
  }
});
