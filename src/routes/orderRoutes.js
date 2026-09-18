const express = require("express");

const {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All order routes require login
router.use(protect);

// Place order
router.post("/", createOrder);

// Get my orders
router.get("/", getMyOrders);

// Get single order
router.get("/:id", getOrderById);

// Cancel order
router.delete("/:id", cancelOrder);

module.exports = router;