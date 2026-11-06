const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");

const signAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, role: user.role_name },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_EXPIRES },
  );

const signRefreshToken = (user) =>
  jwt.sign(
    { sub: user.id, jti: randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: `${process.env.REFRESH_EXPIRES_DAYS}d` },
  );

const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken };
