import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Check } from "@primeicons/react";
import { Eye } from "@primeicons/react/eye";
import { EyeSlash } from "@primeicons/react/eye-slash";

import { Tag } from "@primereact/ui/tag";
import { Button } from "@primereact/ui/button";
import { ProgressBar } from "@primereact/ui/progressbar";
import { IconField } from "@primereact/ui/iconfield";
import { InputPassword } from "@primereact/ui/inputpassword";

import api, { getError, setAccessToken } from "@/util/axios";
import { forceLogout } from "@/redux/slices/authSlice";

const strengthMap = {
  weak: {
    label: "Yếu",
    percent: 25,
    color: "var(--p-red-400)",
    severity: "danger",
  },
  medium: {
    label: "Trung bình",
    percent: 50,
    color: "var(--p-amber-400)",
    severity: "warn",
  },
  strong: {
    label: "Mạnh",
    percent: 75,
    color: "var(--p-blue-400)",
    severity: "info",
  },
  "very-strong": {
    label: "Rất mạnh",
    percent: 100,
    color: "var(--p-emerald-400)",
    severity: "success",
  },
};

function getStrength(value) {
  if (!value) return null;

  let score = 0;

  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^a-zA-Z0-9]/.test(value)) score++;

  if (score <= 1) return "weak";
  if (score <= 2) return "medium";
  if (score <= 3) return "strong";

  return "very-strong";
}

function PasswordField({ label, value, onChange, disabled }) {
  const [mask, setMask] = useState(true);

  return (
    <div>
      <label className="block mb-2 font-medium">{label}</label>

      <IconField.Root className="w-full">
        <InputPassword
          value={value}
          onChange={onChange}
          mask={mask}
          onMaskChange={(e) => setMask(e.value)}
          disabled={disabled}
          className="w-full"
        />

        <IconField.Inset>
          {mask ? (
            <Eye
              size={18}
              className="cursor-pointer"
              onClick={() => setMask(false)}
            />
          ) : (
            <EyeSlash
              size={18}
              className="cursor-pointer"
              onClick={() => setMask(true)}
            />
          )}
        </IconField.Inset>
      </IconField.Root>
    </div>
  );
}

export default function ChangePassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [changing, setChanging] = useState(false);
  const [pwError, setPwError] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const level = getStrength(newPassword);
  const info = level ? strengthMap[level] : null;

  const hasInput =
    oldPassword !== "" || newPassword !== "" || confirmPassword !== "";

  const resetPwForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwError("");
  };

  const handlePasswordChange = (setter) => (e) => {
    setter(e.target.value);
    setPwError("");
  };

  const handleCancel = () => {
    resetPwForm();
  };

  const handleChangePassword = async () => {
    setPwError("");

    if (!oldPassword) {
      return setPwError("Vui lòng nhập mật khẩu cũ");
    }

    if (newPassword.length < 8) {
      return setPwError("Mật khẩu mới phải có ít nhất 8 ký tự");
    }

    if (newPassword !== confirmPassword) {
      return setPwError("Mật khẩu xác nhận không khớp");
    }

    if (newPassword === oldPassword) {
      return setPwError("Mật khẩu mới phải khác mật khẩu cũ");
    }

    setChanging(true);

    try {
      await api.post("/auth/change-password", {
        currentPassword: oldPassword,
        newPassword,
        confirmPassword,
      });

      setAccessToken(null);
      localStorage.removeItem("hasSession");

      navigate("/login", {
        replace: true,
        state: {
          message: "Đổi mật khẩu thành công, hãy đăng nhập lại",
        },
      });

      dispatch(forceLogout());
    } catch (e) {
      setPwError(getError(e));
    } finally {
      setChanging(false);
    }
  };

  return (
    <section>
      <h3 className="fw-bold mt-5">Thay đổi mật khẩu</h3>

      {pwError && <div className="alert alert-danger max-w-lg">{pwError}</div>}

      <form
        className="max-w-lg"
        onSubmit={(e) => {
          e.preventDefault();
          if (hasInput && !changing) {
            handleChangePassword();
          }
        }}
      >
        <div className="flex flex-col gap-3">
          <PasswordField
            label="Mật khẩu cũ"
            value={oldPassword}
            onChange={handlePasswordChange(setOldPassword)}
            disabled={changing}
          />
          <div>
            <PasswordField
              label="Mật khẩu mới"
              value={newPassword}
              onChange={handlePasswordChange(setNewPassword)}
              disabled={changing}
            />
            {info && (
              <div className="mt-3">
                <ProgressBar.Root value={info.percent}>
                  <ProgressBar.Track style={{ height: "6px" }}>
                    <ProgressBar.Indicator
                      style={{
                        backgroundColor: info.color,
                      }}
                    />
                  </ProgressBar.Track>
                </ProgressBar.Root>

                <div className="flex justify-end mt-2">
                  <Tag severity={info.severity}>{info.label}</Tag>
                </div>
              </div>
            )}
          </div>
          <div>
            <PasswordField
              label="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={handlePasswordChange(setConfirmPassword)}
              disabled={changing}
            />

            {confirmPassword && newPassword === confirmPassword && (
              <small className="text-success flex items-center gap-1 mt-2">
                <Check size={16} />
                Mật khẩu khớp
              </small>
            )}
          </div>
        </div>
        {hasInput && (
          <div className="flex justify-end gap-2 mt-4">
            <Button
              rounded
              type="button"
              severity="secondary"
              disabled={changing}
              onClick={handleCancel}
            >
              Hủy
            </Button>
            <Button
              rounded
              type="submit"
              disabled={changing}
              loading={changing}
              className="bg-[#6f4e37]! border-none!"
            >
              {changing ? "Đang xử lý..." : "Lưu thay đổi"}
            </Button>
          </div>
        )}
      </form>
    </section>
  );
}
