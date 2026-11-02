const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const User = require('../models/userModel');

const register = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({
				message: 'Name, email, password are required'
			});
		}

		const existingUsers = await User.getUserByEmail(email);
		if (existingUsers.length > 0) {
			return res.status(409).json({
				message: 'Email already exists'
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const result = await User.create(name, email, hashedPassword, 'user');
		res.status(201).json({
			data: {
				id: result.insertId,
				name,
				email,
				role: 'user'
			},
			message: 'Register successfully'
		});
	} catch (error) {
		console.error(error);

		res.status(500).json({
			message: 'Internal server error'
		});
	}
};

const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				message: 'Email and password are required'
			});
		}

		const users = await User.getUserByEmail(email);
		if (users.length == 0) {
			return res.status(401).json({
				message: 'Invalid email or password'
			});
		}

		const user = users[0];
		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(401).json({
				message: 'Invalid email or password'
			});
		}

		const token = jwt.sign(
			{
				id: user.id,
				email: user.email,
				role: user.role
			},
			process.env.JWT_SECRET,
			{
				expiresIn: process.env.JWT_EXPIRES_IN || '1h'
			}
		);

		res.json({
			message: 'Login successfully',
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role
			}
		});
	} catch (error) {
		console.error(error);

		res.status(500).json({
			message: 'Internal server error'
		});
	}
};

const me = async (req, res) => {
	try {
		const userId = req.user.id;

		const [users] = await db.query(
			`SELECT id, name, email, role, created_at
            FROM users
            WHERE id = ?`,
			[userId]
		);

		if (users.length == 0) {
			return res.status(404).json({
				message: 'User not found'
			});
		}

		res.json({
			user: users[0]
		});
	} catch (error) {
		console.error(error);

		res.status(500).json({
			message: 'Internal server error'
		});
	}
};

module.exports = {
	register,
	login,
	me
};
