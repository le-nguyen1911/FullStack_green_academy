const bcrypt = require("bcrypt");
const pool = require("../config/db");

const verifySeed = async () => {
    try {
        const [rows] = await pool.execute(
            `SELECT u.email, u.password, r.name AS role
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.email LIKE '%@example.com'`
        );

        if (rows.length === 0) {
            throw new Error("Chưa có tài khoản mẫu nào trong CSDL!");
        }

        let validCount = 0;
        for (const user of rows) {
            const matches = await bcrypt.compare("Demo@123", user.password);
            if (!matches) {
                console.log(`Bỏ qua tài khoản cũ không khớp mật khẩu: ${user.email}`);
                continue;
            }
            console.log(`OK: ${user.email} - Vai trò: ${user.role}`);
            validCount++;
        }
        console.log(`\nKiểm tra thành công! Tổng số ${validCount} tài khoản hợp lệ.`);
    } catch (error) {
        console.error("Lỗi xác thực:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

verifySeed();