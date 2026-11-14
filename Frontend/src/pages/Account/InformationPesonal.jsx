import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Envelope, Map, Phone } from "@primeicons/react";
import { User } from "@primeicons/react/user";
import { InputGroup } from "@primereact/ui/inputgroup";
import { Button } from "@primereact/ui/button";
import { InputText } from "@primereact/ui/inputtext";

import api, { getError } from "@/util/axios";
import { useAuth } from "@/hooks/useAuth";
import { updateUser } from "@/redux/slices/authSlice";

const InformationPesonal = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({
    type: "",
    text: "",
  });

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const isChanged =
    formData.full_name !== (user?.full_name || "") ||
    formData.phone !== (user?.phone || "") ||
    formData.address !== (user?.address || "");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setProfileMsg({ type: "", text: "" });
  };

  const handleSave = async () => {
    setProfileMsg({ type: "", text: "" });
    setSaving(true);

    try {
      const { data } = await api.patch("/auth/me", {
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
      });

      dispatch(updateUser(data.user));

      setProfileMsg({
        type: "success",
        text: "Cập nhật thông tin thành công",
      });
    } catch (e) {
      setProfileMsg({
        type: "danger",
        text: getError(e),
      });
    } finally {
      setSaving(false);
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isChanged && !saving) handleSave();
        }}
      >
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
                onChange={handleChange}
              />
            </InputGroup.Root>
          </div>
        </div>

        {isChanged && (
          <div className="flex justify-end mt-4">
            <Button
              rounded
              type="submit"
              loading={saving}
              disabled={saving}
              className="bg-[#6f4e37]! border-none!"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default InformationPesonal;
