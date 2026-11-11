import { useSelector } from "react-redux";

export function useAuth() {
  const { user, initializing } = useSelector((s) => s.auth);
  const hasPermission = (...codes) =>
    codes.some((c) => user?.permissions.includes(c));
  return { user, loading: initializing, hasPermission };
}
