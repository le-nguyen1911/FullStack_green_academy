const db = require('../config/db');

const seedProducts = async () => {
	try {
		await db.query('SET FOREIGN_KEY_CHECKS = 0');

		await db.query('TRUNCATE TABLE products');

		await db.query('TRUNCATE TABLE categories');

		await db.query('SET FOREIGN_KEY_CHECKS = 1');

		await db.query(`
            INSERT INTO categories (name)
            VALUES
                ('Laptop'),
                ('Smartphone'),
                ('Tablet'),
                ('Accessories')
        `);

		await db.query(`
            INSERT INTO products
                (name, price, stock, category_id)
            VALUES
                ('MacBook Air M4', 24990000, 10, 1),
                ('Dell XPS 13', 32990000, 8, 1),
                ('iPhone 17', 24990000, 20, 2),
                ('Samsung Galaxy S26', 22990000, 15, 2),
                ('iPad Air', 16990000, 12, 3),
                ('Samsung Galaxy Tab', 14990000, 9, 3),
                ('Logitech MX Master', 2490000, 30, 4),
                ('Apple Magic Keyboard', 2990000, 25, 4)
        `);

		console.log('Seed products successfully.');
	} catch (error) {
		console.error('Seeder error:', error);
	} finally {
		await db.end();
	}
};

seedProducts();
