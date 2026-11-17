const AppError = require("../utils/AppError");
const userModel = require("../models/user.model");
const roleModel = require("../models/role.model");
const refreshTokenModel = require("../models/refreshToken.model");
const { clearPermissionCache } = require("./permission.service");

const VALID_STATUSES = ["ACTIVE", "LOCKED", "DEACTIVATED"];

const isSuperAdmin = (role) => role === "SUPER_ADMIN";

const getOne = async (id, currentUserRole) => {
  const user = await userModel.adminFindById(id);

  if (!user) {
    throw new AppError(404, "Không tìm thấy người dùng");
  }

  // ADMIN không được xem tài khoản SUPER_ADMIN
  if (user.role_name === "SUPER_ADMIN" && !isSuperAdmin(currentUserRole)) {
    throw new AppError(404, "Không tìm thấy người dùng");
  }

  return user;
};

const list = async (query = {}, currentUserRole) => {
  const { q, roleId, status, page, limit } = query;

  if (status && !VALID_STATUSES.includes(status)) {
    throw new AppError(400, "Trạng thái người dùng không hợp lệ");
  }

  if (roleId) {
    const role = await roleModel.findById(roleId);

    if (!role) {
      throw new AppError(404, "Không tìm thấy vai trò");
    }

    if (role.name === "SUPER_ADMIN" && !isSuperAdmin(currentUserRole)) {
      throw new AppError(404, "Không tìm thấy vai trò");
    }
  }

  return userModel.adminList({
    q,
    roleId,
    status,
    page,
    limit,
    excludeSuperAdmin: !isSuperAdmin(currentUserRole),
  });
};

const update = async (id, data = {}, currentUserRole) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError(400, "Dữ liệu cập nhật không hợp lệ");
  }

  const user = await getOne(id, currentUserRole);

  const full_name =
    data.full_name === undefined
      ? user.full_name
      : typeof data.full_name === "string"
        ? data.full_name.trim()
        : "";

  const phone =
    data.phone === undefined
      ? user.phone
      : data.phone === null
        ? null
        : typeof data.phone === "string"
          ? data.phone.trim()
          : "";

  const address =
    data.address === undefined
      ? user.address
      : data.address === null
        ? null
        : typeof data.address === "string"
          ? data.address.trim()
          : "";

  if (!full_name) {
    throw new AppError(400, "Họ tên không được để trống");
  }

  if (full_name.length > 100) {
    throw new AppError(400, "Họ tên tối đa 100 ký tự");
  }

  if (phone && !/^[0-9+\-\s]{8,20}$/.test(phone)) {
    throw new AppError(400, "Số điện thoại không hợp lệ");
  }

  if (address && address.length > 255) {
    throw new AppError(400, "Địa chỉ tối đa 255 ký tự");
  }

  await userModel.adminUpdate(id, {
    full_name,
    phone,
    address,
  });

  return getOne(id, currentUserRole);
};

const updateRole = async (id, roleId, currentUserId, currentUserRole) => {
  if (!roleId) {
    throw new AppError(400, "Vui lòng chọn vai trò");
  }

  if (id === currentUserId) {
    throw new AppError(400, "Không thể tự thay đổi vai trò của chính mình");
  }

  const target = await getOne(id, currentUserRole);
  const role = await roleModel.findById(roleId);

  if (!role) {
    throw new AppError(404, "Không tìm thấy vai trò");
  }

  if (
    (target.role_name === "SUPER_ADMIN" || role.name === "SUPER_ADMIN") &&
    !isSuperAdmin(currentUserRole)
  ) {
    throw new AppError(403, "Chỉ SUPER_ADMIN được quản lý vai trò SUPER_ADMIN");
  }

  if (target.role_name === "ADMIN" && currentUserRole !== "SUPER_ADMIN") {
    throw new AppError(403, "Chỉ SUPER_ADMIN được thay đổi tài khoản ADMIN");
  }

  if (role.name === "ADMIN" && currentUserRole !== "SUPER_ADMIN") {
    throw new AppError(403, "Chỉ SUPER_ADMIN được gán vai trò ADMIN");
  }

  await userModel.adminUpdateRole(id, roleId);

  clearPermissionCache(id);
  await refreshTokenModel.deleteByUser(id);

  return getOne(id, currentUserRole);
};

const setStatus = async (id, status, currentUserId, currentUserRole) => {
  if (!VALID_STATUSES.includes(status)) {
    throw new AppError(400, `Trạng thái phải là ${VALID_STATUSES.join(", ")}`);
  }

  if (id === currentUserId && status !== "ACTIVE") {
    throw new AppError(
      400,
      "Không thể tự khóa hoặc vô hiệu hóa tài khoản của chính mình",
    );
  }

  const user = await getOne(id, currentUserRole);

  if (user.status === status) {
    return user;
  }

  await userModel.adminSetStatus(id, status);

  clearPermissionCache(id);

  if (status !== "ACTIVE") {
    await refreshTokenModel.deleteByUser(id);
  }

  return getOne(id, currentUserRole);
};

module.exports = {
  list,
  getOne,
  update,
  updateRole,
  setStatus,
};
