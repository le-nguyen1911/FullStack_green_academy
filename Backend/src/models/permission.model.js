const db = require("../config/database");

const findCodesByUser = async (userId) => {
  const [rows] = await db.query(
    `
        SELECT DISTINCT p.code
        FROM users u
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE u.id = ?`,
    [userId],
  );

  return rows.map((row) => row.code);
};

const listAll = async () => {
  const [rows] = await db.query(
    "SELECT id, code, name, module FROM permissions ORDER BY module, code",
  );
  return rows;
};
const findByIds = async (ids, conn = db) => {
  if (!ids.length) return [];
  const [rows] = await conn.query(
    "SELECT id, code FROM permissions WHERE id IN (?)",
    [ids],
  );
  return rows;
};
const findIdsByRole = async (roleId, conn = db) => {
  const [rows] = await conn.query(
    "SELECT permission_id FROM role_permissions WHERE role_id = ?",
    [roleId],
  );
  return rows.map((r) => r.permission_id);
};

// Thay toàn bộ quyền của role: xóa cũ rồi chèn mới (gọi trong transaction)
const replaceForRole = async (roleId, permissionIds, conn = db) => {
  await conn.query("DELETE FROM role_permissions WHERE role_id = ?", [roleId]);
  if (permissionIds.length) {
    await conn.query(
      "INSERT INTO role_permissions (role_id, permission_id) VALUES ?",
      [permissionIds.map((pid) => [roleId, pid])],
    );
  }
};

module.exports = {
  findCodesByUser,
  listAll,
  findByIds,
  findIdsByRole,
  replaceForRole,
};
