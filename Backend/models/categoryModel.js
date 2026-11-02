const db = require('../config/db');

const getAll = async () => {
	const [rows] = await db.query(`
        SELECT *
        FROM categories
        ORDER BY id ASC
    `);
	return rows;
};

module.exports = {
	getAll
};
