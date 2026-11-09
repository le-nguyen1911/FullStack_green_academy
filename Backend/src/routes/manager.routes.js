const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { P } = require("../constants/permission");
const productController = require("../controller/product.controller");

router.use(authenticate);

//product
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
module.exports = router;
