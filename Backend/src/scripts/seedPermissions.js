require("dotenv").config();
const { randomUUID } = require("crypto");
const db = require("../config/database");
const { PERMISSIONS, ALL_CODES, ROLES } = require("../constants/permissions");

async function sync() {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();   
    // 1. Permissions: thêm quyền mới
    const newPerms = new Set();
    for (const p of Object.values(PERMISSIONS)) {
      const [r] = await conn.query(
        "INSERT IGNORE INTO permissions (id, code, name, module) VALUES (?, ?, ?, ?)",
        [randomUUID(), p.code, p.name, p.module],
      );
      if (r.affectedRows) newPerms.add(p.code);                  
      else await conn.query(                                     
        "UPDATE permissions SET name = ?, module = ? WHERE code = ?",
        [p.name, p.module, p.code],
      );
    }

    // 2. Roles: thêm role mới 
    const newRoles = new Set();
    for (const r of ROLES) {
      const [x] = await conn.query(
        "INSERT IGNORE INTO roles (id, name, description) VALUES (?, ?, ?)",
        [randomUUID(), r.name, r.description],
      );
      if (x.affectedRows) newRoles.add(r.name);
    }

    // 3. Gắn quyền
    for (const r of ROLES) {
      const wanted = r.permissions === "*" ? ALL_CODES : r.permissions;
      let toGrant;
      if (r.name === "ADMIN") toGrant = ALL_CODES;                          
      else if (newRoles.has(r.name)) toGrant = wanted;                     
      else toGrant = wanted.filter((c) => newPerms.has(c));                 
      if (!toGrant.length) continue;

      await conn.query(
        `INSERT IGNORE INTO role_permissions (role_id, permission_id)
         SELECT ro.id, p.id FROM roles ro JOIN permissions p ON p.code IN (?)
         WHERE ro.name = ?`,
        [toGrant, r.name],
      );
    }

    await conn.commit();
    console.log(`Xong. Quyền mới: ${[...newPerms].join(", ") || "không có"}`);
    console.log(`Role mới: ${[...newRoles].join(", ") || "không có"}`);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

sync()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => db.end());   