const { randomUUID } = require("crypto");
const db = require("../config/database");

const findByName = async (name, conn = db) => {
  const [rows] = await conn.query(
    "SELECT id, name, description FROM roles WHERE name = ?",
    [name],
  );
  return rows[0] || null;
};

const findById = async (id, conn = db) => {
  const [rows] = await conn.query(
    "SELECT id, name, description FROM roles WHERE id = ?",
    [id],
  );
  return rows[0] || null;
};

// Khóa dòng role trong transaction, tránh hai admin sửa cùng lúc
const findByIdForUpdate = async (id, conn) => {
  const [rows] = await conn.query(
    "SELECT id, name FROM roles WHERE id = ? FOR UPDATE",
    [id],
  );
  return rows[0] || null;
};

const listWithCounts = async ({ q, page, limit } = {}) => {
  const where = [];
  const params = [];

  if (q && String(q).trim()) {
    where.push("(r.name LIKE ? OR r.description LIKE ?)");
    const searchTerm = `%${String(q).trim().replace(/[\\%_]/g, "\\$&")}%`;
    params.push(searchTerm, searchTerm);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  if (page !== undefined || limit !== undefined) {
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM roles r ${whereSql}`,
      params,
    );

    const [items] = await db.query(
      `SELECT r.id, r.name, r.description,
              (SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = r.id) AS permission_count,
              (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id) AS user_count
       FROM roles r ${whereSql}
       ORDER BY r.name
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset],
    );

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  const [rows] = await db.query(
    `SELECT r.id, r.name, r.description,
            (SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = r.id) AS permission_count,
            (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id) AS user_count
     FROM roles r ${whereSql}
     ORDER BY r.name`,
    params,
  );
  return rows;
};

const findPermissionsByRole = async (roleId, conn = db) => {
  const [rows] = await conn.query(
    `SELECT p.id, p.code, p.name, p.module
     FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.role_id = ?
     ORDER BY p.module, p.code`,
    [roleId],
  );
  return rows;
};

const create = async ({ name, description }, conn = db) => {
  const id = randomUUID();
  await conn.query(
    "INSERT INTO roles (id, name, description) VALUES (?, ?, ?)",
    [id, name, description || null],
  );
  return id;
};

// Chỉ sửa cột có gửi lên. 
const update = async (id, data) => {
  const sets = [];
  const params = [];
  for (const key of ["name", "description"]) {
    if (data[key] === undefined) continue;
    sets.push(`${key} = ?`);
    params.push(data[key] || null);
  }
  if (!sets.length) return null;
  const [r] = await db.query(
    `UPDATE roles SET ${sets.join(", ")} WHERE id = ?`,
    [...params, id],
  );
  return r.affectedRows;
};

const remove = async (id) => {
  const [r] = await db.query("DELETE FROM roles WHERE id = ?", [id]);
  return r.affectedRows;
};

module.exports = {
  findByName,
  findById,
  findByIdForUpdate,
  listWithCounts,
  findPermissionsByRole,
  create,
  update,
  remove,
};
