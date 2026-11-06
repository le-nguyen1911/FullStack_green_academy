const { randomUUID } = require("crypto");
const db = require("../config/database");

const getUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] || null;
};

const createUser = async ({
  role_id,
  full_name,
  email,
  password,
  phone,
  address,
}) => {
  const id = randomUUID();
  await db.query(
    `INSERT INTO users (id, role_id, full_name, email, password, phone, address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, role_id, full_name, email, password, phone || null, address || null],
  );
  return id;
};

module.exports = { getUserByEmail, createUser };
