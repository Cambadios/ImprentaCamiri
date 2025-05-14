import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';  // Asegúrate de importar BrowserRouter
import App from './App';  // Asegúrate de que la ruta sea correcta

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>  {/* Aquí envolvemos toda la aplicación */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
