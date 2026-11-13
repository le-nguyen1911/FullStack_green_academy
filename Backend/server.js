require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const refreshTokenModel = require("./src/models/refreshToken.model");
const passwordResetModel = require("./src/models/passwordReset.model");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/admin", require("./src/routes/admin.routes"));
app.use("/api/manager", require("./src/routes/manager.routes"));
app.use("/api", require("./src/routes/public.routes"));

setInterval(
  () => {
    refreshTokenModel.deleteExpired().catch(console.error);
    passwordResetModel.deleteExpired().catch(console.error);
  },
  60 * 60 * 1000,
).unref();

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.status ? err.message : "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
