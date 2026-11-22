const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const controller = require("../controller/order.controller");

const asyncRoute = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.use(authenticate);
router.post("/", asyncRoute(controller.create));
router.get("/my-orders", asyncRoute(controller.mine));
router.get("/:id", asyncRoute(controller.detail));

module.exports = router;