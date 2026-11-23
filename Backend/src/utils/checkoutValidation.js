const { fail, parseId } = require("./catalogHelpers");
const object = (body, fields, required = fields) => {
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        Object.keys(body).some((key) => !fields.includes(key)) ||
        required.some((key) => !Object.hasOwn(body, key))) {
        fail(400, "Body thiếu trường hoặc có trường không được phép");
    }
};

const cartItemId = (value) => {
    if (typeof value !== "string" || !value.trim() || value.trim().length > 100) {
        fail(400, "cart_item_ids không hợp lệ");
    }
    return value.trim();
};

const idNumber = (value) => {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 2147483647) {
        fail(400, "ID trong JSON phải là số nguyên dương hợp lệ");
    }
    return value;
};
const quantity = (value) => {
    if (!Number.isInteger(value) || value < 1 || value > 2147483647) {
        fail(400, "quantity phải là số nguyên dương hợp lệ");
    }
    return value;
};

const text = (value, max, field) => {
    if (typeof value !== "string" || !value.trim() ||
        [...value.trim()].length > max) fail(400, `${field} không hợp lệ`);
    return value.trim();
};
const cartBody = (body, adding = false) => {
    object(body, adding ? ["product_id", "quantity"] : ["quantity"]);
    return {
        quantity: quantity(body.quantity),
        ...(adding ? { product_id: idNumber(body.product_id) } : {})
    };
};
const orderBody = (body) => {
    const fields = ["cart_item_ids", "recipient_name", "recipient_phone",
        "shipping_address", "shipping_method_id", "payment_method", "note"];
    object(body, fields, fields.filter((key) => key !== "note"));
    const ids = body.cart_item_ids;
    if (!Array.isArray(ids) || ids.length < 1 || ids.length > 100) {
        fail(400, "Chọn từ 1 đến 100 dòng giỏ hàng");
    }
    ids.forEach(idNumber);
    if (new Set(ids).size !== ids.length) fail(400, "cart_item_ids bị trùng");
    const phone = text(body.recipient_phone, 20, "recipient_phone");
    if (!/^0\d{9}$/.test(phone)) fail(400, "Số điện thoại gồm 10 số, bắt đầu bằng 0");
    if (body.payment_method !== "COD") fail(400, "Buổi này chỉ nhận COD");
    return {
        cart_item_ids: ids, recipient_phone: phone,
        recipient_name: text(body.recipient_name, 100, "recipient_name"),
        shipping_address: text(body.shipping_address, 2000, "shipping_address"),
        shipping_method_id: idNumber(body.shipping_method_id),
        note: body.note === undefined || body.note === null ? null
            : text(body.note, 1000, "note")
    };
};
module.exports = { cartBody, orderBody };