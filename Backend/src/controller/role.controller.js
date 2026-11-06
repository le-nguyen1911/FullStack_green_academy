const withTransaction = require("../utils/transaction");
const roleModel = require("../models/role.model");
const permissionModel = require("../models/permission.model");
const userModel = require("../models/user.model");
const refreshTokenModel = require("../models/refreshToken.model");
const { clearPermissionCache } = require("../services/permission.service");
const { P } = require("../constants/permission");

const SYSTEM_ROLES = ["ADMIN", "MANAGER", "STAFF_SALE", "CUSTOMER"];
const LOCKED_ROLES = ["ADMIN"];
const ADMIN_ONLY_PERMS = [P.USER_MANAGE];
const NAME_RE = /^[A-Z0-9_]{2,50}$/;

const normalizeName = (name) => name?.trim().toUpperCase().replace(/\s+/g, "_");
const flags = (name) => ({
  is_system: SYSTEM_ROLES.includes(name),
  is_locked: LOCKED_ROLES.includes(name),
});

// Kiểm tra danh sách id quyền, trả về mảng id đã bỏ trùng, hoặc ném AppError
const validatePermissionIds = async (roleName, permissionIds, conn) => {
  if (!Array.isArray(permissionIds))
    throw new AppError(400, "permissionIds phải là mảng");
  const ids = [...new Set(permissionIds)];

  const found = await permissionModel.findByIds(ids, conn);
  if (found.length !== ids.length)
    throw new AppError(400, "Có permission không tồn tại");

  const banned = found.filter((p) => ADMIN_ONLY_PERMS.includes(p.code));
  if (banned.length && roleName !== "ADMIN")
    throw new AppError(
      400,
      `Quyền ${banned.map((b) => b.code).join(", ")} chỉ dành cho ADMIN`,
    );
  return ids;
};

exports.listRoles = async (req, res) => {
  const rows = await roleModel.listWithCounts();
  res.json(rows.map((r) => ({ ...r, ...flags(r.name) })));
};

// GET /permissions: gom theo module để frontend vẽ checkbox
exports.listPermissions = async (req, res) => {
  const rows = await permissionModel.listAll();
  const groups = {};
  for (const p of rows)
    (groups[p.module] ??= []).push({ id: p.id, code: p.code, name: p.name });
  res.json(
    Object.entries(groups).map(([module, permissions]) => ({
      module,
      permissions,
    })),
  );
};

// GET /roles/:id: chi tiết role kèm id quyền đang có (để tick sẵn)
exports.getRole = async (req, res) => {
  const role = await roleModel.findById(req.params.id);
  if (!role) throw new AppError(404, "Không tìm thấy role");
  const permissionIds = await permissionModel.findIdsByRole(role.id);
  res.json({ ...role, ...flags(role.name), permissionIds });
};

// POST /roles   body: { name, description, permissionIds }
exports.createRole = async (req, res) => {
  const { description, permissionIds = [] } = req.body;
  const name = normalizeName(req.body.name);
  if (!name || !NAME_RE.test(name))
    throw new AppError(400, "Tên role chỉ gồm chữ, số, gạch dưới (2-50 ký tự)");

  const id = await withTransaction(async (conn) => {
    if (await roleModel.findByName(name, conn))
      throw new AppError(409, "Role đã tồn tại");
    const ids = await validatePermissionIds(name, permissionIds, conn);
    const roleId = await roleModel.create({ name, description }, conn);
    await permissionModel.replaceForRole(roleId, ids, conn);
    return roleId;
  });
  res.status(201).json({ id, name });
};

// PATCH /roles/:id   body: { name?, description? }
exports.updateRole = async (req, res) => {
  const role = await roleModel.findById(req.params.id);
  if (!role) throw new AppError(404, "Không tìm thấy role");

  const data = { description: req.body.description };
  if (req.body.name !== undefined) {
    if (SYSTEM_ROLES.includes(role.name))
      throw new AppError(403, "Không được đổi tên role hệ thống");
    const name = normalizeName(req.body.name);
    if (!NAME_RE.test(name)) throw new AppError(400, "Tên role không hợp lệ");
    data.name = name;
  }

  const affected = await roleModel.update(role.id, data);
  if (affected === null)
    throw new AppError(400, "Không có dữ liệu để cập nhật");
  res.json({ message: "Đã cập nhật role" }); 
};

// PUT /roles/:id/permissions   
exports.setRolePermissions = async (req, res) => {
  const result = await withTransaction(async (conn) => {
    const role = await roleModel.findByIdForUpdate(req.params.id, conn);
    if (!role) throw new AppError(404, "Không tìm thấy role");
    if (LOCKED_ROLES.includes(role.name))
      throw new AppError(403, "Không được sửa quyền của ADMIN");

    const ids = await validatePermissionIds(
      role.name,
      req.body.permissionIds,
      conn,
    );
    const oldIds = await permissionModel.findIdsByRole(role.id, conn);
    await permissionModel.replaceForRole(role.id, ids, conn);

    return {
      added: ids.filter((id) => !oldIds.includes(id)).length,
      removed: oldIds.filter((id) => !ids.includes(id)).length,
    };
  });

  clearPermissionCache(); 
  res.json({ message: "Đã cập nhật quyền cho role", ...result });
};

// DELETE /roles/:id
exports.deleteRole = async (req, res) => {
  const role = await roleModel.findById(req.params.id);
  if (!role) throw new AppError(404, "Không tìm thấy role");
  if (SYSTEM_ROLES.includes(role.name))
    throw new AppError(403, "Không được xóa role hệ thống");

  const total = await userModel.countByRoleId(role.id);
  if (total > 0)
    throw new AppError(409, `Còn ${total} user đang dùng role này`);

  await roleModel.remove(role.id); // role_permissions tự xóa (CASCADE)
  clearPermissionCache();
  res.json({ message: "Đã xóa role" });
};

// PATCH /users/:id/role   
exports.assignUserRole = async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id)
    throw new AppError(400, "Không thể đổi role của chính mình");

  const target = await userModel.findByIdWithRole(id);
  if (!target) throw new AppError(404, "Không tìm thấy user");

  const newRole = await roleModel.findById(req.body.roleId);
  if (!newRole) throw new AppError(404, "Role không tồn tại");

  const touchesAdmin = newRole.name === "ADMIN" || target.role_name === "ADMIN";
  if (touchesAdmin && req.user.role !== "ADMIN")
    throw new AppError(403, "Chỉ ADMIN mới được thay đổi role ADMIN");

  if (target.role_name === "ADMIN" && newRole.name !== "ADMIN") {
    if ((await userModel.countByRoleName("ADMIN")) <= 1)
      throw new AppError(409, "Phải còn ít nhất một ADMIN");
  }

  await withTransaction(async (conn) => {
    await userModel.updateRole(id, newRole.id, conn);
    await refreshTokenModel.deleteByUser(id, conn); 
  });
  clearPermissionCache(id);
  res.json({ message: "Đã đổi role" });
};