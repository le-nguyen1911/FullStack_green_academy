const service = require("../services/auth.service");

const REFRESH_COOKIE = "refreshToken";
const COOKIE_PATH = "/api/auth";

const baseCookie = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: COOKIE_PATH,
});

const setRefreshCookie = (res, token) =>
  res.cookie(REFRESH_COOKIE, token, {
    ...baseCookie(),
    maxAge: Number(process.env.REFRESH_EXPIRES_DAYS) * 24 * 60 * 60 * 1000,
  });

const clearRefreshCookie = (res) =>
  res.clearCookie(REFRESH_COOKIE, baseCookie());

exports.register = async (req, res) => {
  await service.register(req.body);
  res.status(201).json({ message: "Đăng ký thành công" });
};

exports.login = async (req, res) => {
  const { refreshToken, ...result } = await service.login(req.body);
  setRefreshCookie(res, refreshToken);
  res.json(result);
};

exports.refresh = async (req, res) => {
  try {
    const { accessToken, refreshToken } = await service.refresh(
      req.cookies?.[REFRESH_COOKIE],
    );
    setRefreshCookie(res, refreshToken);
    res.json({ accessToken });
  } catch (err) {
    clearRefreshCookie(res);
    throw err;
  }
};

exports.logout = async (req, res) => {
  await service.logout(req.cookies?.[REFRESH_COOKIE]);
  clearRefreshCookie(res);
  res.json({ message: "Đã đăng xuất" });
};

exports.me = async (req, res) =>
  res.json({ user: await service.getMe(req.user.id) });

exports.updateProfile = async (req, res) =>
  res.json({ user: await service.updateProfile(req.user.id, req.body) });

exports.changePassword = async (req, res) => {
  await service.changePassword(req.user.id, req.body);
  clearRefreshCookie(res);
  res.json({ message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại" });
};

exports.forgotPassword = async (req, res) => {
  await service.forgotPassword(req.body.email);
  res.json({ message: "Nếu email tồn tại, mã OTP sẽ được gửi đến hộp thư" });
};

exports.resetPassword = async (req, res) => {
  await service.resetPassword(req.body);
  res.json({ message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại" });
};
exports.verifyResetOTP = async (req, res) => {
  await service.verify_otp(req.body);

  res.json({
    message: "Xác thực OTP thành công",
  });
};