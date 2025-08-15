import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

/* ===== Público ===== */
import Login from "./login/Login.jsx";
import OlvideContrasena from "./login/OlvideContrasena.jsx";
import RestablecerContrasena from "./login/RestablecerContrasena.jsx";

/* ===== Paneles principales (clásicos) ===== */
import Admin from "./admin/Admin.jsx";

/* ===== Layouts (clásicos) ===== */
import Layout from "./components/Layout.jsx";                   // Sidebar completa (beige - admin)
import LayoutPrincipal from "./components/LayoutPrincipal.jsx"; // Sidebar mini (azul - principal)

/* ===== VISTAS EN PESTAÑAS ===== */
import AdminTabs from "./pestanas/admin/AdminTabs.jsx";
import UsuarioTabs from "./pestanas/usuario/UsuarioTabs.jsx";

/* ===== COMPONENTES (según tu nueva estructura) ===== */
/* Admin: clientes */
import ClienteListAdmin from "./pestanas/admin/clientes/list.jsx";
import ClienteFormAdmin from "./pestanas/admin/clientes/form.jsx";
/* Admin: productos */
import ProductoListAdmin from "./pestanas/admin/productos/list.jsx";
import ProductoFormAdmin from "./pestanas/admin/productos/form.jsx";
/* Admin: inventario */
import InventarioListAdmin from "./pestanas/admin/inventario/list.jsx";
import InventarioFormAdmin from "./pestanas/admin/inventario/form.jsx";
/* Admin: pedidos */
import PedidoListAdmin from "./pestanas/admin/pedidos/list.jsx";
import PedidoFormAdmin from "./pestanas/admin/pedidos/form.jsx";
/* Admin: usuarios */
import UsuarioListAdmin from "./pestanas/admin/usuarios/list.jsx";
import UsuarioFormAdmin from "./pestanas/admin/usuarios/form.jsx";
/* Admin: reportes */
import ReporteAdmin from "./pestanas/admin/reportes/index.jsx";
/* Admin: dashboard */
import DashboardAdmin from "./pestanas/admin/dashboard/index.jsx";

/* Usuario (principal/azul) */
import ClienteListUsuario from "./pestanas/usuario/clientes/list.jsx";
import ClienteFormUsuario from "./pestanas/usuario/clientes/form.jsx";
import PedidoListUsuario from "./pestanas/usuario/pedidos/list.jsx";
import PedidoFormUsuario from "./pestanas/usuario/pedidos/form.jsx";
import DashboardUsuario from "./pestanas/usuario/DashboardUsuario.jsx";

/* ===== Guard de rutas ===== */
function PrivateRoute({ children, roles = [] }) {
  const role = localStorage.getItem("role");
  if (!role) return <Navigate to="/login" replace />;

  if (roles.length && !roles.map((r) => r.toLowerCase()).includes(role.toLowerCase())) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      {/* ===== Público ===== */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/olvide-contrasena" element={<OlvideContrasena />} />
      <Route path="/restablecer-contrasena/:token" element={<RestablecerContrasena />} />

      {/* ===================== */}
      {/*   VISTAS EN PESTAÑAS  */}
      {/* ===================== */}

      {/* Admin en pestañas (sin Layout; header propio) */}
      <Route
        path="/pestanas/admin"
        element={
          <PrivateRoute roles={["admin", "administrador"]}>
            <AdminTabs />
          </PrivateRoute>
        }
      />

      {/* Usuario en pestañas (sin Layout; header propio) */}
      <Route
        path="/pestanas/usuario"
        element={
          <PrivateRoute roles={["usuario"]}>
            <UsuarioTabs />
          </PrivateRoute>
        }
      />

      {/* ================================== */}
      {/*   MODO CLÁSICO CON TUS LAYOUTS     */}
      {/* ================================== */}

      {/* Principal (AZUL). Si quieres solo para "usuario", usa roles={["usuario"]} */}
      <Route
        element={
          <PrivateRoute>
            <LayoutPrincipal />
          </PrivateRoute>
        }
      >
        {/* Dashboard usuario (opcional) */}
        <Route path="/principal" element={<DashboardUsuario />} />

        {/* Clientes (usuario) */}
        <Route path="/clientes" element={<ClienteListUsuario />} />
        <Route path="/clientes/agregar" element={<ClienteFormUsuario />} />
        <Route path="/clientes/editar/:id" element={<ClienteFormUsuario />} />

        {/* Pedidos (usuario) */}
        <Route path="/pedidos" element={<PedidoListUsuario />} />
        <Route path="/pedidos/agregar" element={<PedidoFormUsuario />} />
        <Route path="/pedidos/editar/:id" element={<PedidoFormUsuario />} />
      </Route>

      {/* Admin (BEIGE) – requiere rol admin/administrador */}
      <Route
        element={
          <PrivateRoute roles={["admin", "administrador"]}>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/admin" element={<Admin />} />
        <Route path="/dashboard" element={<DashboardAdmin />} />

        {/* Admin: PEDIDOS */}
        <Route path="/admin/pedidos" element={<PedidoListAdmin />} />
        <Route path="/admin/pedidos/agregar" element={<PedidoFormAdmin />} />
        <Route path="/admin/pedidos/editar/:id" element={<PedidoFormAdmin />} />

        {/* Admin: INVENTARIO */}
        <Route path="/admin/inventario" element={<InventarioListAdmin />} />
        <Route path="/admin/inventario/agregar" element={<InventarioFormAdmin />} />
        <Route path="/admin/inventario/editar/:id" element={<InventarioFormAdmin />} />

        {/* Admin: CLIENTES */}
        <Route path="/admin/clientes" element={<ClienteListAdmin />} />
        <Route path="/admin/clientes/agregar" element={<ClienteFormAdmin />} />
        <Route path="/admin/clientes/editar/:id" element={<ClienteFormAdmin />} />

        {/* Admin: PRODUCTOS */}
        <Route path="/admin/productos" element={<ProductoListAdmin />} />
        <Route path="/admin/productos/agregar" element={<ProductoFormAdmin />} />
        <Route path="/admin/productos/editar/:id" element={<ProductoFormAdmin />} />

        {/* Admin: USUARIOS */}
        <Route path="/admin/usuarios" element={<UsuarioListAdmin />} />
        <Route path="/admin/usuarios/agregar" element={<UsuarioFormAdmin />} />
        <Route path="/admin/usuarios/editar/:id" element={<UsuarioFormAdmin />} />

        {/* Admin: REPORTES */}
        <Route path="/admin/reportes" element={<ReporteAdmin />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
