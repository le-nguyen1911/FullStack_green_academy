const Category = require('../models/categoryModel');

// GET /api/categories
const index = async (req, res) => {
	try {
		const categories = await Category.getAll();

		res.status(200).json({
			data: categories,
			message: 'Get category list successfully'
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'Internal server error'
		});
	}
};

module.exports = {
	index
};
