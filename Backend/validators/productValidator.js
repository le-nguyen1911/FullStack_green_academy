const { body } = require('express-validator');

const createProductValidator = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Product name is required')
		.isLength({ min: 3, max: 100 })
		.withMessage('Product name must be 3-100 characters'),
	body('price')
		.notEmpty()
		.withMessage('Price is required')
		.isInt({ min: 0 })
		.withMessage('Price must be ≥ 0'),
	body('stock')
		.notEmpty()
		.withMessage('Stock is required')
		.isInt({ min: 0 })
		.withMessage('Stock must be ≥ 0'),
	body('category_id').notEmpty().withMessage('Category is required')
];

module.exports = {
	createProductValidator
};
