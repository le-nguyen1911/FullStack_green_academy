const db = require("../config/database");

const deleteByUser = async (userId, conn = db) => {
  await conn.query("DELETE FROM refresh_tokens WHERE user_id = ?", [userId]);
};

module.exports = { deleteByUser };
