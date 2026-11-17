const jwt = require("jsonwebtoken");
const { getUserPermissions } = require("../services/permission.service");
const { ALL_CODES } = require("../constants/permission");
const userModel = require("../models/user.model");

exports.authenticate = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Token đã hết hạn"
        : "Token không hợp lệ";

    return res.status(401).json({ message });
  }

  try {
    const user = await userModel.findByIdWithRole(payload.sub);

    if (!user) {
      return res.status(401).json({
        message: "Tài khoản không tồn tại",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(401).json({
        message: "Tài khoản đã bị khóa hoặc vô hiệu hóa",
      });
    }

    req.user = {
      id: user.id,
      role: user.role_name,
    };

    next();
  } catch (err) {
    next(err);
  }
};

exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Không đủ quyền truy cập" });
    }
    next();
  };
};

exports.authorize = (...codes) => {
  for (const c of codes) {
    if (!ALL_CODES.includes(c))
      throw new Error(
        `authorize(): permission "${c}" chưa khai báo trong constants/permission.js`,
      );
  }

  return async (req, res, next) => {
    try {
      const owned = await getUserPermissions(req.user.id, req.user.role);
      if (!codes.some((c) => owned.has(c)))
        return res.status(403).json({ message: "Không đủ quyền" });
      next();
    } catch (err) {
      next(err);
    }
  };
};
