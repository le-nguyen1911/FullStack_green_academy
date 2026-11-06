const jwt = require("jsonwebtoken");
const { getUserPermissions } = require("../services/permission.service");
const { ALL_CODES } = require("../constants/permission");



exports.authenticate = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Token đã hết hạn"
        : "Token không hợp lệ";
    res.status(401).json({ message });
  }
};

exports.authorize = (...codes) => {
  for (const c of codes) {
    if (!ALL_CODES.includes(c))
      throw new Error(
        `authorize(): permission "${c}" chưa khai báo trong constants/permissions.js`,
      );
  }

  return async (req, res, next) => {
    try {
      const owned = await getUserPermissions(req.user.id);
      if (!codes.some((c) => owned.has(c)))
        return res.status(403).json({ message: "Không đủ quyền" });
      next();
    } catch (err) {
      next(err);
    }
  };
};
