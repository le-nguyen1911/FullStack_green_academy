import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Check, Envelope, Map, Phone } from "@primeicons/react";
import { User } from "@primeicons/react/user";
import { Eye } from "@primeicons/react/eye";
import { EyeSlash } from "@primeicons/react/eye-slash";
import { Tag } from "@primereact/ui/tag";
import { InputGroup } from "@primereact/ui/inputgroup";
import { Button } from "@primereact/ui/button";
import { InputText } from "@primereact/ui/inputtext";
import { ProgressBar } from "@primereact/ui/progressbar";
import { IconField } from "@primereact/ui/iconfield";
import { InputPassword } from "@primereact/ui/inputpassword";
import api, { getError, setAccessToken } from "@/util/axios";
import { useAuth } from "@/hooks/useAuth";
import { forceLogout, updateUser } from "@/redux/slices/authSlice";

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

// Ô nhập mật khẩu có nút ẩn/hiện, dùng chung cho 3 ô
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

const InformationPesonal = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ----- Thông tin cá nhân -----
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });

  const fillForm = () =>
    setFormData({
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });

  useEffect(() => {
    if (user) fillForm();
  }, [user]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setProfileMsg({ type: "", text: "" });
    setSaving(true);
    try {
      const { data } = await api.patch("/auth/me", {
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
      });
      dispatch(updateUser(data.user)); // tên trên header đổi theo
      setProfileMsg({ type: "success", text: "Cập nhật thông tin thành công" });
      setIsEdit(false);
    } catch (e) {
      setProfileMsg({ type: "danger", text: getError(e) });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fillForm(); // bỏ thay đổi chưa lưu
    setProfileMsg({ type: "", text: "" });
    setIsEdit(false);
  };

  // ----- Đổi mật khẩu -----
  const [isChangepw, setIsChangepw] = useState(false);
  const [changing, setChanging] = useState(false);
  const [pwError, setPwError] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const level = getStrength(newPassword);
  const info = level ? strengthMap[level] : null;

  const resetPwForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwError("");
  };

  const handlerpw = async () => {
    setPwError("");
    if (!oldPassword) return setPwError("Vui lòng nhập mật khẩu cũ");
    if (newPassword.length < 8)
      return setPwError("Mật khẩu mới phải có ít nhất 8 ký tự");
    if (newPassword !== confirmPassword)
      return setPwError("Mật khẩu xác nhận không khớp");
    if (newPassword === oldPassword)
      return setPwError("Mật khẩu mới phải khác mật khẩu cũ");

    setChanging(true);
    try {
      // Server kiểm tra mật khẩu cũ, đổi mật khẩu và thu hồi mọi phiên đăng nhập
      await api.post("/auth/change-password", {
        currentPassword: oldPassword,
        newPassword,
        confirmPassword,
      });

      setAccessToken(null);
      localStorage.removeItem("hasSession");
      // navigate TRƯỚC dispatch để thông báo ở trang đăng nhập không bị ProtectedRoute ghi đè
      navigate("/login", {
        replace: true,
        state: { message: "Đổi mật khẩu thành công, hãy đăng nhập lại" },
      });
      dispatch(forceLogout());
    } catch (e) {
      setPwError(getError(e));
    } finally {
      setChanging(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <h3 className="fw-bold">Thông tin cá nhân</h3>

      {profileMsg.text && (
        <div className={`alert alert-${profileMsg.type}`}>
          {profileMsg.text}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="d-flex gap-2 mb-3">
          <Button
            rounded
            type="button"
            disabled={saving}
            className="bg-[#6f4e37]! border-none!"
            onClick={() => (isEdit ? handleSave() : setIsEdit(true))}
          >
            {saving ? "Đang lưu..." : isEdit ? "Lưu" : "Chỉnh sửa"}
          </Button>
          {isEdit && (
            <Button
              rounded
              type="button"
              severity="secondary"
              onClick={handleCancel}
            >
              Hủy
            </Button>
          )}
        </div>

        <div className="row g-3">
          <div className="col-12">
            <label className="mb-2 d-block">Tên người dùng</label>
            <InputGroup.Root>
              <InputGroup.Addon>
                <User />
              </InputGroup.Addon>
              <InputText
                name="full_name"
                value={formData.full_name}
                placeholder="Tên người dùng"
                disabled={!isEdit}
                onChange={handleChange}
              />
            </InputGroup.Root>
          </div>

          <div className="col-12 col-md-6">
            <label className="mb-2 d-block">Số điện thoại</label>
            <InputGroup.Root>
              <InputGroup.Addon>
                <Phone />
              </InputGroup.Addon>
              <InputText
                name="phone"
                value={formData.phone}
                placeholder="Số điện thoại"
                disabled={!isEdit}
                onChange={handleChange}
              />
            </InputGroup.Root>
          </div>

          <div className="col-12 col-md-6">
            <label className="mb-2 d-block">Email</label>
            <InputGroup.Root>
              <InputGroup.Addon>
                <Envelope />
              </InputGroup.Addon>
              {/* Email là khóa đăng nhập nên chỉ đọc */}
              <InputText name="email" value={formData.email} disabled />
            </InputGroup.Root>
          </div>

          <div className="col-12">
            <label className="mb-2 d-block">Địa chỉ</label>
            <InputGroup.Root>
              <InputGroup.Addon>
                <Map />
              </InputGroup.Addon>
              <InputText
                name="address"
                value={formData.address}
                placeholder="Địa chỉ"
                disabled={!isEdit}
                onChange={handleChange}
              />
            </InputGroup.Root>
          </div>
        </div>
      </form>

      <h3 className="fw-bold mt-5">Thay đổi mật khẩu</h3>

      <form className="mt-3" onSubmit={(e) => e.preventDefault()}>
        <div className="d-flex gap-2 mb-4">
          <Button
            rounded
            type="button"
            disabled={changing}
            className="bg-[#6f4e37]! border-none!"
            onClick={() => (isChangepw ? handlerpw() : setIsChangepw(true))}
          >
            {changing ? "Đang xử lý..." : isChangepw ? "Lưu" : "Đổi mật khẩu"}
          </Button>
          {isChangepw && (
            <Button
              rounded
              type="button"
              severity="secondary"
              onClick={() => {
                resetPwForm();
                setIsChangepw(false);
              }}
            >
              Hủy
            </Button>
          )}
        </div>

        {pwError && (
          <div className="alert alert-danger max-w-lg">{pwError}</div>
        )}

        <div className="flex flex-col gap-5 max-w-lg">
          <PasswordField
            label="Mật khẩu cũ"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            disabled={!isChangepw}
          />

          <div>
            <PasswordField
              label="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={!isChangepw}
            />
            {info && (
              <div className="mt-3">
                <ProgressBar.Root value={info.percent}>
                  <ProgressBar.Track style={{ height: "6px" }}>
                    <ProgressBar.Indicator
                      style={{ backgroundColor: info.color }}
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
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!isChangepw}
            />
            {confirmPassword && newPassword === confirmPassword && (
              <small className="text-success flex items-center gap-1 mt-2">
                <Check size={16} /> Mật khẩu khớp
              </small>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default InformationPesonal;
