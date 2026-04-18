import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for deployment (change this for GitHub Pages or subfolder deployment)
  base: '/',
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  // Server configuration for development
  server: {
    port: 5173,
    host: true, // Listen on all addresses
    cors: true
  },
  // Preview configuration for testing production build
  preview: {
    port: 5174,
    host: true
  }
})
