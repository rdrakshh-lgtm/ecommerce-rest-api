const express = require("express");

const {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require("../controllers/cartController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All cart routes require login
router.use(protect);

// Get my cart
router.get("/", getCart);

// Add product to cart
router.post("/", addToCart);

// Update product quantity
router.put("/", updateCartItem);

// Remove product from cart
router.delete("/:productId", removeFromCart);

// Clear entire cart
router.delete("/", clearCart);

module.exports = router;