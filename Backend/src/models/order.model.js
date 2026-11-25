const { randomUUID } = require("crypto");
const pool = require("../config/database");


const insert = async (db, userId, body, totals, paymentId, code) => {
    const orderId = randomUUID();
    await db.execute(
        `INSERT INTO orders (id, user_id, total_amount, shipping_address, phone, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            orderId,
            userId,
            totals.total_amount,
            body.shipping_address,
            body.recipient_phone,
            "PENDING",
        ]
    );
    return orderId;
};

const addItem = async (db, orderId, product, quantity, lineTotal) => {
    const itemId = randomUUID();
    const unitPrice = product.price ?? product.sale_price ?? 0;

    await db.execute(
        `INSERT INTO order_items (id, order_id, variant_id, product_name, price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            itemId,
            orderId,
            product.variant_id ?? null,
            product.name ?? product.product_name,
            unitPrice,
            quantity,
            lineTotal,
        ]
    );

    if (product.variant_id) {
        const [result] = await db.execute(
            `UPDATE product_variants
             SET quantity = quantity - ?
             WHERE id = ? AND quantity >= ?`,
            [quantity, product.variant_id, quantity]
        );
        if (result.affectedRows !== 1) {
            throw new Error("Trừ kho không thành công");
        }
    }
};

const beginHistory = async () => {
    return;
};

const list = async (userId, page, limit) => {
    const safeLimit = Number(limit) || 10;
    const safePage = Number(page) || 1;
    const [rows] = await pool.execute(
        `SELECT id, user_id, total_amount, shipping_address, phone, status, order_date
         FROM orders
         WHERE user_id = ?
         ORDER BY order_date DESC
         LIMIT ? OFFSET ?`,
        [userId, String(safeLimit + 1), String((safePage - 1) * safeLimit)]
    );
    return {
        items: rows.slice(0, safeLimit),
        pagination: {
            page: safePage,
            limit: safeLimit,
            has_next: rows.length > limit,
        },
    };
};


const detail = async (db, userId, id) => {
    const [rows] = await db.execute(
        `SELECT id, user_id, total_amount, shipping_address, phone, status, created_at
         FROM orders
         WHERE id = ? AND user_id = ?`,
        [id, userId]
    );
    if (!rows[0]) return null;

    const [items] = await db.execute(
        `SELECT id, order_id, variant_id, product_name, price, quantity, subtotal
         FROM order_items
         WHERE order_id = ?`,
        [id]
    );

    return {
        ...rows[0],
        items,
        history: [],
    };
};

const updateStatus = async (db, userId, orderId, nextStatus) => {
    const [result] = await db.execute(
        `UPDATE orders
         SET status = ?
         WHERE id = ? AND user_id = ?`,
        [nextStatus, orderId, userId]
    );
    return result.affectedRows > 0;
};

module.exports = { insert, addItem, beginHistory, list, detail, updateStatus };