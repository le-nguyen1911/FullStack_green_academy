import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getRedirectAfterLogin } from "../util/roles";

export default function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (user)
    return (
      <Navigate
        to={getRedirectAfterLogin(user, location.state?.from)}
        replace
      />
    );
  return <Outlet />;
}
