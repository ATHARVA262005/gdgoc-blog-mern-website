import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import { generateSitemap } from './src/utils/getSitemap';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        sitemap: './public/sitemap.xml'
      }
    }
  },
  // Add custom command to generate sitemap
  optimizeDeps: {
    entries: ['./src/utils/getSitemap.js']
  }
});
