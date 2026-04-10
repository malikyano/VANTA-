import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // هادي هي اللي تخلي المتصفح يلقى الملفات في Vercel
  build: {
    outDir: '.', // باش يخلي الملفات في الدوسي الرئيسي كيما درنا في Vercel
    assetsDir: 'assets', // باش ينظم الصور والستيل
  }
});
