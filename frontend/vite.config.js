import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  },
  base: './',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true // Enable WebSocket proxying
      }
    },
    hmr: {
      overlay: false, // Disable the error overlay
      clientPort: 443,
      host: true
    },
    watch: {
      usePolling: true
    }
  }
});
