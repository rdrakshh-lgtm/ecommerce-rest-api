const express = require("express");

const {
    getAllOrders,
    updateOrderStatus
} = require("../controllers/adminOrderController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// All admin order routes require authentication + admin role
router.use(protect);
router.use(authorizeRoles("admin"));

// Get all orders
router.get("/", getAllOrders);

// Update order status
router.put("/:id/status", updateOrderStatus);

module.exports = router;