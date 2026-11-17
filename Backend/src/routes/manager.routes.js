const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { P } = require("../constants/permission");
const productController = require("../controller/product.controller");
const upload = require("../controller/upload.controller");
const { uploadImages } = require("../middleware/upload.middleware");
const rateLimit = require("express-rate-limit");
const dashboardController = require("../controller/dashboard.controller");
const reviewAdmin = require("../controller/reviewAdmin.controller");
const userController = require("../controller/user.controller");
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
router.get("/reviews", authorize(P.REVIEW_MANAGE), reviewAdmin.list); 
router.get("/reviews/:id", authorize(P.REVIEW_MANAGE), reviewAdmin.getOne);
router.patch(
  "/reviews/:id/status",
  authorize(P.REVIEW_MANAGE),
  reviewAdmin.setStatus,
); 
router.delete("/reviews/:id", authorize(P.REVIEW_MANAGE), reviewAdmin.remove); 
// USER MANAGEMENT
router.get(
  "/users",
  authorize(P.USER_READ),
  userController.list,
);

router.get(
  "/users/:id",
  authorize(P.USER_READ),
  userController.getOne,
);

router.patch(
  "/users/:id",
  authorize(P.USER_MANAGE),
  userController.update,
);

router.patch(
  "/users/:id/role",
  authorize(P.USER_MANAGE),
  userController.updateRole,
);

router.patch(
  "/users/:id/status",
  authorize(P.USER_MANAGE),
  userController.setStatus,
);
router.get("/dashboard", dashboardController.getDashboard);
module.exports = router;
