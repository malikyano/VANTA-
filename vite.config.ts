import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // مهم جداً باش الروابط يمشوا صح
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  build: {
    outDir: '.', // لازم يخرج الملفات في الدوسي الرئيسي كيما درنا في Vercel
    assetsDir: 'assets',
    emptyOutDir: false, // باش ما يمسحش ملفاتك المهمة
  }
});
