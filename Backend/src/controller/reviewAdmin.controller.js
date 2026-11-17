const service = require("../services/reviewAdmin.service");

exports.list = async (req, res) => res.json(await service.list(req.query));
exports.getOne = async (req, res) => res.json(await service.getOne(req.params.id));
exports.setStatus = async (req, res) => res.json(await service.setStatus(req.params.id, req.body.status));
exports.remove = async (req, res) => {
  await service.remove(req.params.id);
  res.json({ message: "Đã xóa đánh giá" });
};
