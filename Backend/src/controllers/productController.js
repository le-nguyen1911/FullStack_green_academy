const Product = require('../models/productModel');

const AppError = require('../utils/AppError');


const index = async (req, res, next) => {
    try {
        const products = await Product.getAll();
        if (!products) {
            throw new AppError('Cannot load product list', 500);
        }

        res.status(200).json({
            data: products,
            message: 'Get product list successfully'
        });
    } catch (error) {
        next(error);
    }
};


const show = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.getById(id);

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        res.status(200).json({
            data: product,
            message: 'Get product details successfully'
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    index,
    show
};

