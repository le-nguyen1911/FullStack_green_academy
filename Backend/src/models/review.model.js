const { randomUUID } = require("crypto");
const db = require("../config/database");

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

module.exports = {
  list,
  distribution,
  findByUser,
  hasPurchased,
  upsert,
  removeByUser,
};
