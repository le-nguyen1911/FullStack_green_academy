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

const isActiveStatus = (st) => {
    if (st === undefined || st === null) return true;
    if (typeof st === "boolean") return st;
    if (typeof st === "number") return st === 1;
    const normalized = String(st).trim().toUpperCase();
    return ["ACTIVE", "AVAILABLE", "PUBLISHED", "ENABLED", "1", "TRUE"].includes(normalized);
};

const unavailable = (product, quantity) => {
    if (!product) return "Sản phẩm không tồn tại";
    if (!isActiveStatus(product.status)) {
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
        const requestedIds = new Set(body.cart_item_ids.map((id) => String(id).trim()));
        const selected = rows.filter((row) => requestedIds.has(String(row.id).trim()));
        if (selected.length !== requestedIds.size || selected.length !== body.cart_item_ids.length) {
            fail(409, "Giỏ đã thay đổi hoặc có dòng không thuộc giỏ của bạn");
        }

        const lines = [];
        let subtotal = 0n;
        for (const row of selected) {
            const product = await cart.lockProduct(db, row.product_id, row.variant_id);
            const reason = unavailable(product, row.quantity);
            if (reason) fail(409, reason);
            const lineTotal = money(cents(String(product.sale_price)) * BigInt(row.quantity));
            subtotal += cents(lineTotal);
            lines.push({ product, quantity: row.quantity, lineTotal });
        }

        const shipping = await checkout.lockShipping(db, body.shipping_method_id);
        const payment = await checkout.lockCod(db);
        if (!shipping || !payment) fail(409, "Vận chuyển hoặc COD không khả dụng");

        const totals = {
            subtotal: money(subtotal),
            shipping_fee: shipping.base_fee,
            total_amount: money(subtotal + cents(String(shipping.base_fee))),
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

const detail = (userId, id, options = {}) =>
    withTransaction(async (db) => {
        const order = await orders.detail(db, userId, id, options);
        if (!order) fail(404, "Không tìm thấy đơn hàng của bạn");
        return order;
    });

const updateStatus = async (userId, orderId, payload = {}, options = {}) => {
    const raw = String(payload.status || payload.order_status || "").toUpperCase();
    const allowed = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"];
    if (!allowed.includes(raw)) {
        throw new Error("Trạng thái đơn hàng không hợp lệ");
    }
    return withTransaction(async (db) => {
        const ok = await orders.updateStatus(db, userId, orderId, raw, options);
        if (!ok) {
            const err = new Error("Không tìm thấy đơn hàng");
            err.status = 404;
            throw err;
        }
        return { id: orderId, status: raw };
    });
};

const listAll = (page, limit, filters = {}) =>
    orders.listAll ? orders.listAll(page, limit, filters) : orders.list(null, page, limit, filters);

module.exports = { create, list, listAll, detail, updateStatus };