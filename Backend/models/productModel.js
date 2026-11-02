const db = require('../config/db');

const getAll = async () => {
	const [rows] = await db.query(`
        SELECT p.*, c.name AS category_name
        FROM products p LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id ASC    
    `);
	return rows;
};

const getById = async id => {
	const [rows] = await db.query(
		`
        SELECT p.*, c.name AS category_name
        FROM products p LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?    
    `,
		[id]
	);
	return rows[0];
};

const create = async (name, price, stock, category_id) => {
	const [result] = await db.query(
		`
        INSERT INTO products (name, price, stock, category_id)
        VALUES (?, ?, ?, ?)    
    `,
		[name, price, stock, category_id]
	);
	return result;
};

const update = async (id, name, price, stock, category_id) => {
	const [result] = await db.query(
		`
        UPDATE products
        SET name = ?, price = ?, stock = ?, category_id = ?
        WHERE id = ?
        `,
		[name, price, stock, category_id, id]
	);
	return result;
};

const remove = async id => {
	const [result] = await db.query(
		`
    DELETE FROM products
    WHERE id = ?    
    `,
		[id]
	);
	return result;
};

const search = async keyword => {
	const [result] = await db.query(
		`
        SELECT *
        FROM products
        WHERE name LIKE ?
        `,
		[`%${keyword}%`]
	);
	return result;
};

module.exports = {
	getAll,
	getById,
	create,
	update,
	remove,
	search
};
