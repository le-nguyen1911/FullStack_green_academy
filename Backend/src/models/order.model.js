const { randomUUID } = require("crypto");
const pool = require("../config/database");

const insert = async (db, userId, body, totals, paymentId, code) => {
    const orderId = randomUUID();
    await db.execute(
        `INSERT INTO orders (id, user_id, shoppers, total_amount, shipping_address, shopping_email, shopping_notes, phone, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
        [
            orderId ?? null,
            userId ?? null,
            body?.shoppers ?? body?.recipient_name ?? null,
            totals?.total_amount ?? null,
            body?.shipping_address ?? null,
            body?.shopping_email ?? null,
            body?.shopping_notes ?? null,
            body?.recipient_phone ?? null,
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
        `SELECT id, user_id, shoppers, total_amount, shipping_address, shopping_email, shopping_notes, phone, status, order_date
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

const listAll = async (page, limit) => {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    const [countRows] = await pool.execute(
        `SELECT COUNT(*) AS total FROM orders`
    );
    const total = Number(countRows?.[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    const [rows] = await pool.execute(
        `SELECT id, user_id, shoppers, total_amount, shipping_address, shopping_email, shopping_notes, phone, status, order_date
         FROM orders
         ORDER BY order_date DESC
         LIMIT ? OFFSET ?`,
        [String(safeLimit), String(offset)]
    );

    const pagedOrders = rows;

    if (pagedOrders.length > 0) {
        const orderIds = pagedOrders.map((o) => o.id);
        const placeholders = orderIds.map(() => "?").join(",");
        const [itemRows] = await pool.execute(
            `SELECT
                oi.id,
                oi.order_id,
                oi.variant_id,
                oi.product_name,
                oi.price,
                oi.quantity,
                oi.subtotal,
                pv.product_id,
                pv.variant_name,
                pv.weight_grams,
                pv.grind_type
             FROM order_items oi
             LEFT JOIN product_variants pv ON oi.variant_id = pv.id
             WHERE oi.order_id IN (${placeholders})`,
            orderIds
        );

        const itemsByOrder = itemRows.reduce((acc, item) => {
            if (!acc[item.order_id]) acc[item.order_id] = [];
            acc[item.order_id].push(item);
            return acc;
        }, {});

        pagedOrders.forEach((o) => {
            o.items = itemsByOrder[o.id] || [];
        });
    }

    return {
        items: pagedOrders,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            total_pages: totalPages,
            has_next: safePage < totalPages,
        },
    };
};

const detail = async (db, userId, id, options = {}) => {
    const { isAdminOrManager = false } = options;
    const sql = isAdminOrManager
        ? `SELECT id, user_id, shoppers, total_amount, shipping_address, shopping_email, shopping_notes, phone, status, order_date
           FROM orders
           WHERE id = ?`
        : `SELECT id, user_id, shoppers, total_amount, shipping_address, shopping_email, shopping_notes, phone, status, order_date
           FROM orders
           WHERE id = ? AND user_id = ?`;
    const params = isAdminOrManager ? [id] : [id, userId];

    const [rows] = await db.execute(sql, params);
    if (!rows[0]) return null;

    const [items] = await db.execute(
        `SELECT
            oi.id,
            oi.order_id,
            oi.variant_id,
            oi.product_name,
            oi.price,
            oi.quantity,
            oi.subtotal,
            pv.product_id,
            pv.variant_name,
            pv.weight_grams,
            pv.grind_type
         FROM order_items oi
         LEFT JOIN product_variants pv ON oi.variant_id = pv.id
         WHERE oi.order_id = ?`,
        [id]
    );

    return {
        ...rows[0],
        items,
        history: [],
    };
};

const updateStatus = async (db, userId, orderId, nextStatus, options = {}) => {
    const { isAdminOrManager = false } = options;
    const sql = isAdminOrManager
        ? `UPDATE orders SET status = ? WHERE id = ?`
        : `UPDATE orders SET status = ? WHERE id = ? AND user_id = ?`;
    const params = isAdminOrManager ? [nextStatus, orderId] : [nextStatus, orderId, userId];

    const [result] = await db.execute(sql, params);
    return result.affectedRows > 0;
};

module.exports = { insert, addItem, beginHistory, list, listAll, detail, updateStatus };