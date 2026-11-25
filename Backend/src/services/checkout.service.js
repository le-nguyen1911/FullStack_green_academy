const crypto = require("crypto");
const pool = require("../config/database");
const checkout = require("../models/checkoutModel");

const options = async () => {
    const shipping_methods = await checkout.listShipping();
    const payment_methods = await checkout.listPayments();
    return { shipping_methods, payment_methods };
};

const createOrder = async (userId, input) => {
    const {
        cart_item_ids,
        shoppers,
        recipient_phone,
        shipping_address,
        shopping_email,
        shopping_notes,
        shipping_method_id,
    } = input;

    const db = await pool.getConnection();
    try {
        await db.beginTransaction();

        const shipping = await checkout.lockShipping(db, shipping_method_id);
        if (!shipping) {
            const err = new Error("Phương thức vận chuyển không hợp lệ");
            err.status = 400;
            throw err;
        }

        const codPayment = await checkout.lockCod(db);
        if (!codPayment) {
            const err = new Error("Phương thức thanh toán COD hiện không khả dụng");
            err.status = 400;
            throw err;
        }

        const cartRows = await checkout.getSelectedCartItems(
            db,
            userId,
            cart_item_ids
        );
        if (cartRows.length !== cart_item_ids.length) {
            const err = new Error("Một số sản phẩm trong giỏ hàng không tồn tại hoặc không hợp lệ");
            err.status = 400;
            throw err;
        }

        let itemsTotal = 0;
        const orderItems = [];

        for (const row of cartRows) {
            const qty = Number(row.quantity);
            const unitPrice = Number(row.price);

            if (!row.product_active || !row.variant_active) {
                const err = new Error(`Sản phẩm "${row.product_name}" đã ngừng bán`);
                err.status = 400;
                throw err;
            }
            if (Number(row.stock_quantity) < qty) {
                const err = new Error(
                    `Sản phẩm "${row.product_name}" không đủ tồn kho`
                );
                err.status = 400;
                throw err;
            }

            const subtotal = unitPrice * qty;
            itemsTotal += subtotal;

            await checkout.deductVariantStock(db, row.variant_id, qty);

            orderItems.push({
                id: crypto.randomUUID(),
                variant_id: row.variant_id,
                product_name: row.variant_name
                    ? `${row.product_name} - ${row.variant_name}`
                    : row.product_name,
                price: unitPrice,
                quantity: qty,
                subtotal,
            });
        }

        const shippingFee = Number(shipping.base_fee || 0);
        const totalAmount = itemsTotal + shippingFee;
        

        const orderId = crypto.randomUUID();
        await checkout.insertOrder(db, {
            id: orderId,
            user_id: userId,
            shoppers: shoppers,
            total_amount: totalAmount,
            shipping_address: shipping_address,
            shopping_email: shopping_email,  
            shopping_notes: shopping_notes,
            phone: recipient_phone,
            status: "PENDING",
        });

        for (const item of orderItems) {
            await checkout.insertOrderItem(db, {
                ...item,
                order_id: orderId,
            });
        }

        await checkout.insertPayment(db, {
            id: crypto.randomUUID(),
            order_id: orderId,
            payment_method: "COD",
            payment_status: "UNPAID",
        });

        await checkout.deleteCartItems(db, userId, cart_item_ids);

        await db.commit();

        return {
            id: orderId,
            total_amount: totalAmount,
            shipping_fee: shippingFee,
            payment_method: "COD",
            status: "PENDING",
        };
    } catch (err) {
        await db.rollback();
        throw err;
    } finally {
        db.release();
    }
};

module.exports = { options, createOrder };