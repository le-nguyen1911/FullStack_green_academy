const router = require("express").Router();
const productController = require("../controller/product.controller");

router.get("/products/price-range", productController.getPriceRange);
router.get("/products", productController.listPublic);
router.get("/products/:id", productController.getPublic);
router.get("/products/:id/related", productController.getRelated);
router.get("/categories", productController.listcategories);
router.get("/brands", productController.listBrands);
module.exports = router;
