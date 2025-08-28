import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";

import Admin from "./pages/admin/Admin";
import MaquinariaTabs from "./pages/maquinaria/Maquinaria.jsx"; // layout de Maquinaria

import OlvideContrasena from "./pages/auth/OlvideContrasena";
import RestablecerContrasena from "./pages/auth/RestablecerContrasena";
import PrivateRoute from "./pages/auth/PrivateRoute";

import ClientesPages from "./pages/admin/clientes/ClientesPages";
import InventarioPage from "./pages/admin/inventario/InventarioPages";
import PedidoPage from "./pages/admin/pedidos/PedidosPages";
import ProductoPage from "./pages/admin/productos/ProductosPages";
import UsuariosPage from "./pages/admin/usuarios/UsuariosPages";
import Reportes from "./pages/admin/reportes/Reportes.jsx";


// Maquinaria (asegúrate que estos archivos tienen export default)
import ClientesPageMaquinaria from "./pages/maquinaria/clientes/ClientesPagesMaquinaria.jsx";
import PedidosPageMaquinaria  from "./pages/maquinaria/pedidos/PedidosPagesMaquinaria.jsx";
import InsumosPageMaquinaria  from "./pages/maquinaria/insumos/InsumosPagesMaquinaria.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Público */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/olvide-contrasena" element={<OlvideContrasena />} />
        <Route path="/restablecer-contrasena/:token" element={<RestablecerContrasena />} />

        {/* ADMIN protegido */}
        <Route element={<PrivateRoute roles={["admin", "administrador"]} />}>
          <Route path="/admin" element={<Admin />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<div>Dashboard (placeholder)</div>} />
            <Route path="clientes" element={<ClientesPages />} />
            <Route path="inventario" element={<InventarioPage />} />
            <Route path="pedidos" element={<PedidoPage />} />
            <Route path="productos" element={<ProductoPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="reportes" element={<div>Reportes (placeholder)</div>} />
          </Route>
        </Route>

        {/* MAQUINARIA protegido */}
        <Route element={<PrivateRoute roles={["usuario_normal"]} />}>
          <Route path="/maquinaria" element={<MaquinariaTabs />}>
            {/* index -> Inicio del panel */}
            <Route index element={<div>Panel operativo (bandeja, incidencias, historial, notas)…</div>} />
            <Route path="clientes" element={<ClientesPageMaquinaria />} />
            <Route path="pedidos"  element={<PedidosPageMaquinaria />} />
            <Route path="insumos"  element={<InsumosPageMaquinaria />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
