const router = require("express").Router();
const { authenticate } = require("../middleware/auth.middleware");
const controller = require("../controller/order.controller");

const asyncRoute = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.use(authenticate);
router.get("/", asyncRoute(controller.index));
router.post("/", asyncRoute(controller.create));
router.get("/my-orders", asyncRoute(controller.mine));
router.get("/:id", asyncRoute(controller.detail));
router.patch("/:id", asyncRoute(controller.updateStatus));

module.exports = router;