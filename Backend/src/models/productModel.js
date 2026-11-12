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

module.exports = {
    getAll,
    getById,
};