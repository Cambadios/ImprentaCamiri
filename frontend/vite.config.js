import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true // Esta opción asegura que todas las rutas sirvan index.html
  }
})
