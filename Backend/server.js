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

//auth
app.post('/api/auth/register', auth.register);
app.post('/api/auth/login', auth.login);
app.post('/api/auth/refresh', auth.refresh);
app.post('/api/auth/logout', auth.logout);
app.get('/api/auth/me', authenticate, auth.me);

app.use("/api/admin", require("./src/routes/admin.routes"));
app.get("/health/db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS currentTime");

    return res.status(200).json({
      status: "UP",
      database: "MySQL",
      message: "Kết nối cơ sở dữ liệu hoạt động bình thường.",
      dbTime: rows[0].currentTime,
    });
  } catch (error) {
    return res.status(500).json({
      status: "DOWN",
      database: "MySQL",
      message: "Không thể kết nối đến cơ sở dữ liệu.",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
