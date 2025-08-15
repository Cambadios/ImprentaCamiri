// src/main.jsx
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'

// Asegura que exista el contenedor raíz en index.html
const container = document.getElementById('root')
if (!container) {
  throw new Error('No se encontró el elemento #root en index.html')
}

// Montaje React 18
const root = ReactDOM.createRoot(container)
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

// Registro del Service Worker (PWA)
const updateSW = registerSW({
  onNeedRefresh() {
    // Aquí podrías mostrar un toast de “Nueva versión disponible”
    // Por simplicidad, actualizamos de inmediato:
    updateSW(true)
  },
  onOfflineReady() {
    // Listo para trabajar offline (útil para log/devtools)
    console.log('PWA lista para uso offline')
  },
})
