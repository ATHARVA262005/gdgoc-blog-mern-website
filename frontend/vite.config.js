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
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    cors: {
      origin: true,
      credentials: true
    },
    hmr: {
      overlay: false, // Disable the error overlay
      clientPort: 443,
      host: true
    },
    watch: {
      usePolling: true
    },
    headers: {
      'Content-Type': 'application/javascript',
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
