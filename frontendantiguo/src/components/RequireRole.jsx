// src/components/RequireRole.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RequireRole({ roles = [] }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles.length && !roles.includes(user.rol)) {
    // puedes redirigir a una página 403 si tienes una
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
