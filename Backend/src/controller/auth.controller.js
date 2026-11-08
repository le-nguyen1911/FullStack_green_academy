const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { randomUUID, randomInt } = require("crypto");
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
      [userId],
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
};

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendResetOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Ecommerce - Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset</h2>
        <p>Your password reset verification code is:</p>

        <h1 style="letter-spacing: 8px; color: #2563eb;">
          ${otp}
        </h1>

        <p>This code expires in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
};
transporter
  .verify()
  .then(() => {
    console.log("SMTP connection successful");
  })
  .catch((error) => {
    console.error("SMTP connection failed:", error.message);
  });

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 8 ký tự",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Mật khẩu xác nhận không khớp",
      });
    }

    const [users] = await db.query("SELECT password FROM users WHERE id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Mật khẩu hiện tại không chính xác",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    await db.query("DELETE FROM refresh_tokens WHERE user_id = ?", [userId]);

    return res.status(200).json({
      message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại",
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Vui lòng nhập email",
      });
    }

    const [users] = await db.query(
      "SELECT id, email FROM users WHERE email = ?",
      [email],
    );

    if (users.length === 0) {
      return res.status(200).json({
        message: "Nếu email tồn tại, mã OTP sẽ được gửi đến hộp thư",
      });
    }

    const user = users[0];

    const otp = randomInt(100000, 1000000).toString();

    const otpHash = await bcrypt.hash(otp, 10);

    const expiresMinutes = Number(process.env.RESET_OTP_EXPIRES_MINUTES || 10);

    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

    await db.query("DELETE FROM password_reset_otps WHERE user_id = ?", [
      user.id,
    ]);

    await db.query(
      `INSERT INTO password_reset_otps
       (id, user_id, otp_hash, expires_at)
       VALUES (?, ?, ?, ?)`,
      [randomUUID(), user.id, otpHash, expiresAt],
    );

    try {
      await sendResetOTP(email, otp);
    } catch (mailError) {
      await db.query("DELETE FROM password_reset_otps WHERE user_id = ?", [
        user.id,
      ]);

      throw mailError;
    }

    return res.status(200).json({
      message: "Nếu email tồn tại, mã OTP sẽ được gửi đến hộp thư",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const connection = await db.getConnection();

  try {
    const email = req.body.email?.trim().toLowerCase();
    const { otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message: "OTP không hợp lệ",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 8 ký tự",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Mật khẩu xác nhận không khớp",
      });
    }

    await connection.beginTransaction();

    const [users] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (users.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        message: "Email hoặc OTP không hợp lệ",
      });
    }

    const userId = users[0].id;

    const [otps] = await connection.query(
      `SELECT id, otp_hash, attempts
       FROM password_reset_otps
       WHERE user_id = ?
         AND used_at IS NULL
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [userId],
    );

    if (otps.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        message: "OTP đã hết hạn hoặc không tồn tại",
      });
    }

    const resetOTP = otps[0];

    if (resetOTP.attempts >= 5) {
      await connection.rollback();

      return res.status(400).json({
        message: "Bạn đã nhập sai OTP quá số lần cho phép",
      });
    }

    const isMatch = await bcrypt.compare(otp, resetOTP.otp_hash);

    if (!isMatch) {
      await connection.query(
        `UPDATE password_reset_otps
         SET attempts = attempts + 1
         WHERE id = ?`,
        [resetOTP.id],
      );

      await connection.commit();

      return res.status(400).json({
        message: "OTP không chính xác",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await connection.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    await connection.query(
      `UPDATE password_reset_otps
       SET used_at = NOW()
       WHERE id = ?`,
      [resetOTP.id],
    );

    await connection.query("DELETE FROM refresh_tokens WHERE user_id = ?", [
      userId,
    ]);

    await connection.commit();

    return res.status(200).json({
      message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại",
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};
module.exports = {
  refreshExpiry,
  register,
  login,
  refresh,
  logout,
  me,
  sendResetOTP,
  changePassword,
  forgotPassword,
  resetPassword,
};
