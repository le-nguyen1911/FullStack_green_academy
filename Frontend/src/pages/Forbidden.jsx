import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";

export default function Forbidden() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-stone-200 p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
          <ShieldAlert size={44} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">403 Forbidden</h1>
          <h2 className="text-lg font-semibold text-stone-700">Không có quyền truy cập</h2>
          <p className="text-sm text-stone-500 leading-relaxed">
            Bạn không có đặc quyền quản trị viên (ADMIN) để truy cập vào khu vực này. Mọi thao tác quản lý phân quyền và người dùng đều được bảo mật.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-900 hover:bg-amber-800 text-white text-sm font-medium rounded-xl transition-colors no-underline!"
          >
            <ArrowLeft size={16} />
            Về Trang Chủ
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-stone-300 hover:bg-stone-100 text-stone-700 text-sm font-medium rounded-xl transition-colors"
          >
            <LogOut size={16} />
            Đổi tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}
