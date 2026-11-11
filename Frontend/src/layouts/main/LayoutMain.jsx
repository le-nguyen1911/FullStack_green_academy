import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../redux/slices/authSlice";
import { isManagerRole } from "../../util/roles";

export default function LayoutMain() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-6">
          <Link to="/" className="font-bold text-lg text-amber-900">
            THE COFFEE
          </Link>
          <nav className="flex gap-4">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? "text-amber-900 font-medium" : "text-stone-600"
              }
            >
              Sản phẩm
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-4 text-sm">
            {user ? (
              <>
                {isManagerRole(user.role) && (
                  <Link to="/manager" className="underline">
                    Quản lý
                  </Link>
                )}
                <Link
                  to="/account/profile  "
                  className="text-stone-600 hover:underline"
                >
                  Đổi mật khẩu
                </Link>
                <span>{user.full_name}</span>
                <button
                  onClick={() => dispatch(logout(), navigate("/login"))}
                  className="text-stone-500 hover:underline"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Đăng nhập</Link>
                <Link
                  to="/register"
                  className="px-3 py-1 bg-amber-900 text-white rounded"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-6 text-center text-sm text-stone-500">
        © Coffee Shop
      </footer>
    </div>
  );
}
