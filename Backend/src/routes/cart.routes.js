const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { authenticate } = require("../middleware/auth.middleware");
const cart = require("../controller/cart.controller");

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60, 
  message: { message: "Thao tác quá nhanh, vui lòng thử lại sau" },
});

router.use(authenticate); 

router.get("/", cart.get);
router.post("/items", writeLimiter, cart.addItem); 
router.patch("/items/:itemId", writeLimiter, cart.updateItem); 
router.delete("/items/:itemId", writeLimiter, cart.removeItem);
router.delete("/", writeLimiter, cart.clear);

module.exports = router;
