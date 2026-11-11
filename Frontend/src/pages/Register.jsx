import { useState } from "react";
import { register } from "../redux/slices/authSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { InputText } from "@primereact/ui/inputtext";
import { Label } from "@primereact/ui/label";
import { Check, Eye, EyeSlash, Lock, Times } from "@primeicons/react";
import { Chip } from "@primereact/ui/chip";
import { IconField } from "@primereact/ui/iconfield";
import { InputPassword } from "@primereact/ui/inputpassword";

const rules = [
  { label: "8 ký tự trở lên", test: (v) => v.length >= 8 },
  { label: "Số", test: (v) => /\d/.test(v) },
  { label: "Chữ in hoa", test: (v) => /[A-Z]/.test(v) },
  { label: "Ký tự đặc biệt", test: (v) => /[^a-zA-Z0-9]/.test(v) },
];

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { registerStatus, registerError } = useSelector((state) => state.auth);

  const [visible, setVisible] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const notice = location.state?.message;

  const passwordValid = rules.every((rule) => rule.test(form.password));

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log(form);

    if (!passwordValid) {
      return;
    }

    try {
      await dispatch(
        register({
          ...form,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
        }),
      ).unwrap();

      navigate("/login", {
        replace: true,
        state: {
          message: "Đăng ký thành công. Vui lòng đăng nhập!",
        },
      });
    } catch (error) {
      console.error("Đăng ký thất bại:", error);
    }
  };

  return (
    <div className='bg-[url("./assets/bg-login.jpg")] bg-cover bg-center min-h-screen w-full flex items-center justify-center p-4'>
      <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl border border-white/30 flex flex-col gap-5 w-full max-w-[400px] shadow-xl">
        <h2 className="text-white font-bold text-3xl text-center">Register</h2>

        {notice && <p className="text-green-200 text-center">{notice}</p>}

        <form onSubmit={onSubmit} className="w-full space-y-4">
          {/* Full name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="full_name" className="text-white">
              Tên người dùng
            </Label>

            <InputText
              id="full_name"
              name="full_name"
              value={form.full_name}
              onChange={onChange}
              placeholder="Nhập tên người dùng"
              className="p-3 w-full"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>

            <InputText
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="Nhập email"
              autoComplete="username"
              className="p-3 w-full"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="text-white">
              Số điện thoại
            </Label>

            <InputText
              id="phone"
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="Nhập số điện thoại"
              className="p-3 w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="address" className="text-white">
              Địa chỉ
            </Label>

            <InputText
              id="address"
              name="address"
              value={form.address}
              onChange={onChange}
              placeholder="Nhập địa chỉ"
              className="p-3 w-full"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-white">
              Mật khẩu
            </Label>

            <IconField.Root>
              <InputPassword
                id="password"
                name="password"
                fluid
                mask={!visible}
                value={form.password}
                onInput={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="p-3"
                required
              />

              <IconField.Inset
                className="cursor-pointer"
                onClick={() => setVisible((v) => !v)}
              >
                {visible ? (
                  <EyeSlash className="size-4!" />
                ) : (
                  <Eye className="size-4!" />
                )}
              </IconField.Inset>
            </IconField.Root>

            {/* Password rules */}
            <div className="mt-4 flex items-center flex-wrap gap-1.5">
              {rules.map((rule) => {
                const passed = rule.test(form.password);

                return (
                  <Chip.Root
                    key={rule.label}
                    variant="outlined"
                    className={
                      passed
                        ? "text-green-600 dark:text-green-400"
                        : "text-surface-500 dark:text-surface-400"
                    }
                  >
                    <Chip.Start>
                      <span
                        className={`size-4 inline-flex items-center justify-center rounded-full ${
                          passed
                            ? "bg-green-600 text-white"
                            : "bg-surface-200 text-surface-500"
                        }`}
                      >
                        {passed ? (
                          <Check className="size-3!" />
                        ) : (
                          <Times className="size-3!" />
                        )}
                      </span>
                    </Chip.Start>

                    <Chip.Label>{rule.label}</Chip.Label>
                  </Chip.Root>
                );
              })}
            </div>
          </div>

          {registerError && (
            <p className="text-red-200 text-sm text-center">{registerError}</p>
          )}

          <button
            type="submit"
            disabled={registerStatus === "loading" || !passwordValid}
            className="w-full p-3 bg-[#6f4e37] text-white font-semibold rounded-xl! hover:bg-[#563b29] transition-all duration-300 disabled:opacity-50"
          >
            {registerStatus === "loading" ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
