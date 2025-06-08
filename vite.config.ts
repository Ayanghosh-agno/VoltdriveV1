import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/salesforce-auth': {
        target: 'https://login.salesforce.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/salesforce-auth/, ''),
        secure: true,
      },
      '/salesforce-api': {
        target: 'https://agno-dev-ed.develop.my.salesforce.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/salesforce-api/, ''),
        secure: true,
      }
    }
  }
});