const db = require("../config/database");
const { randomUUID } = require("crypto");

const findByEmailWithRole = async (email) => {
  const [rows] = await db.query(
    `SELECT u.*, r.name AS role_name
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.email = ?`,
    [email],
  );
  return rows[0] || null;
};

const findByIdWithRole = async (id) => {
  const [rows] = await db.query(
    `SELECT u.id, u.full_name, u.email, u.role_id, r.name AS role_name
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.id = ?`,
    [id],
  );
  return rows[0] || null;
};

const emailExists = async (email) => {
  const [rows] = await db.query("SELECT 1 FROM users WHERE email = ? LIMIT 1", [
    email,
  ]);
  return rows.length > 0;
};

const create = async ({
  roleId,
  fullName,
  email,
  passwordHash,
  phone,
  address,
}) => {
  const id = randomUUID();
  await db.query(
    `INSERT INTO users (id, role_id, full_name, email, password, phone, address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, roleId, fullName, email, passwordHash, phone || null, address || null],
  );
  return id;
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

const findByEmail = async (email, conn = db) => {
  const [rows] = await conn.query(
    "SELECT id, email FROM users WHERE email = ?",
    [email],
  );
  return rows[0] || null;
};

const findPasswordHash = async (id) => {
  const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [
    id,
  ]);
  return rows.length ? rows[0].password : null;
};

const updatePassword = async (id, passwordHash, conn = db) => {
  await conn.query("UPDATE users SET password = ? WHERE id = ?", [
    passwordHash,
    id,
  ]);
};
module.exports = {
  findByEmailWithRole,
  findByIdWithRole,
  emailExists,
  create,
  updateRole,
  countByRoleId,
  countByRoleName,
  findByEmail,
  findPasswordHash,
  updatePassword,
};
