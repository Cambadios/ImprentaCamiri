import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute({roles = [] }) {
  const role = localStorage.getItem("role");

  // Si no hay rol en el localStorage, redirige a login
  if (!role) return <Navigate to="/login" replace />;

  // Si el rol no está en la lista de roles permitidos, redirige a login
  if (roles.length && !roles.map(r => r.toLowerCase()).includes(role.toLowerCase())) {
    return <Navigate to="/login" replace />;
  }

  // Si pasa las validaciones, renderiza los niños (contenido protegido)
  return <Outlet>

  </Outlet>;
}
