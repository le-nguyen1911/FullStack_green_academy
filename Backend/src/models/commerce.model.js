const lockCart = async (db, userId) => {
    await db.execute(
        `INSERT INTO carts (user_id) VALUES (?)
         ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)`,
        [userId]
    );
    const [rows] = await db.execute(
        `SELECT id FROM carts WHERE user_id = ? FOR UPDATE`,
        [userId]
    );
    return rows[0]?.id;
};

const items = async (db, cartId) => {
    const [rows] = await db.execute(
        `SELECT ci.id, ci.variant_id, pv.product_id, ci.quantity
         FROM cart_items ci
         LEFT JOIN product_variants pv ON pv.id = ci.variant_id
         WHERE ci.cart_id = ?
         ORDER BY ci.id ASC`,
        [cartId]
    );
    return rows;
};


const lockProduct = async (db, productId, variantId = null) => {
    const [rows] = variantId
        ? await db.execute(
            `SELECT p.id, p.name, p.status, c.status AS category_status,
                      pv.id AS variant_id, pv.price AS sale_price, pv.quantity AS stock_quantity
               FROM products p
               LEFT JOIN categories c ON c.id = p.category_id
               JOIN product_variants pv ON pv.product_id = p.id AND pv.id = ?
               WHERE p.id = ?
               FOR UPDATE`,
            [variantId, productId]
        )
        : await db.execute(
            `SELECT p.id, p.name, p.status, c.status AS category_status,
                      pv.id AS variant_id, pv.price AS sale_price, pv.quantity AS stock_quantity
               FROM products p
               LEFT JOIN categories c ON c.id = p.category_id
               LEFT JOIN product_variants pv ON pv.product_id = p.id
               WHERE p.id = ?
               LIMIT 1
               FOR UPDATE`,
            [productId]
        );
    return rows[0] || null;
};


const putItem = async (db, cartId, productId, quantity) => {
    await db.execute(`INSERT INTO cart_items (cart_id, product_id, quantity)
VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = ?`,
        [cartId, productId, quantity, quantity]);
};
const removeItems = async (db, cartId, ids) => {
    for (const id of ids) {
        await db.execute("DELETE FROM cart_items WHERE cart_id = ? AND id = ?", [cartId, id]);
    }
};
const touch = async (db, cartId) => {
    if (!cartId) return;
    await db.execute(`SELECT id FROM carts WHERE id = ?`, [cartId]);
};
module.exports = { lockCart, items, lockProduct, putItem, removeItems, touch };