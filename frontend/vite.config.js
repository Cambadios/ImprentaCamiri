// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    
  ],

  // Dev server
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
    // No necesitas historyApiFallback en Vite; SPA fallback ya viene por defecto
  },

  // (Opcional) preview para producción local
  preview: {
    port: 4173
  }
})
