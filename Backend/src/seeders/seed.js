const bcrypt = require("bcrypt");
const pool = require("../config/db");
const crypto = require("crypto");
const demoPassword = "Demo@123";

const roles = [
    ["CUSTOMER", "Khách hàng"],
    ["MANAGER", "Nhân viên quản lý"],
    ["ADMIN", "Quản trị viên"]
];

const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng"];
const middleNames = ["Văn", "Thị", "Hữu", "Đình", "Minh", "Gia", "Hoàng", "Thanh", "Mỹ", "Quốc"];
const lastNames = ["An", "Bình", "Cường", "Dung", "Đức", "Hà", "Hải", "Hòa", "Hùng", "Khang", "Linh", "Long", "Nam", "Nga", "Phong", "Phúc", "Quân", "Sơn", "Tâm", "Thảo", "Trang", "Tú", "Vân", "Yến"];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomPhone = () => {
    const prefixes = ["090", "091", "093", "094", "096", "097", "098", "032", "033", "034", "035", "036", "037", "038", "039", "070", "079", "077", "076", "078", "083", "084", "085", "081", "082"];
    const prefix = getRandomItem(prefixes);
    const suffix = Math.floor(1000000 + Math.random() * 9000000);
    return `${prefix}${suffix}`;
};

const generateRandomAccounts = (count = 6) => {
    const generatedAccounts = [];
    const usedEmails = new Set();

    for (let i = 1; i <= count; i++) {
        const fName = getRandomItem(firstNames);
        const mName = getRandomItem(middleNames);
        const lName = getRandomItem(lastNames);
        const fullName = `${fName} ${mName} ${lName}`;

        const cleanEmailName = `${lName.toLowerCase()}${mName[0].toLowerCase()}${fName[0].toLowerCase()}${Math.floor(100 + Math.random() * 900)}`;
        const email = `${cleanEmailName}@example.com`;

        if (usedEmails.has(email)) continue;
        usedEmails.add(email);

        const randRoleRoll = Math.random();
        let role = "CUSTOMER";
        if (randRoleRoll > 0.85) {
            role = "ADMIN";
        } else if (randRoleRoll > 0.65) {
            role = "MANAGER";
        }

        generatedAccounts.push({
            id: crypto.randomUUID(),
            name: fullName,
            email: email,
            phone: getRandomPhone(),
            role: role
        });
    }

    return generatedAccounts;
};

const seed = async () => {
    let connection;
    try {
        if (process.env.NODE_ENV === "production") {
            throw new Error("Không chạy dữ liệu demo trên production");
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Seed các vai trò (roles)
        for (const [name, description] of roles) {
            await connection.execute(
                `INSERT INTO roles (id, name, description)
         SELECT ?, ?, ? WHERE NOT EXISTS
         (SELECT 1 FROM roles WHERE name = ?)`,
                [crypto.randomUUID(), name, description, name]
            );
        }

        const [roleRows] = await connection.execute("SELECT id, name FROM roles");
        const roleIds = new Map(roleRows.map((r) => [r.name, r.id]));

        // 2. Tạo tài khoản ngẫu nhiên
        const accounts = generateRandomAccounts(6);
        let inserted = 0;

        for (const account of accounts) {
            const [existing] = await connection.execute(
                "SELECT id FROM users WHERE email = ?",
                [account.email]
            );

            if (existing.length) {
                console.log(`Bỏ qua tài khoản đã có sẵn: ${account.email}`);
                continue;
            }

            const roleId = roleIds.get(account.role);
            if (!roleId) throw new Error(`Thiếu vai trò ${account.role}`);

            const passwordHash = await bcrypt.hash(demoPassword, 12);


            await connection.execute(
                `INSERT INTO users
         (id, role_id, full_name, email, phone, password)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [account.id, roleId, account.name, account.email, account.phone, passwordHash]
            );

            console.log(`-> Đã tạo tài khoản ngẫu nhiên: [${account.role}] ${account.name} (${account.email})`);
            inserted += 1;
        }

        await connection.commit();
        console.log(`\nSeed thành công. Đã tạo mới tổng cộng ${inserted} tài khoản ngẫu nhiên.`);
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Seed thất bại:", error.message);
        process.exitCode = 1;
    } finally {
        if (connection) connection.release();
        await pool.end();
    }
};

seed();