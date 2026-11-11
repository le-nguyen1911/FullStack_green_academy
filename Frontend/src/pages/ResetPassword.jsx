import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../util/axios";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;
  const otp = location.state?.otp;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email || !otp) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[url('./assets/bg-login.jpg')] bg-cover bg-center p-4">
        <div className="w-full max-w-[400px] rounded-2xl border border-white/30 bg-white/20 p-8 text-center shadow-xl backdrop-blur-md">
          <h2 className="text-2xl font-bold text-white">
            Phiên đặt lại mật khẩu không hợp lệ
          </h2>

          <p className="mt-3 text-white/80">
            Vui lòng xác minh OTP trước khi đặt lại mật khẩu.
          </p>

          <Link
            to="/forgot-password"
            className="mt-5 inline-block font-semibold text-white underline hover:text-[#D4A373]"
          >
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
        confirmPassword,
      });

      setMessage(res.data.message || "Đặt lại mật khẩu thành công!");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập.",
          },
        });
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('./assets/bg-login.jpg')] bg-cover bg-center p-4">
      <div className="flex w-full max-w-[420px] flex-col gap-6 rounded-2xl border border-white/30 bg-white/20 p-8 shadow-xl backdrop-blur-md">
        {/* Heading */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white">
            <LockKeyhole size={28} />
          </div>

          <h2 className="text-center text-3xl font-bold text-white">
            Đặt lại mật khẩu
          </h2>

          <p className="mt-2 text-sm text-white/80">
            Tạo mật khẩu mới để tiếp tục sử dụng tài khoản của bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="newPassword" className="font-medium text-white">
              Mật khẩu mới
            </label>

            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={loading}
                className="w-full rounded-lg bg-white p-3 pr-12 text-[#563b29] outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#D4A373]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#6f4e37]"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <p className="text-xs text-white/70">
              Mật khẩu phải có ít nhất 8 ký tự.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="font-medium text-white">
              Xác nhận mật khẩu
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
                required
                disabled={loading}
                className="w-full rounded-lg bg-white p-3 pr-12 text-[#563b29] outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#D4A373]"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#6f4e37]"
                aria-label={
                  showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                }
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-300/40 bg-red-500/20 p-3 text-center text-sm text-red-100">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-lg border border-green-300/40 bg-green-500/20 p-3 text-center text-sm text-green-100">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#6f4e37] p-3 font-semibold text-white transition-all duration-300 hover:bg-[#563b29] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
          </button>
        </form>

        <div className="flex justify-center">
          <Link
            to="/login"
            className="text-white no-underline transition-colors hover:text-[#D4A373]"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
