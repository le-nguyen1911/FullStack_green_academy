const bcrypt = require("bcryptjs");
const { randomInt } = require("crypto");
const AppError = require("../utils/AppError");
const withTransaction = require("../utils/transaction");
const { sendResetOTP } = require("../utils/mailer");
const userModel = require("../models/user.model");
const roleModel = require("../models/role.model");
const refreshTokenModel = require("../models/refreshToken.model");
const passwordResetModel = require("../models/passwordReset.model");
const { getUserPermissions } = require("./permission.service");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 72; 
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_SECONDS = 60;
const OTP_FAIL =
  "OTP không hợp lệ hoặc đã hết hạn. Nếu nhập sai nhiều lần, hãy yêu cầu mã mới";

const refreshExpiry = () =>
  new Date(
    Date.now() + Number(process.env.REFRESH_EXPIRES_DAYS) * 24 * 60 * 60 * 1000,
  );

const issueTokens = async (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await refreshTokenModel.create({
    userId: user.id,
    token: refreshToken,
    expiresAt: refreshExpiry(),
  });
  return { accessToken, refreshToken };
};

const assertPasswordLength = (password) => {
  if (typeof password !== "string" || password.length < MIN_PASSWORD)
    throw new AppError(400, `Mật khẩu phải có ít nhất ${MIN_PASSWORD} ký tự`);
  if (password.length > MAX_PASSWORD)
    throw new AppError(400, `Mật khẩu tối đa ${MAX_PASSWORD} ký tự`);
};

const assertNewPassword = (newPassword, confirmPassword) => {
  assertPasswordLength(newPassword);
  if (newPassword !== confirmPassword)
    throw new AppError(400, "Mật khẩu xác nhận không khớp");
};

const register = async ({ full_name, email, password, phone, address }) => {
  if (!full_name?.trim() || !email || !password)
    throw new AppError(400, "Thiếu thông tin bắt buộc");
  if (!EMAIL_RE.test(email)) throw new AppError(400, "Email không hợp lệ");
  assertPasswordLength(password);

  const cleanEmail = email.trim().toLowerCase();
  if (await userModel.emailExists(cleanEmail))
    throw new AppError(409, "Email đã tồn tại");

  const role = await roleModel.findByName("CUSTOMER");
  if (!role) throw new AppError(500, "Chưa có role CUSTOMER, hãy chạy seed");

  await userModel.create({
    roleId: role.id,
    fullName: full_name.trim(),
    email: cleanEmail,
    passwordHash: await bcrypt.hash(password, 12),
    phone,
    address,
  });
};

const login = async ({ email, password }) => {
  const user =
    email && password
      ? await userModel.findByEmailWithRole(String(email).trim().toLowerCase())
      : null;

  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new AppError(401, "Email hoặc mật khẩu không đúng");

  const tokens = await issueTokens(user);
  return {
    ...tokens,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role_name,
      permissions: [...(await getUserPermissions(user.id))],
    },
  };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) throw new AppError(401, "Thiếu refresh token");

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "Refresh token hết hạn hoặc không hợp lệ");
  }
  if (!(await refreshTokenModel.consume(refreshToken)))
    throw new AppError(401, "Refresh token không hợp lệ");

  const user = await userModel.findByIdWithRole(payload.sub);
  if (!user) throw new AppError(401, "User không tồn tại");
  return issueTokens(user);
};

const logout = async (refreshToken) => {
  if (refreshToken) await refreshTokenModel.deleteByToken(refreshToken);
};

const getMe = async (userId) => {
  const user = await userModel.findByIdWithRole(userId);
  if (!user) throw new AppError(404, "User not found");
  const { role_id, ...safe } = user;
  return { ...safe, permissions: [...(await getUserPermissions(user.id))] };
};

const changePassword = async (
  userId,
  { currentPassword, newPassword, confirmPassword },
) => {
  if (!currentPassword || !newPassword || !confirmPassword)
    throw new AppError(400, "Vui lòng nhập đầy đủ thông tin");
  assertNewPassword(newPassword, confirmPassword);

  const hash = await userModel.findPasswordHash(userId);
  if (!hash) throw new AppError(404, "Không tìm thấy người dùng");
  if (!(await bcrypt.compare(currentPassword, hash)))
    throw new AppError(400, "Mật khẩu hiện tại không chính xác");
  if (currentPassword === newPassword)
    throw new AppError(400, "Mật khẩu mới phải khác mật khẩu hiện tại");

  const newHash = await bcrypt.hash(newPassword, 12);
  await withTransaction(async (conn) => {
    await userModel.updatePassword(userId, newHash, conn);
    await refreshTokenModel.deleteByUser(userId, conn); 
  });
};


const forgotPassword = async (email) => {
  const cleanEmail = email?.trim().toLowerCase();
  if (!cleanEmail || !EMAIL_RE.test(cleanEmail))
    throw new AppError(400, "Vui lòng nhập email hợp lệ");

  const user = await userModel.findByEmail(cleanEmail);
  if (!user) return;

  const age = await passwordResetModel.latestAgeSeconds(user.id);
  if (age !== null && age < OTP_RESEND_SECONDS) return;

  const otp = String(randomInt(100000, 1000000)); 
  const otpHash = await bcrypt.hash(otp, 10);

  await withTransaction(async (conn) => {
    await passwordResetModel.deleteByUser(user.id, conn);
    await passwordResetModel.create(
      {
        userId: user.id,
        otpHash,
        expiresMinutes: Number(process.env.RESET_OTP_EXPIRES_MINUTES || 10),
      },
      conn,
    );
  });

  if (process.env.NODE_ENV !== "production")
    console.log(`[DEV] OTP của ${cleanEmail}: ${otp}`);


  sendResetOTP(cleanEmail, otp).catch(async (err) => {
    console.error("Gửi mail OTP thất bại:", err.message);
    await passwordResetModel.deleteByUser(user.id).catch(() => {});
  });
};

const resetPassword = async ({ email, otp, newPassword, confirmPassword }) => {
  const cleanEmail = email?.trim().toLowerCase();
  if (!cleanEmail || !otp || !newPassword || !confirmPassword)
    throw new AppError(400, "Vui lòng nhập đầy đủ thông tin");
  if (!/^\d{6}$/.test(String(otp))) throw new AppError(400, "OTP không hợp lệ");
  assertNewPassword(newPassword, confirmPassword);

  
  const failure = await withTransaction(async (conn) => {
    const user = await userModel.findByEmail(cleanEmail, conn);
    if (!user) return OTP_FAIL;

    const record = await passwordResetModel.findActiveForUpdate(user.id, conn);
    if (!record || record.attempts >= OTP_MAX_ATTEMPTS) return OTP_FAIL;

    if (!(await bcrypt.compare(String(otp), record.otp_hash))) {
      await passwordResetModel.incrementAttempts(record.id, conn);
      return OTP_FAIL;
    }

    await userModel.updatePassword(
      user.id,
      await bcrypt.hash(newPassword, 12),
      conn,
    );
    await passwordResetModel.markUsed(record.id, conn); 
    await refreshTokenModel.deleteByUser(user.id, conn); 
    return null;
  });

  if (failure) throw new AppError(400, failure);
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
};
