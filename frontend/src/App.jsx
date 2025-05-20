// src/App.jsx
import React from "react";
import { Routes, Route } from 'react-router-dom';

import Login from "./login/Login";
import Principal from "./principal/principal";
import Admin from "./admin/Admin";
import Dashboard from "./dashboard/DashboardProductos";  // Importa el dashboard
import ClienteForm from "./clientes/ClienteForm";
import ClienteList from "./clientes/ClienteList";
import PedidoForm from "./pedidos/PedidoForm";
import PedidoList from "./pedidos/PedidoList";
import ProductoForm from './inventario/ProductoForm';
import ProductoList from './inventario/ProductoList';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/principal" element={<Principal />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/dashboard" element={<Dashboard />} />  {/* Nueva ruta para dashboard */}
      <Route path="/clientes" element={<ClienteList />} />
      <Route path="/clientes/agregar" element={<ClienteForm />} />
      <Route path="/pedidos" element={<PedidoList />} />
      <Route path="/pedidos/agregar" element={<PedidoForm />} />
      <Route path="/inventario" element={<ProductoList />} />
      <Route path="/inventario/agregar" element={<ProductoForm />} />
    </Routes>
  );
}

export default App;
