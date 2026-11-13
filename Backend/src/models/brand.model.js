const db = require("../config/database");

const list = async () => {
  const [rows] = await db.query(
    "SELECT id, name, logo_url FROM brands ORDER BY name",
  );
  return rows;
};

module.exports = { list };
