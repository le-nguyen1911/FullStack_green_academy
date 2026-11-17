const { randomUUID } = require("crypto");
const db = require("../config/database");

// =========================
// REVIEW CỦA KHÁCH HÀNG
// =========================

const list = async (productId, limit, offset) => {
  const [rows] = await db.query(
    `SELECT
       r.id,
       r.rating,
       r.comment,
       r.created_at,
       u.full_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = ?
       AND r.status = 'APPROVED'
     ORDER BY r.created_at DESC, r.id
     LIMIT ? OFFSET ?`,
    [productId, limit, offset],
  );

  return rows;
};

const distribution = async (productId) => {
  const [rows] = await db.query(
    `SELECT rating, COUNT(*) AS n
     FROM reviews
     WHERE product_id = ?
       AND status = 'APPROVED'
     GROUP BY rating`,
    [productId],
  );

  return rows;
};

const findByUser = async (productId, userId) => {
  const [rows] = await db.query(
    `SELECT id, rating, comment, created_at
     FROM reviews
     WHERE product_id = ? AND user_id = ?`,
    [productId, userId],
  );

  return rows[0] || null;
};

const hasPurchased = async (productId, userId) => {
  const [rows] = await db.query(
    `SELECT EXISTS (
       SELECT 1
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = ?
         AND oi.product_id = ?
         AND o.status = 'delivered'
     ) AS purchased`,
    [userId, productId],
  );

  return Boolean(rows[0].purchased);
};

const upsert = async ({ userId, productId, rating, comment }) => {
  await db.query(
    `INSERT INTO reviews
       (id, user_id, product_id, rating, comment)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       rating = VALUES(rating),
       comment = VALUES(comment)`,
    [randomUUID(), userId, productId, rating, comment],
  );
};

const removeByUser = async (productId, userId) => {
  const [result] = await db.query(
    `DELETE FROM reviews
     WHERE product_id = ?
       AND user_id = ?`,
    [productId, userId],
  );

  return result.affectedRows;
};

// =========================
// QUẢN LÝ REVIEW ADMIN
// =========================

const adminList = async (filters, sort, limit, offset) => {
  const conditions = [];
  const values = [];

  if (filters.q) {
    conditions.push(`(
      p.name LIKE ?
      OR u.full_name LIKE ?
      OR u.email LIKE ?
    )`);

    const keyword = `%${filters.q}%`;
    values.push(keyword, keyword, keyword);
  }

  if (filters.rating) {
    conditions.push("r.rating = ?");
    values.push(filters.rating);
  }

  if (filters.status) {
    conditions.push("r.status = ?");
    values.push(filters.status);
  }

  if (filters.from) {
    conditions.push("r.created_at >= ?");
    values.push(`${filters.from} 00:00:00`);
  }

  if (filters.to) {
    conditions.push("r.created_at < DATE_ADD(?, INTERVAL 1 DAY)");
    values.push(filters.to);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortMap = {
    newest: "r.created_at DESC, r.id DESC",
    oldest: "r.created_at ASC, r.id ASC",
    rating_desc: "r.rating DESC, r.created_at DESC",
    rating_asc: "r.rating ASC, r.created_at DESC",
  };

  const orderBy = sortMap[sort] || sortMap.newest;

  const [rows] = await db.query(
    `SELECT
       r.id,
       r.user_id,
       r.product_id,
       r.rating,
       r.comment,
       r.status,
       r.created_at,
       r.updated_at,
       u.full_name AS user_name,
       u.email AS user_email,
       p.name AS product_name,
       p.image_url AS product_image
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     JOIN products p ON p.id = r.product_id
     ${where}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  );

  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     JOIN products p ON p.id = r.product_id
     ${where}`,
    values,
  );

  return {
    items: rows,
    total: Number(countRows[0].total),
  };
};

const adminFindById = async (id) => {
  const [rows] = await db.query(
    `SELECT
       r.id,
       r.user_id,
       r.product_id,
       r.rating,
       r.comment,
       r.status,
       r.created_at,
       r.updated_at,
       u.full_name AS user_name,
       u.email AS user_email,
       p.name AS product_name,
       p.image_url AS product_image
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     JOIN products p ON p.id = r.product_id
     WHERE r.id = ?`,
    [id],
  );

  return rows[0] || null;
};

const setStatus = async (id, status) => {
  const [result] = await db.query(
    `UPDATE reviews
     SET status = ?
     WHERE id = ?`,
    [status, id],
  );

  return result.affectedRows;
};

const adminRemove = async (id) => {
  const [result] = await db.query(
    `DELETE FROM reviews
     WHERE id = ?`,
    [id],
  );

  return result.affectedRows;
};

module.exports = {
  // Customer
  list,
  distribution,
  findByUser,
  hasPurchased,
  upsert,
  removeByUser,

  // Admin
  adminList,
  adminFindById,
  setStatus,
  adminRemove,
};
