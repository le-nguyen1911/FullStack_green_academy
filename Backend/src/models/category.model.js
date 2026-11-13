const { randomUUID } = require("crypto");
const db = require("../config/database");

const list = async () => {
  const [rows] = await db.query(
    "SELECT id, name, description FROM categories ORDER BY name",
  );
  return rows;
};

module.exports = { list };
