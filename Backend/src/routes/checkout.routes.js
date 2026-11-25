const router = require("express").Router();
const requireAuth = require("../middlewares/requireAuth");
const authorize = require("../middlewares/authorize");
const { asyncRoute } = require("../utils/catalogHelpers");
const { options, create } = require("../controllers/checkoutController");

router.use(requireAuth, authorize("CUSTOMER"));
router.get("/options", asyncRoute(options));
router.post("/", asyncRoute(create));

module.exports = router;