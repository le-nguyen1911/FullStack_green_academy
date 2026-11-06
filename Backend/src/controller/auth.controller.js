const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const db = require("../config/database");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const { log } = require("console");

const refreshExpiry = () =>
  new Date(Date.now() + process.env.REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await db.query(
    "INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)",
    [randomUUID(), user.id, refreshToken, refreshExpiry()],
  );
  return { accessToken, refreshToken };
}

const register = async (req, res) => {
  const { full_name, email, password, phone, address } = req.body;
  if (!full_name || !email || !password)
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

  const [exist] = await db.query("SELECT id FROM users WHERE email = ?", [
    email,
  ]);
  if (exist.length)
    return res.status(409).json({ message: "Email đã tồn tại" });

  const [[role]] = await db.query(
    "SELECT id FROM roles WHERE name = 'CUSTOMER'",
  );
  const hash = await bcrypt.hash(password, 12);

  await db.query(
    `INSERT INTO users (id, role_id, full_name, email, password, phone, address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      role.id,
      full_name,
      email,
      hash,
      phone || null,
      address || null,
    ],
  );
  res.status(201).json({ message: "Đăng ký thành công" });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.query(
    `SELECT u.*, r.name AS role_name
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.email = ?`,
    [email],
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });

  const tokens = await issueTokens(user);
  res.json({
    ...tokens,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role_name,
    },
  });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ message: "Thiếu refresh token" });

  try {
    const payload = verifyRefreshToken(refreshToken);

    const [rows] = await db.query(
      "SELECT id FROM refresh_tokens WHERE token = ? AND expires_at > NOW()",
      [refreshToken],
    );
    if (!rows.length)
      return res.status(401).json({ message: "Refresh token không hợp lệ" });

    const [[user]] = await db.query(
      `SELECT u.id, r.name AS role_name
       FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?`,
      [payload.sub],
    );
    if (!user) return res.status(401).json({ message: "User không tồn tại" });

    await db.query("DELETE FROM refresh_tokens WHERE token = ?", [
      refreshToken,
    ]);
    res.json(await issueTokens(user));
  } catch {
    res
      .status(401)
      .json({ message: "Refresh token hết hạn hoặc không hợp lệ" });
  }
};

const logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken)
    await db.query("DELETE FROM refresh_tokens WHERE token = ?", [
      refreshToken,
    ]);
  res.json({ message: "Đã đăng xuất" });
};

const me = async (req, res) => {
    try {
        const userId = req.user.id;
        const [users] = await db.query(
            `SELECT u.id, u.full_name, u.email, r.name AS role_name
             FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?`,
            [userId]
        );
      if (users.length == 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.json({
        user: users[0],
      });
    } catch (error) {
        console.error("Error fetching user info:", error);
        
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
}

module.exports = { refreshExpiry, register, login, refresh, logout, me };