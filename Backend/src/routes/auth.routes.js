const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const auth = require("../controller/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");

const limiter = (limit, message) =>
  rateLimit({ windowMs: 15 * 60 * 1000, limit, message: { message } });

const loginLimiter = limiter(
  10,
  "Thử đăng nhập quá nhiều lần, vui lòng thử lại sau",
);
const forgotLimiter = limiter(5, "Yêu cầu quá nhiều lần, vui lòng thử lại sau");
const resetLimiter = limiter(10, "Thử quá nhiều lần, vui lòng thử lại sau");

router.post("/register", auth.register);
router.post("/login", loginLimiter, auth.login);
router.post("/refresh", auth.refresh);
router.post("/logout", auth.logout);
router.get("/me", authenticate, auth.me);
router.patch("/me", authenticate, auth.updateProfile);
router.post("/forgot-password", forgotLimiter, auth.forgotPassword);
router.post("/reset-password", resetLimiter, auth.resetPassword);
router.post("/change-password", authenticate, auth.changePassword);
router.post("/verify-reset-otp", resetLimiter, auth.verifyResetOTP);
module.exports = router;
