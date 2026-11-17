const service = require("../services/user.service");

// GET /api/manager/users
exports.list = async (req, res) => {
  const result = await service.list(req.query, req.user.role);
  res.json(result);
};

exports.getOne = async (req, res) => {
  const result = await service.getOne(req.params.id, req.user.role);
  res.json({ user: result });
};

exports.update = async (req, res) => {
  const result = await service.update(req.params.id, req.body, req.user.role);

  res.json({
    message: "Cập nhật thông tin người dùng thành công",
    user: result,
  });
};

exports.updateRole = async (req, res) => {
  const result = await service.updateRole(
    req.params.id,
    req.body.role_id,
    req.user.id,
    req.user.role,
  );

  res.json({
    message: "Cập nhật vai trò thành công",
    user: result,
  });
};

exports.setStatus = async (req, res) => {
  const result = await service.setStatus(
    req.params.id,
    req.body.status,
    req.user.id,
    req.user.role,
  );

  res.json({
    message: "Cập nhật trạng thái tài khoản thành công",
    user: result,
  });
};
