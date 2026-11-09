const router = require("express").Router();
const productController = require("../controller/product.controller");

router.get("/products/price-range", productController.getPriceRange);
router.get("/products", productController.listPublic);
router.get("/products/:id", productController.getPublic);

module.exports = router;
