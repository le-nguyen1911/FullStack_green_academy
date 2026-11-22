const { randomUUID } = require("crypto");
const pool = require("../config/database");
const cart = require("../models/commerce.model");
const orders = require("../models/order.model");
const checkout = require("../models/checkout.model");
const { cents, money } = require("../utils/orderMoney"); 

const fail = (status, message) => {
    const err = new Error(message);
    err.status = status;
    throw err;
};

const withTransaction = async (work) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const result = await work(conn);
        await conn.commit();
        return result;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

const unavailable = (product, quantity) => {
    if (!product) return "Sản phẩm không tồn tại";
    if (product.status && product.status !== "ACTIVE") {
        return "Sản phẩm hiện không kinh doanh";
    }
    if (
        typeof product.stock_quantity === "number" &&
        product.stock_quantity < quantity
    ) {
        return "Sản phẩm không đủ số lượng tồn kho";
    }
    return null;
};

const create = (userId, body) =>
    withTransaction(async (db) => {
        const cartId = await cart.lockCart(db, userId);
        const rows = await cart.items(db, cartId);
        const selected = rows.filter((row) => body.cart_item_ids.includes(row.id));
        if (selected.length !== body.cart_item_ids.length) {
            fail(409, "Giỏ đã thay đổi hoặc có dòng không thuộc giỏ của bạn");
        }

        const lines = [];
        let subtotal = 0n;
        for (const row of selected) {
            const product = await cart.lockProduct(db, row.product_id);
            const reason = unavailable(product, row.quantity);
            if (reason) fail(409, reason);
            const lineTotal = money(cents(product.sale_price) * BigInt(row.quantity));
            subtotal += cents(lineTotal);
            lines.push({ product, quantity: row.quantity, lineTotal });
        }

        const shipping = await checkout.lockShipping(db, body.shipping_method_id);
        const payment = await checkout.lockCod(db);
        if (!shipping || !payment) fail(409, "Vận chuyển hoặc COD không khả dụng");

        const totals = {
            subtotal: money(subtotal),
            shipping_fee: shipping.base_fee,
            total_amount: money(subtotal + cents(shipping.base_fee)),
        };

        const code = `ORD-${randomUUID()}`;
        const id = await orders.insert(db, userId, body, totals, payment.id, code);
        for (const line of lines) {
            await orders.addItem(db, id, line.product, line.quantity, line.lineTotal);
        }
        await orders.beginHistory(db, id, userId);
        await cart.removeItems(db, cartId, body.cart_item_ids);
        await cart.touch(db, cartId);

        return {
            id,
            order_code: code,
            ...totals,
            discount_amount: "0.00",
            order_status: "PENDING_CONFIRMATION",
            payment_status: "UNPAID",
        };
    });

const list = (userId, page, limit) => orders.list(userId, page, limit);

const detail = (userId, id) =>
    withTransaction(async (db) => {
        const order = await orders.detail(db, userId, id);
        if (!order) fail(404, "Không tìm thấy đơn hàng của bạn");
        return order;
    });

module.exports = { create, list, detail };