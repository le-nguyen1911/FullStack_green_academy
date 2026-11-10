const { randomUUID } = require("crypto");
const db = require("../config/database");

const create = async ({ userId, otpHash, expiresMinutes }, conn = db) => {
  await conn.query(
    `INSERT INTO password_reset_otps (id, user_id, otp_hash, expires_at)
     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
    [randomUUID(), userId, otpHash, expiresMinutes],
  );
};

const deleteByUser = async (userId, conn = db) => {
  await conn.query("DELETE FROM password_reset_otps WHERE user_id = ?", [
    userId,
  ]);
};

const latestAgeSeconds = async (userId) => {
  const [rows] = await db.query(
    `SELECT TIMESTAMPDIFF(SECOND, created_at, NOW()) AS age
     FROM password_reset_otps WHERE user_id = ?
     ORDER BY created_at DESC LIMIT 1`,
    [userId],
  );
  return rows.length ? rows[0].age : null;
};

const findActiveForUpdate = async (userId, conn) => {
  const [rows] = await conn.query(
    `SELECT id, otp_hash, attempts
     FROM password_reset_otps
     WHERE user_id = ? AND used_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1
     FOR UPDATE`,
    [userId],
  );
  return rows[0] || null;
};

const incrementAttempts = async (id, conn) => {
  await conn.query(
    "UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id = ?",
    [id],
  );
};

const markUsed = async (id, conn) => {
  await conn.query(
    "UPDATE password_reset_otps SET used_at = NOW() WHERE id = ?",
    [id],
  );
};

const deleteExpired = async () => {
  await db.query("DELETE FROM password_reset_otps WHERE expires_at < NOW()");
};

module.exports = {
  create,
  deleteByUser,
  latestAgeSeconds,
  findActiveForUpdate,
  incrementAttempts,
  markUsed,
  deleteExpired,
};
