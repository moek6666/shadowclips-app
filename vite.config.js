import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // JURUS 3: MEMECAH KODE MENJADI FILE-FILE KECIL SPESIFIK
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Pisahkan semua icon ke dalam 1 file bernama "vendor-icons"
            if (id.includes('react-icons') || id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Pisahkan engine utama React ke dalam file "vendor-react"
            if (id.includes('react') || id.includes('react-dom') || id.includes('swr')) {
              return 'vendor-react';
            }
            // Sisa library lainnya (seperti turnstile) masuk ke "vendor-utils"
            return 'vendor-utils';
          }
        }
      }
    }
  }
})