const service = require("../services/checkout.service");
const { orderBody } = require("../validations/checkoutValidation");

const options = async (req, res) => {
    res.json({ success: true, data: await service.options() });
};

const create = async (req, res) => {
    const data = orderBody(req.body);
    const userId = req.user.id;
    const order = await service.createOrder(userId, data);
    res.status(201).json({ success: true, data: order });
};

module.exports = { options, create };