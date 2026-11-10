const crypto = require("crypto");
const { randomUUID } = require("crypto");
const db = require("../config/database");

const hash = (token) => crypto.createHash("sha256").update(token).digest("hex");

const create = async ({ userId, token, expiresAt }, conn = db) => {
  await conn.query(
    "INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)",
    [randomUUID(), userId, hash(token), expiresAt],
  );
};

const consume = async (token) => {
  const [r] = await db.query(
    "DELETE FROM refresh_tokens WHERE token = ? AND expires_at > NOW()",
    [hash(token)],
  );
  return r.affectedRows > 0;
};

const deleteByToken = async (token, conn = db) => {
  await conn.query("DELETE FROM refresh_tokens WHERE token = ?", [hash(token)]);
};

const deleteByUser = async (userId, conn = db) => {
  await conn.query("DELETE FROM refresh_tokens WHERE user_id = ?", [userId]);
};

const deleteExpired = async () => {
  await db.query("DELETE FROM refresh_tokens WHERE expires_at < NOW()");
};

module.exports = {
  create,
  consume,
  deleteByToken,
  deleteByUser,
  deleteExpired,
};
