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
        path="/admin"
        element={
          <PrivateRoute roles={["admin", "administrador"]}>
            <Admin />
          </PrivateRoute>
        }
      />
      <Route
        path="/principal"
        element={
          <PrivateRoute roles={["usuario", "usuario_normal", "admin", "administrador"]}>
            <Principal />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute roles={["admin", "administrador", "usuario", "usuario_normal"]}>
            <DashboardNuevo />
          </PrivateRoute>
        }
      />

      {/* Clientes */}
      <Route
        path="/clientes"
        element={
          <PrivateRoute roles={["admin", "administrador", "usuario", "usuario_normal"]}>
            <ClienteList />
          </PrivateRoute>
        }
      />
      <Route
        path="/clientes/agregar"
        element={
          <PrivateRoute roles={["admin", "administrador"]}>
            <ClienteForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/clientes/editar/:id"
        element={
          <PrivateRoute roles={["admin", "administrador"]}>
            <ClienteForm />
          </PrivateRoute>
        }
      />

      {/* Inventario */}
      <Route
        path="/inventario"
        element={
          <PrivateRoute roles={["admin", "administrador", "usuario", "usuario_normal"]}>
            <InventarioList />
          </PrivateRoute>
        }
      />
      <Route
        path="/inventario/editar/:id"
        element={
          <PrivateRoute roles={["admin", "administrador"]}>
            <InventarioForm />
          </PrivateRoute>
        }
      />

      {/* Productos */}
      <Route
        path="/productos"
        element={
          <PrivateRoute roles={["admin", "administrador", "usuario", "usuario_normal"]}>
            <ProductoList />
          </PrivateRoute>
        }
      />
      <Route
        path="/productos/agregar"
        element={
          <PrivateRoute roles={["admin", "administrador"]}>
            <ProductoForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/productos/editar/:id"
        element={
          <PrivateRoute roles={["admin", "administrador"]}>
            <ProductoForm />
          </PrivateRoute>
        }
      />

      {/* Pedidos */}
      <Route
        path="/pedidos"
        element={
          <PrivateRoute roles={["admin", "administrador", "usuario", "usuario_normal"]}>
            <PedidoList />
          </PrivateRoute>
        }
      />
      <Route
        path="/pedidos/agregar"
        element={
          <PrivateRoute roles={["admin", "administrador", "usuario", "usuario_normal"]}>
            <PedidoForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/pedidos/editar/:id"
        element={
          <PrivateRoute roles={["admin", "administrador"]}>
            <PedidoForm />
          </PrivateRoute>
        }
      />

      {/* Usuarios */}
      <Route
        path="/usuarios"
        element={
          <PrivateRoute roles={["admin", "administrador"]}>
            <UsuarioList />
          </PrivateRoute>
        }
      />
      <Route
        path="/usuarios/agregar"
        element={
          <PrivateRoute roles={["admin", "administrador"]}>
            <UsuarioForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/usuarios/editar/:id"
        element={
          <PrivateRoute roles={["admin", "administrador"]}>
            <UsuarioForm />
          </PrivateRoute>
        }
      />

      {/* Reportes */}
      <Route
        path="/reportes"
        element={
          <PrivateRoute roles={["admin", "administrador", "usuario", "usuario_normal"]}>
            <ReportePDF />
          </PrivateRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
