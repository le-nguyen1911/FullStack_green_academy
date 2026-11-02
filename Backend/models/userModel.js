const db = require('../config/db');

const getUserByEmail = async email => {
	const [rows] = await db.query(
		`
        SELECT * FROM users WHERE email = ?    
    `,
		[email]
	);
	return rows;
};

const create = async (name, email, password, role) => {
	const [result] = await db.query(
		`
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)    
    `,
		[name, email, password, role]
	);
	return result;
};

module.exports = {
	getUserByEmail,
	create
};
