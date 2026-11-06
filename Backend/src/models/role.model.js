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

const listWithCounts = async () => {
  const [rows] = await db.query(
    `SELECT r.id, r.name, r.description,
            (SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = r.id) AS permission_count,
            (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id) AS user_count
     FROM roles r ORDER BY r.name`,
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
  create,
  update,
  remove,
};
