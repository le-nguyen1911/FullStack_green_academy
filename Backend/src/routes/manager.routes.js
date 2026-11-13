const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { P } = require("../constants/permission");
const productController = require("../controller/product.controller");
const upload = require("../controller/upload.controller");
const { uploadImages } = require("../middleware/upload.middleware");
const rateLimit = require("express-rate-limit");
router.use(authenticate);

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  message: { message: "Tải ảnh quá nhiều, vui lòng thử lại sau" },
});

router.get(
  "/products",
  authorize(P.PRODUCT_READ),
  productController.listManager,
);
router.get(
  "/products/:id",
  authorize(P.PRODUCT_READ),
  productController.getManager,
);
router.post("/products", authorize(P.PRODUCT_CREATE), productController.create);
router.patch(
  "/products/:id",
  authorize(P.PRODUCT_UPDATE),
  productController.update,
);
router.delete(
  "/products/:id",
  authorize(P.PRODUCT_DELETE),
  productController.remove,
);

router.post(
  "/products/:id/variants",
  authorize(P.PRODUCT_UPDATE),
  productController.addVariant,
);
router.patch(
  "/variants/:variantId",
  authorize(P.PRODUCT_UPDATE),
  productController.updateVariant,
);
router.delete(
  "/variants/:variantId",
  authorize(P.PRODUCT_DELETE),
  productController.removeVariant,
);
router.patch(
  "/variants/:variantId/stock",
  authorize(P.PRODUCT_STOCK),
  productController.adjustStock,
);
router.post(
  "/uploads/images",
  authorize(P.PRODUCT_CREATE, P.PRODUCT_UPDATE, P.BRAND_MANAGE),
  uploadLimiter,
  uploadImages,
  upload.images,
);
module.exports = router;
