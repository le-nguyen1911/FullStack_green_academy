require("dotenv").config();

const { randomUUID } = require("crypto");

const db = require("../config/database");
const withTransaction = require("../utils/transaction");

const userModel = require("../models/user.model");
const roleModel = require("../models/role.model");
const permissionModel = require("../models/permission.model");
const refreshTokenModel = require("../models/refreshToken.model");

const { PERMISSIONS, ALL_CODES, P } = require("../constants/permission");
const { clearPermissionCache } = require("../services/permission.service");

const TARGET_USER_ID = "eabcd5cd-534e-4bb5-88b0-af07c4ded354";
const TARGET_EMAIL = "lenguyen001911@gmail.com";

const SUPER_ADMIN_DESCRIPTION =
  "Quản trị viên cấp cao nhất, toàn quyền hệ thống";

async function promoteSuperAdmin() {
  if (process.env.CONFIRM_SUPER_ADMIN_PROMOTION !== "YES") {
    throw new Error(
      "Thiếu xác nhận. Hãy đặt CONFIRM_SUPER_ADMIN_PROMOTION=YES để chạy.",
    );
  }

  await withTransaction(async (conn) => {
    // 1. Khóa và xác minh chính xác tài khoản cần nâng cấp
    const [users] = await conn.query(
      `SELECT u.id, u.email, u.status, r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?
       FOR UPDATE`,
      [TARGET_USER_ID],
    );

    const user = users[0];

    if (!user) {
      throw new Error("Không tìm thấy tài khoản theo User ID.");
    }

    if (user.email.toLowerCase() !== TARGET_EMAIL.toLowerCase()) {
      throw new Error("User ID và email không khớp. Hủy thao tác.");
    }

    if (user.status !== "ACTIVE") {
      throw new Error("Tài khoản không ở trạng thái ACTIVE.");
    }

    if (user.role_name !== "ADMIN") {
      throw new Error(
        `Role hiện tại là ${user.role_name}, yêu cầu tài khoản phải là ADMIN.`,
      );
    }

    // 2. Đồng bộ danh sách permission từ constants
    for (const permission of Object.values(PERMISSIONS)) {
      await conn.query(
        `INSERT INTO permissions (id, code, name, module)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           module = VALUES(module)`,
        [randomUUID(), permission.code, permission.name, permission.module],
      );
    }

    // 3. Tạo role SUPER_ADMIN nếu chưa tồn tại
    let superAdminRole = await roleModel.findByName("SUPER_ADMIN", conn);

    if (!superAdminRole) {
      const roleId = await roleModel.create(
        {
          name: "SUPER_ADMIN",
          description: SUPER_ADMIN_DESCRIPTION,
        },
        conn,
      );

      superAdminRole = {
        id: roleId,
        name: "SUPER_ADMIN",
      };
    } else {
      await conn.query("UPDATE roles SET description = ? WHERE id = ?", [
        SUPER_ADMIN_DESCRIPTION,
        superAdminRole.id,
      ]);
    }

    // 4. Lấy ID toàn bộ permission đã khai báo
    const [permissionRows] = await conn.query(
      "SELECT id, code FROM permissions WHERE code IN (?)",
      [ALL_CODES],
    );

    if (permissionRows.length !== ALL_CODES.length) {
      throw new Error("Không đồng bộ đủ permission. Hủy transaction.");
    }

    const permissionIds = permissionRows.map((p) => p.id);

    // 5. Gán toàn bộ permission cho SUPER_ADMIN
    await permissionModel.replaceForRole(
      superAdminRole.id,
      permissionIds,
      conn,
    );

    // 6. Gỡ quyền quản trị role/permission khỏi các role khác
    await conn.query(
      `DELETE rp
       FROM role_permissions rp
       JOIN permissions p ON p.id = rp.permission_id
       JOIN roles r ON r.id = rp.role_id
       WHERE p.code IN (?, ?)
         AND r.name <> ?`,
      [P.ROLE_MANAGE, P.PERMISSION_MANAGE, "SUPER_ADMIN"],
    );

    // 7. Nâng đúng tài khoản ADMIN thành SUPER_ADMIN
    const affected = await userModel.updateRole(
      TARGET_USER_ID,
      superAdminRole.id,
      conn,
    );

    if (affected !== 1) {
      throw new Error("Không thể cập nhật role cho tài khoản.");
    }

    // 8. Thu hồi refresh token cũ
    await refreshTokenModel.deleteByUser(TARGET_USER_ID, conn);
  });

  // Chỉ xóa cache sau khi transaction thành công
  clearPermissionCache(TARGET_USER_ID);

  console.log("-----------------------------------");
  console.log("NÂNG CẤP SUPER_ADMIN THÀNH CÔNG");
  console.log("-----------------------------------");
  console.log("Email:", TARGET_EMAIL);
  console.log("User ID:", TARGET_USER_ID);
  console.log("Role: SUPER_ADMIN");
  console.log("Permissions:", ALL_CODES.length);
  console.log("Refresh tokens cũ: Đã thu hồi");
  console.log("-----------------------------------");
}

promoteSuperAdmin()
  .catch((error) => {
    console.error("NÂNG CẤP THẤT BẠI:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
