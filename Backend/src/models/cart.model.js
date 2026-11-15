const { randomUUID } = require("crypto");
const db = require("../config/database");

const getOrCreateId = async (userId, conn = db) => {
  await conn.query("INSERT IGNORE INTO carts (id, user_id) VALUES (?, ?)", [
    randomUUID(),
    userId,
  ]);

  const [[row]] = await conn.query("SELECT id FROM carts WHERE user_id = ?", [
    userId,
  ]);

  return row.id;
};

const lock = async (cartId, conn) => {
  await conn.query("SELECT id FROM carts WHERE id = ? FOR UPDATE", [cartId]);
};

const findItemByVariant = async (cartId, variantId, conn = db) => {
  const [rows] = await conn.query(
    "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND variant_id = ?",
    [cartId, variantId],
  );
  return rows[0] || null;
};

const findItemOwned = async (itemId, userId, conn = db) => {
  const [rows] = await conn.query(
    `SELECT ci.id, ci.variant_id, ci.quantity
     FROM cart_items ci JOIN carts c ON c.id = ci.cart_id
     WHERE ci.id = ? AND c.user_id = ?
     FOR UPDATE`,
    [itemId, userId],
  );
  return rows[0] || null;
};

const countItems = async (cartId, conn = db) => {
  const [[row]] = await conn.query(
    "SELECT COUNT(*) AS n FROM cart_items WHERE cart_id = ?",
    [cartId],
  );
  return row.n;
};

const insertItem = async (cartId, variantId, quantity, conn = db) => {
  const id = randomUUID();
  await conn.query(
    "INSERT INTO cart_items (id, cart_id, variant_id, quantity) VALUES (?, ?, ?, ?)",
    [id, cartId, variantId, quantity],
  );
  return id;
};

const setQuantity = async (itemId, quantity, conn = db) => {
  await conn.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [
    quantity,
    itemId,
  ]);
};

const deleteItemOwned = async (itemId, userId) => {
  const [r] = await db.query(
    `DELETE ci FROM cart_items ci JOIN carts c ON c.id = ci.cart_id
     WHERE ci.id = ? AND c.user_id = ?`,
    [itemId, userId],
  );
  return r.affectedRows;
};

const clearByUser = async (userId) => {
  await db.query(
    "DELETE ci FROM cart_items ci JOIN carts c ON c.id = ci.cart_id WHERE c.user_id = ?",
    [userId],
  );
};

const listDetailedByUser = async (userId) => {
  const [rows] = await db.query(
    `SELECT ci.id, ci.variant_id, ci.quantity,
            v.variant_name, v.price, v.quantity AS stock,
            p.id AS product_id, p.name AS product_name, p.image_url,
            (v.status = TRUE AND p.status = TRUE AND c.status = TRUE AND b.status = TRUE) AS available
     FROM carts ca
     JOIN cart_items ci ON ci.cart_id = ca.id
     JOIN product_variants v ON v.id = ci.variant_id
     JOIN products p ON p.id = v.product_id
     JOIN categories c ON c.id = p.category_id
     JOIN brands b ON b.id = p.brand_id
     WHERE ca.user_id = ?
     ORDER BY ci.id`,
    [userId],
  );
  return rows;
};

module.exports = {
  getOrCreateId,
  lock,
  findItemByVariant,
  findItemOwned,
  countItems,
  insertItem,
  setQuantity,
  deleteItemOwned,
  clearByUser,
  listDetailedByUser,
};