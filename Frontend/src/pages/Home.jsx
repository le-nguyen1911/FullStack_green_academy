import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isManagerRole } from "../util/roles";

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <section className="bg-stone-100 py-20 text-center px-4">
        <h1 className="text-4xl font-bold text-amber-900 mb-4">
          {user ? `Xin chào, ${user.full_name}` : "Cà phê nguyên chất"}
        </h1>
        <p className="text-stone-600 mb-8">Cà phê rang mộc, giao tận nơi.</p>
        <div className="flex justify-center gap-3">
          <Link
            to="/products"
            className="px-6 py-3 bg-amber-900 text-white rounded hover:bg-amber-800"
          >
            Xem sản phẩm
          </Link>
          {user && isManagerRole(user.role) && (
            <Link
              to="/manager"
              className="px-6 py-3 border border-amber-900 text-amber-900 rounded"
            >
              Vào trang quản lý
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
