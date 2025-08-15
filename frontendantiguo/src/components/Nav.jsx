// src/components/Nav.jsx
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Nav(){
  const { user, logout } = useAuth()
  const isAdmin = user?.rol === 'admin'

  return (
    <nav className="nav">
      <div className="brand">🖨️ Imprenta Camiri</div>
      <div className="right">
        {/* usuario normal */}
        <Link className="btn ghost" to="/">Inicio</Link>
        <Link className="btn ghost" to="/clientes">Clientes</Link>
        <Link className="btn ghost" to="/mis-pedidos">Mis pedidos</Link>

        {/* solo admin */}
        {isAdmin && <>
          <Link className="btn ghost" to="/admin">Admin</Link>
          <Link className="btn ghost" to="/admin/usuarios">Usuarios</Link>
          <Link className="btn ghost" to="/admin/inventario">Inventario</Link>
          <Link className="btn ghost" to="/admin/productos">Productos</Link>
          <Link className="btn ghost" to="/admin/pedidos">Pedidos</Link>
          <Link className="btn ghost" to="/admin/reportes">Reportes</Link>
        </>}

        {user && <span className="badge">{user.rol}</span>}
        {user && <button className="btn" onClick={logout}>Salir</button>}
      </div>
    </nav>
  )
}
