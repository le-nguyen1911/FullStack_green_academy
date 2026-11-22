const orderService = require("../services/order.service");

const fail = (status, message) => {
    const err = new Error(message);
    err.status = status;
    throw err;
};

const parseId = (rawId) => {
    if (typeof rawId !== "string" || !/^[1-9]\d*$/.test(rawId)) {
        fail(400, "ID không hợp lệ");
    }
    return Number(rawId);
};

const orderBody = (body = {}) => {
    if (!body || typeof body !== "object") {
        fail(400, "Dữ liệu đơn hàng không hợp lệ");
    }
    return body;
};

const create = async (req, res) => {
    const data = await orderService.create(req.user.id, orderBody(req.body));
    res.status(201).json({ success: true, data });
};

const mine = async (req, res) => {
    const query = req.query;
    if (Object.keys(query).some((key) => !["page", "limit"].includes(key))) {
        fail(400, "Query không được hỗ trợ");
    }
    const positive = (value, fallback, max) => {
        if (value === undefined) return fallback;
        if (
            typeof value !== "string" ||
            !/^[1-9]\d*$/.test(value) ||
            Number(value) > max
        ) {
            fail(400, "page hoặc limit không hợp lệ");
        }
        return Number(value);
    };
    const page = positive(query.page, 1, 1000000);
    const limit = positive(query.limit, 10, 50);
    res.json({
        success: true,
        data: await orderService.list(req.user.id, page, limit),
    });
};

const detail = async (req, res) => {
    const data = await orderService.detail(req.user.id, parseId(req.params.id));
    res.json({ success: true, data });
};

module.exports = { create, mine, detail };