  const mysql = require("mysql2/promise");

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  async function testConnection() {
    try {
      const [rows] = await pool.query("SELECT 1 + 1 AS result");
      console.log(
        "Đã kết nối thành công đến MySQL! ",
      );
    } catch (error) {
      console.error("❌ Kết nối MySQL thất bại. Vui lòng kiểm tra lại cấu hình!");
      console.error("Chi tiết lỗi:", error.message);
      process.exit(1);
    }
  }

  testConnection();

  module.exports = pool;
