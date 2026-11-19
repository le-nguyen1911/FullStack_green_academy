const pool = require("../config/database");
const insert = async (db, userId, body, totals, paymentId, code) => {
    const [result] = await db.execute(`INSERT INTO orders
(order_code, user_id, recipient_name, recipient_phone, shipping_address,
shipping_method_id, subtotal, shipping_fee, discount_amount, total_amount,
payment_method_id, payment_status, order_status, note)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'UNPAID',
'PENDING_CONFIRMATION', ?)`,
        [code, userId, body.recipient_name, body.recipient_phone,
            body.shipping_address, body.shipping_method_id, totals.subtotal,
            totals.shipping_fee, totals.total_amount, paymentId, body.note]);
    return result.insertId;
};
const addItem = async (db, orderId, product, quantity, lineTotal) => {
    await db.execute(`INSERT INTO order_items
(order_id, product_id, product_name, unit_price, quantity, total_price)
VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, product.id, product.name, product.sale_price, quantity, lineTotal]);
    const [result] = await db.execute(`UPDATE products
SET stock_quantity = stock_quantity - ?
WHERE id = ? AND stock_quantity >= ?`, [quantity, product.id, quantity]);
    if (result.affectedRows !== 1) throw new Error("Trừ kho không thành công");
};
const beginHistory = async (db, orderId, userId) => {
    await db.execute(`INSERT INTO order_status_histories
(order_id, old_status, new_status, changed_by, note)
VALUES (?, NULL, 'PENDING_CONFIRMATION', ?, 'Customer tạo đơn COD')`,
        [orderId, userId]);
};
const list = async (userId, page, limit) => {
    const [rows] = await pool.execute(`SELECT id, order_code, subtotal,
shipping_fee, discount_amount, total_amount, payment_status,
order_status, created_at FROM orders WHERE user_id = ?
ORDER BY id DESC LIMIT ? OFFSET ?`,
        [userId, String(limit + 1), String((page - 1) * limit)]);
    return {
        items: rows.slice(0, limit),
        pagination: { page, limit, has_next: rows.length > limit }
    };
};
const detail = async (db, userId, id) => {
    const [rows] = await db.execute(`SELECT id, order_code, recipient_name,
recipient_phone, shipping_address, shipping_method_id, payment_method_id,
subtotal, shipping_fee, discount_amount, total_amount,
order_status, payment_status, note, created_at
FROM orders WHERE id = ? AND user_id = ?`, [id, userId]);
    if (!rows[0]) return null;
    const [items] = await db.execute(`SELECT id, product_id, product_name,
        unit_price, quantity, total_price FROM order_items
WHERE order_id = ? ORDER BY id`, [id]);
    const [history] = await db.execute(`SELECT old_status, new_status, note,
created_at FROM order_status_histories WHERE order_id = ? ORDER BY id`, [id]);
    return { ...rows[0], items, history };
};
module.exports = { insert, addItem, beginHistory, list, detail };