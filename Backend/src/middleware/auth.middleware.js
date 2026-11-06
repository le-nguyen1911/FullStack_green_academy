const jwt = require("jsonwebtoken");
const db = require("..//config/database");

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

exports.authorize = (permissionCode) => async (req, res, next) => {
  const [rows] = await db.query(
    `SELECT 1
     FROM role_permissions rp
     JOIN roles r ON r.id = rp.role_id
     JOIN permissions p ON p.id = rp.permission_id
     WHERE r.name = ? AND p.code = ? LIMIT 1`,
    [req.user.role, permissionCode],
  );
  if (!rows.length) return res.status(403).json({ message: "Không đủ quyền" });
  next();
};
