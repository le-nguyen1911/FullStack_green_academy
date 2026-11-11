import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../util/axios";
import { Button } from "@/components/ui/button";
import { InputOtp } from "@/components/ui/inputotp";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onChange = (e) => {
    setEmail(e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", {
        email,
      });

      setMessage(res.data.message);
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };
  const onVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/verify-reset-otp", {
        email,
        otp,
      });

      navigate("/reset-password", {
        state: { email, otp },
      });
    } catch (err) {
      setError(err.response?.data?.message || "OTP không hợp lệ");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className='bg-[url("./assets/bg-login.jpg")] bg-cover bg-center min-h-screen w-full flex items-center justify-center p-4'>
      <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl border border-white/30 flex flex-col gap-5 w-full max-w-[400px] shadow-xl">
        <h2 className="text-white font-bold text-3xl text-center">
          Quên mật khẩu
        </h2>

        <p className="text-white/80! text-sm text-center h4">
          Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
        </p>

        {step === "email" ? (
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-white">
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="Nhập email"
                autoComplete="email"
                required
                className="w-full p-3 rounded-lg outline-none bg-white"
              />
            </div>
            <button
              type="submit"
              className=" mt-3 w-full p-3 bg-[#6f4e37] text-white font-semibold rounded-xl! hover:bg-[#563b29] transition-all duration-300 disabled:opacity-50"
            >
              Gửi OTP
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-10 justify-between">
            <div>
              <div className="font-bold text-white text-lg">
                Check your email for OTP
              </div>

              <div className="text-white/70 mt-1">
                Vui lòng nhập mã 6 chữ số đã gửi đến địa chỉ email của bạn
              </div>
            </div>

            <InputOtp
              length={6}
              value={otp}
              onChange={setOtp}
              disabled={loading}
            />

            {error && <p className="text-red-200 text-center">{error}</p>}

            <Button
              className="w-full"
              disabled={loading || otp.length !== 6}
              onClick={onVerifyOTP}
            >
              {loading ? "Đang xác minh..." : "Verify OTP"}
            </Button>
          </div>
        )}

        <div className="flex justify-center">
          <Link
            className="no-underline! text-white! hover:text-[#D4A373]!"
            to="/login"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
