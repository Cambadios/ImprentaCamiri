import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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
import AdminDashboardPage from "./pages/admin/dashboard/index.jsx";
import HomePages from "./pages/admin/home/HomePages.jsx";
import CategoriasPage from "./pages/admin/categorias/CategoriasPages.jsx";


// Maquinaria (asegúrate que estos archivos tienen export default)
import HomePagesMaquinaria from "./pages/maquinaria/home/HomePages.jsx";
import ClientesPageMaquinaria from "./pages/maquinaria/clientes/ClientesPagesMaquinaria.jsx";
import PedidosPageMaquinaria from "./pages/maquinaria/pedidos/PedidosPagesMaquinaria.jsx";
import InsumosPageMaquinaria from "./pages/maquinaria/insumos/InsumosPagesMaquinaria.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Público */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/olvide-contrasena" element={<OlvideContrasena />} />
        <Route
          path="/restablecer-contrasena/:token"
          element={<RestablecerContrasena />}
        />

        {/* ADMIN protegido */}
        <Route element={<PrivateRoute roles={["admin", "administrador"]} />}>
          <Route path="/admin" element={<Admin />}>
            <Route index element={<HomePages />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="clientes" element={<ClientesPages />} />
            <Route path="inventario" element={<InventarioPage />} />
            <Route path="pedidos" element={<PedidoPage />} />
            <Route path="productos" element={<ProductoPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="categorias" element={<CategoriasPage />} />
          </Route>
        </Route>

        {/* MAQUINARIA protegido */}
        <Route element={<PrivateRoute roles={["usuario_normal"]} />}>
          <Route path="/maquinaria" element={<MaquinariaTabs />}>
            {/* index -> Inicio del panel */}
            <Route index element={<HomePagesMaquinaria />} />
            <Route path="clientes" element={<ClientesPageMaquinaria />} />
            <Route path="pedidos" element={<PedidosPageMaquinaria />} />
            <Route path="insumos" element={<InsumosPageMaquinaria />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
