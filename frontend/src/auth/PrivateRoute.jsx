import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, roles = [] }) {
  const role = localStorage.getItem("role");
  if (!role) return <Navigate to="/login" replace />;

  if (roles.length && !roles.map(r => r.toLowerCase()).includes(role.toLowerCase())) {
    // no autorizado por rol
    return <Navigate to="/login" replace />;
  }
  return children;
}
