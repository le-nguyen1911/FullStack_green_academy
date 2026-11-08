require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./src/config/database");
const auth = require("./src/controller/auth.controller");
const { authenticate, authorize } = require("./src/middleware/auth.middleware");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/api/auth/register", auth.register);
app.post("/api/auth/login", auth.login);
app.post("/api/auth/refresh", auth.refresh);

app.post("/api/auth/forgot-password", auth.forgotPassword);
app.post("/api/auth/reset-password", auth.resetPassword);

app.post("/api/auth/logout", authenticate, auth.logout);
app.get("/api/auth/me", authenticate, auth.me);
app.patch("/api/auth/change-password", authenticate, auth.changePassword);
app.use("/api/admin", require("./src/routes/admin.routes"));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
