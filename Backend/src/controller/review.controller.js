const service = require("../services/review.service");

exports.list = async (req, res) => {
  const result = await service.list(req.params.id, req.query);
  res.json(result);
};

exports.getMine = async (req, res) => {
  const review = await service.getMine(req.params.id, req.user.id);

  res.json({ review });
};

exports.saveMine = async (req, res) => {
  const review = await service.saveMine(req.params.id, req.user.id, req.body);

  res.json({ review });
};

exports.removeMine = async (req, res) => {
  await service.removeMine(req.params.id, req.user.id);
  res.json({
    message: "Đã xóa đánh giá",
  });
};
