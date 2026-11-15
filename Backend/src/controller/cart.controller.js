const service = require("../services/cart.service");

exports.get = async (req, res) => res.json(await service.getCart(req.user.id));

exports.addItem = async (req, res) =>
  res.status(201).json(await service.addItem(req.user.id, req.body));

exports.updateItem = async (req, res) =>
  res.json(
    await service.updateItem(req.user.id, req.params.itemId, req.body.quantity),
  );

exports.removeItem = async (req, res) => {
  await service.removeItem(req.user.id, req.params.itemId);
  res.json({ message: "Đã xóa khỏi giỏ hàng" });
};

exports.clear = async (req, res) => {
  await service.clear(req.user.id);
  res.json({ message: "Đã làm trống giỏ hàng" });
};
