import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";


export default function ProtectedRoute({ allowedRoles, anyPermission }) {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-6">Đang tải...</div>;

  if (!user)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );

  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/403" replace />;
  if (anyPermission && !hasPermission(...anyPermission))
    return <Navigate to="/403" replace />;

  return <Outlet />;
}
