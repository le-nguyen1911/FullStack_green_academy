import React, { useEffect, useState } from "react";
import { login, clearLoginError } from "../redux/slices/authSlice";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Eye } from "@primeicons/react/eye";
import { EyeSlash } from "@primeicons/react/eye-slash";
import { IconField } from "@primereact/ui/iconfield";
import { InputPassword } from "@primereact/ui/inputpassword";

const Login = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { loginStatus, loginError } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [mask, setMask] = useState(true);

  const notice = location.state?.message;

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login(form)).unwrap();
      navigate("/", { replace: true });
    } catch (error) {
      console.log("Đăng nhập thất bại:", error);
    }
  };
  useEffect(() => {
    dispatch(clearLoginError());
  }, [dispatch]);
  return (
    <div className='bg-[url("./assets/bg-login.jpg")] bg-cover bg-center min-h-screen w-full flex items-center justify-center p-4'>
      <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl border border-white/30 flex flex-col gap-5 w-full max-w-[400px] shadow-xl">
        <h2 className="text-white font-bold text-3xl text-center">Login</h2>

        {notice && <p className="text-green-200 text-center">{notice}</p>}

        <form onSubmit={onSubmit} className="w-full space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-white">
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="Nhập email"
              autoComplete="username"
              required
              className="w-full p-3 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#D4A373]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-white">
              Mật khẩu
            </label>

            <IconField.Root className="w-full relative flex items-center">
              <InputPassword
                id="password"
                name="password"
                mask={mask}
                value={form.password}
                onChange={onChange}
                placeholder="Nhập mật khẩu"
                required
                className="w-full p-3 pr-10 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#D4A373]"
              />

              <IconField.Inset className="text-gray-600 cursor-pointer">
                {mask ? (
                  <Eye onClick={() => setMask(false)} />
                ) : (
                  <EyeSlash onClick={() => setMask(true)} />
                )}
              </IconField.Inset>
            </IconField.Root>
          </div>

          {loginError && (
            <p className="text-red-200 text-md text-center">{loginError}</p>
          )}

          <button
            type="submit"
            disabled={loginStatus === "loading"}
            className="w-full p-3 bg-[#6f4e37] text-white font-semibold rounded-xl! hover:bg-[#563b29] transition-all duration-300 disabled:opacity-50"
          >
            {loginStatus === "loading" ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
        <div className="flex justify-between ">
          <Link
            className="no-underline! text-white! hover:text-[#D4A373]!"
            to="/register"
          >
            Đăng ký
          </Link>
          <Link
            className="no-underline! text-white! hover:text-[#D4A373]!"
            to="/forgot-password"
          >
            Quên Mật khẩu
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Login;
