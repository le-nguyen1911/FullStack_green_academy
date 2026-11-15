const router = require("express").Router();
const productController = require("../controller/product.controller");

router.get("/products/price-range", productController.getPriceRange);
router.get("/products/all", productController.getAllProducts); 
router.get("/products", productController.listPublic);
router.get("/categories", productController.listcategories);
router.get("/brands", productController.listBrands);


router.get("/products/:id/related", productController.getRelated);
router.get("/products/detail/:id", productController.getProductById); 
router.get("/products/:id", productController.getPublic);

module.exports = router;