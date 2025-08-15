import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login"; // Importa el componente Login
import Admin from "./pages/admin/Admin"; // Ruta al panel Admin
import UsuarioTabs from "./pages/maquinaria/Maquinaria"; // Ruta al panel de Usuario
import OlvideContrasena from "./pages/auth/OlvideContrasena"; // Ruta al formulario de Olvidé la contraseña
import RestablecerContrasena from "./pages/auth/RestablecerContrasena"; // Ruta al formulario de Restablecer la contraseña
import PrivateRoute from "./pages/auth/PrivateRoute"; // Ruta del componente PrivateRoute
import ClientesPages from "./pages/admin/clientes/ClientesPages";
import InventarioPage from "./pages/admin/inventario/InventarioPages";
import PedidoPage from "./pages/admin/pedidos/PedidosPages";
import ProductoPage from "./pages/admin/productos/ProductosPages";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> {/* Ruta al login */}
        <Route path="/login" element={<Login />} /> {/* Ruta al login */}
        <Route path="/olvide-contrasena" element={<OlvideContrasena />} />
        <Route path="/restablecer-contrasena/:token" element={<RestablecerContrasena />} />

        {/* Rutas protegidas para admin */}
        <Route element={<PrivateRoute roles={["admin", "administrador"]} />}>
          <Route path="/admin" element={<Admin />} > {/* Rutas dentro del admin */}
            <Route path="clientes" element={<ClientesPages />} /> 
            <Route path="inventario" element={<InventarioPage />} />
            <Route path="pedidos" element={<PedidoPage />} />
            <Route path="productos" element={<ProductoPage />} />
            {/* Aquí agregarías más rutas para otras vistas de admin */}
          </Route>
        </Route>

        {/* Rutas protegidas para usuario normal */}
        <Route element={<PrivateRoute roles={["usuario_normal"]} />}>
          <Route path="/maquinaria" element={<UsuarioTabs />} />
        </Route>
      </Routes>
    </Router>
  );
}
