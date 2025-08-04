import React from "react";
import { Routes, Route } from "react-router-dom";

// Login y recuperación de contraseña
import Login from "./login/Login";
import OlvideContrasena from "./login/OlvideContrasena";
import RestablecerContrasena from "./login/RestablecerContrasena";

// Dashboard principal
import Principal from "./principal/principal";
import Admin from "./admin/Admin";
import Dashboard from "./dashboard/Dashboard";

// Clientes
import ClienteForm from "./clientes/ClienteForm";
import ClienteList from "./clientes/ClienteList";

// Pedidos
import PedidoForm from "./pedidos/PedidoForm";
import PedidoList from "./pedidos/PedidoList";

// Productos
import ProductoForm from "./producto/ProductoForm";
import ProductoList from "./producto/ProductoList";

// Inventario
import InventarioForm from "./inventario/InventarioForm";
import InventarioList from "./inventario/InventarioList";

// Usuarios
import UsuarioList from "./usuarios/UsuarioList";
import UsuarioForm from "./usuarios/UsuarioForm";

// Reportes
import ReportePDF from "./reportes/ReportePDF";

function App() {
  return (
    <Routes>
      {/* Login y recuperación */}
      <Route path="/" element={<Login />} />
      <Route path="/olvide-contrasena" element={<OlvideContrasena />} />
      <Route path="/restablecer-contrasena/:token" element={<RestablecerContrasena />} />

      {/* Paneles principales */}
      <Route path="/principal" element={<Principal />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Clientes */}
      <Route path="/clientes" element={<ClienteList />} />
      <Route path="/clientes/agregar" element={<ClienteForm />} />

      {/* Pedidos */}
      <Route path="/pedidos" element={<PedidoList />} />
      <Route path="/pedidos/agregar" element={<PedidoForm />} />

      {/* Productos */}
      <Route path="/productos" element={<ProductoList />} />
      <Route path="/productos/agregar" element={<ProductoForm />} />
      <Route path="/productos/editar/:id" element={<ProductoForm />} />

      {/* Inventario */}
      <Route path="/inventario" element={<InventarioList />} />
      <Route path="/inventario/agregar" element={<InventarioForm />} />
      <Route path="/inventario/editar/:id" element={<InventarioForm />} />

      {/* Usuarios */}
      <Route path="/usuarios" element={<UsuarioList />} />
      <Route path="/usuarios/agregar" element={<UsuarioForm />} />
      <Route path="/usuarios/editar/:id" element={<UsuarioForm />} />

      {/* Reportes */}
      <Route path="/reportes" element={<ReportePDF />} />
    </Routes>
  );
}

export default App;
