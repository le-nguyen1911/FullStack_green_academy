const router = require("express").Router();
const productController = require("../controller/product.controller");
const review = require("../controller/review.controller")
const { authenticate } = require("../middleware/auth.middleware");
const rateLimit = require("express-rate-limit");

const limiter = (limit, message) =>
    rateLimit({ windowMs: 15 * 60 * 1000, limit, message: { message } });

const reviewLimiter = limiter(5, "Yêu cầu quá nhiều lần, vui lòng thử lại sau");


router.get("/products/price-range", productController.getPriceRange);
router.get("/products", productController.listPublic);
router.get("/products/:id", productController.getPublic);
router.get("/products/:id/related", productController.getRelated);

router.get("/products/:id/reviews", review.list);
router.get("/products/:id/reviews/me", authenticate, review.getMine);
router.put(
  "/products/:id/reviews/me",
  authenticate,
  reviewLimiter,
  review.saveMine,
);
router.delete(
  "/products/:id/reviews/me",
  authenticate,
  reviewLimiter,
  review.removeMine,
);

router.get("/categories", productController.listcategories);
router.get("/brands", productController.listBrands);
module.exports = router;
