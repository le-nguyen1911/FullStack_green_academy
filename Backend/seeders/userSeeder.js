const bcrypt = require('bcrypt');
const db = require('../config/db');

const seedUsers = async () => {
	try {
		// Xóa dữ liệu users cũ
		await db.query('DELETE FROM users');

		// Reset AUTO_INCREMENT
		await db.query('ALTER TABLE users AUTO_INCREMENT = 1');

		// Hash passwords
		const userPassword = await bcrypt.hash('123456', 10);
		const adminPassword = await bcrypt.hash('admin123', 10);

		const users = [
			['Nguyen Van A', 'user1@gmail.com', userPassword, 'user'],
			['Tran Thi B', 'user2@gmail.com', userPassword, 'user'],
			['Administrator', 'admin@gmail.com', adminPassword, 'admin']
		];

		await db.query(
			`INSERT INTO users (name, email, password, role)
             VALUES ?`,
			[users]
		);

		console.log('Seed users successfully!');
		console.table([
			{
				email: 'user1@gmail.com',
				password: '123456',
				role: 'user'
			},
			{
				email: 'user2@gmail.com',
				password: '123456',
				role: 'user'
			},
			{
				email: 'admin@gmail.com',
				password: 'admin123',
				role: 'admin'
			}
		]);
	} catch (error) {
		console.error('Seeder failed:', error);
	} finally {
		await db.end();
	}
};

seedUsers();
