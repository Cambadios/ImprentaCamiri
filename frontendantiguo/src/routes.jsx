// src/routes.jsx
import { createBrowserRouter, Outlet } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import RequireRole from './components/RequireRole'
import Layout from './components/Layout'
import { endpoints } from './api/endpoints'


// ADMIN
import AdminHome from './pestanas/admin/dashboard/index.jsx'
import AdminUsuariosList from './pestanas/admin/usuarios/list.jsx'
import AdminInventarioList from './pestanas/admin/inventario/list.jsx'
import AdminProductosList from './pestanas/admin/productos/list.jsx'
import AdminPedidosList from './pestanas/admin/pedidos/list.jsx'
import AdminReportes from './pestanas/admin/reportes/index.jsx'

// USUARIO
import UserHome from './pestanas/usuario/dashboard/index.jsx'
import UserClientesList from './pestanas/usuario/clientes/list.jsx'
import UserPedidosList from './pestanas/usuario/pedidos/list.jsx'

// Auth
import Login from './pages/Login.jsx' // si ya lo tienes

function Shell(){
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

export const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: '/login', element: <Login /> },

      // ZONA PROTEGIDA
      {
        element: <ProtectedRoute />,
        children: [
          // Layout común (navbar, etc.)
          {
            element: <Layout />,
            children: [
              // HOME según rol (si quieres, puedes detectar dentro del componente)
              { index: true, element: <UserHome /> },

              // Rutas de USUARIO normal
              { path: '/clientes', element: <UserClientesList /> },
              { path: '/mis-pedidos', element: <UserPedidosList /> },

              // Rutas SOLO ADMIN
              {
                path: '/admin',
                element: <RequireRole roles={["admin"]} />,
                children: [
                  { index: true, element: <AdminHome /> },
                  { path: 'usuarios', element: <AdminUsuariosList /> },
                  { path: 'inventario', element: <AdminInventarioList /> },
                  { path: 'productos', element: <AdminProductosList /> },
                  { path: 'pedidos', element: <AdminPedidosList /> },
                  { path: 'reportes', element: <AdminReportes /> },
                ]
              },
            ]
          }
        ]
      },
    ]
  }
])
