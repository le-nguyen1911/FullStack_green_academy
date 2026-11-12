const db = require("../config/database");

const isUsed = async (url) => {
  const [rows] = await db.query(
    `SELECT 1 FROM products WHERE image_url = ? OR JSON_CONTAINS(images, JSON_QUOTE(?))
     UNION ALL
     SELECT 1 FROM brands WHERE logo_url = ?
     LIMIT 1`,
    [url, url, url],
  );
  return rows.length > 0;
};

module.exports = { isUsed };
