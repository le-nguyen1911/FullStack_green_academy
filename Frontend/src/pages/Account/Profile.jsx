import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/redux/slices/authSlice";

const Profile = () => {
  const { user, loading } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (loading) return <p className="p-6">Đang tải...</p>;
  if (!user) return null;

  const onLogout = async () => {
    await dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <p>
        Xin chào <strong>{user.full_name}</strong> (không phải {user.full_name}?{" "}
        <button onClick={onLogout} className="text-amber-900 underline">
          Thoát ra
        </button>{" "}
        và đăng nhập vào tài khoản của bạn)
      </p>

      <p className="text-stone-600">
        Từ trang quản lý tài khoản bạn có thể xem đơn hàng mới, quản lý địa chỉ
        giao hàng và thanh toán, và sửa mật khẩu và thông tin tài khoản.
      </p>
    </div>
  );
};

export default Profile;
