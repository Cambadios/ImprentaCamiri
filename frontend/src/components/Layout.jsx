// src/components/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';  // Importa el Sidebar
import { Outlet } from 'react-router-dom'; // Para renderizar el contenido dinámico

const Layout = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Barra Lateral */}
      <Sidebar />

      {/* Contenido Principal */}
      <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
        <Outlet /> {/* Aquí se renderizarán las páginas hijas */}
      </div>
    </div>
  );
};

export default Layout;
