const getSelectedCartItems = async (db, userId, cartItemIds) => {
    const placeholders = cartItemIds.map(() => "?").join(", ");
    const [rows] = await db.execute(
        `SELECT
       ci.id,
       ci.variant_id,
       ci.quantity,
       pv.price,
       pv.quantity AS stock_quantity,
       pv.variant_name,
       pv.status AS variant_active,
       p.name AS product_name,
       p.status AS product_active
     FROM carts c
     JOIN cart_items ci ON ci.cart_id = c.id
     JOIN product_variants pv ON pv.id = ci.variant_id
     JOIN products p ON p.id = pv.product_id
     WHERE c.user_id = ? AND ci.id IN (${placeholders})
     FOR UPDATE`,
        [userId, ...cartItemIds]
    );
    return rows;
};

const deductVariantStock = async (db, variantId, quantity) => {
    await db.execute(
        `UPDATE product_variants SET quantity = quantity - ? WHERE id = ?`,
        [quantity, variantId]
    );
};

const insertOrder = async (
    db,
    { id, user_id, total_amount, shipping_address, phone, status }
) => {
    await db.execute(
        `INSERT INTO orders (id, user_id, total_amount, shipping_address, phone, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [id, user_id, total_amount, shipping_address, phone, status]
    );
};

const insertOrderItem = async (
    db,
    { id, order_id, variant_id, product_name, price, quantity, subtotal }
) => {
    await db.execute(
        `INSERT INTO order_items (id, order_id, variant_id, product_name, price, quantity, subtotal)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, order_id, variant_id, product_name, price, quantity, subtotal]
    );
};

const insertPayment = async (
    db,
    { id, order_id, payment_method, payment_status }
) => {
    await db.execute(
        `INSERT INTO payments (id, order_id, payment_method, payment_status, paid_at)
     VALUES (?, ?, ?, ?, NULL)`,
        [id, order_id, payment_method, payment_status]
    );
};

const deleteCartItems = async (db, userId, cartItemIds) => {
    const placeholders = cartItemIds.map(() => "?").join(", ");
    await db.execute(
        `DELETE ci FROM cart_items ci
     JOIN carts c ON c.id = ci.cart_id
     WHERE c.user_id = ? AND ci.id IN (${placeholders})`,
        [userId, ...cartItemIds]
    );
};