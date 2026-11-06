const db = require("../config/database");

const findByIdWithRole = async (id) => {
  const [rows] = await db.query(
    `SELECT u.id, u.full_name, u.email, u.role_id, r.name AS role_name
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.id = ?`,
    [id],
  );
  return rows[0] || null;
};

const updateRole = async (id, roleId, conn = db) => {
  const [r] = await conn.query("UPDATE users SET role_id = ? WHERE id = ?", [
    roleId,
    id,
  ]);
  return r.affectedRows;
};

const countByRoleId = async (roleId) => {
  const [[row]] = await db.query(
    "SELECT COUNT(*) AS total FROM users WHERE role_id = ?",
    [roleId],
  );
  return row.total;
};

const countByRoleName = async (roleName) => {
  const [[row]] = await db.query(
    "SELECT COUNT(*) AS total FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name = ?",
    [roleName],
  );
  return row.total;
};

module.exports = {
  findByIdWithRole,
  updateRole,
  countByRoleId,
  countByRoleName,
};
