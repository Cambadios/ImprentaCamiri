import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PrimeReactProvider  } from 'primereact/api';
import { registerSW } from 'virtual:pwa-register'


import 'primereact/resources/primereact.min.css'; //core css
import 'primeicons/primeicons.css'; //icons



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrimeReactProvider value={{pt: {}, ptOptions:{mergeSections: true, mergeProps:true}  }}>
      <App/>
    </PrimeReactProvider>
  </React.StrictMode>,
)


const updateSW = registerSW({
  onNeedRefresh() {
    // opción rápida: refrescar de una
    if (confirm('Hay una nueva versión. ¿Actualizar ahora?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('La app está lista para funcionar sin conexión.')
  }
})
