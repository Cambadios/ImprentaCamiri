import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Login y recuperación de contraseña
import Login from "./login/Login";
import OlvideContrasena from "./login/OlvideContrasena";
import RestablecerContrasena from "./login/RestablecerContrasena";

// Paneles principales
import Principal from "./principal/Principal";
import Admin from "./admin/Admin";
import DashboardNuevo from "./dashboard/DashboardNuevo";

// Clientes
import ClienteForm from "./clientes/ClienteForm";
import ClienteList from "./clientes/ClienteList";

// Inventario
import InventarioForm from "./inventario/InventarioForm";
import InventarioList from "./inventario/InventarioList";

// Productos
import ProductoForm from "./producto/ProductoForm";
import ProductoList from "./producto/ProductoList";

// Pedidos
import PedidoForm from "./pedidos/PedidoForm";
import PedidoList from "./pedidos/PedidoList";

// Usuarios
import UsuarioForm from "./usuarios/UsuarioForm";
import UsuarioList from "./usuarios/UsuarioList";

// Reportes
import ReportePDF from "./reportes/ReportePDF";

// Layout que incluye la barra lateral
import Layout from './components/Layout';  // Componente de Layout con Sidebar

// ===== Guard de rutas (en el mismo archivo) =====
function PrivateRoute({ children, roles = [] }) {
  const role = localStorage.getItem("role");
  if (!role) return <Navigate to="/login" replace />;

  if (
    roles.length &&
    !roles.map((r) => r.toLowerCase()).includes(role.toLowerCase())
  ) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/olvide-contrasena" element={<OlvideContrasena />} />
      <Route
        path="/restablecer-contrasena/:token"
        element={<RestablecerContrasena />}
      />

      {/* Paneles protegidos */}
      <Route
        path="/"
        element={
          <PrivateRoute roles={["admin", "administrador"]}>
            <Layout /> {/* Usamos Layout para mostrar la barra lateral */}
          </PrivateRoute>
        }
      >
        <Route path="admin" element={<Admin />} />
        <Route path="principal" element={<Principal />} />
        <Route path="dashboard" element={<DashboardNuevo />} />

        {/* Clientes */}
        <Route path="clientes" element={<ClienteList />} />
        <Route path="clientes/agregar" element={<ClienteForm />} />
        <Route path="clientes/editar/:id" element={<ClienteForm />} />

        {/* Inventario */}
        <Route path="inventario" element={<InventarioList />} />
        <Route path="inventario/editar/:id" element={<InventarioForm />} />
        <Route path="inventario/agregar" element={<InventarioForm />} />

        {/* Productos */}
        <Route path="productos" element={<ProductoList />} />
        <Route path="productos/agregar" element={<ProductoForm />} />
        <Route path="productos/editar/:id" element={<ProductoForm />} />

        {/* Pedidos */}
        <Route path="pedidos" element={<PedidoList />} />
        <Route path="pedidos/agregar" element={<PedidoForm />} />
        <Route path="pedidos/editar/:id" element={<PedidoForm />} />

        {/* Usuarios */}
        <Route path="usuarios" element={<UsuarioList />} />
        <Route path="usuarios/agregar" element={<UsuarioForm />} />
        <Route path="usuarios/editar/:id" element={<UsuarioForm />} />

        {/* Reportes */}
        <Route path="reportes" element={<ReportePDF />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
