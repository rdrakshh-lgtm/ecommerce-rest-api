const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Add product to cart
const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({
                success: false,
                message: "Product ID and quantity are required"
            });
        }

        if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive whole number"
            });
        }

        const product = await Product.findById(productId);

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock"
            });
        }

        let cart = await Cart.findOne({
            user: req.user.userId
        });

        if (!cart) {
            cart = await Cart.create({
                user: req.user.userId,
                items: [
                    {
                        product: productId,
                        quantity: Number(quantity)
                    }
                ]
            });
        } else {
            const existingItem = cart.items.find(
                item => item.product.toString() === productId
            );

            if (existingItem) {
                const newQuantity =
                    existingItem.quantity + Number(quantity);

                if (newQuantity > product.stock) {
                    return res.status(400).json({
                        success: false,
                        message: "Requested quantity exceeds available stock"
                    });
                }

                existingItem.quantity = newQuantity;
            } else {
                cart.items.push({
                    product: productId,
                    quantity: Number(quantity)
                });
            }

            await cart.save();
        }

        await cart.populate("items.product");

        res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart
        });
    } catch (error) {
        console.error("Add to cart error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while adding product to cart"
        });
    }
};


// Get my cart
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user.userId
        }).populate("items.product");

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Cart is empty",
                cart: {
                    items: []
                }
            });
        }

        res.status(200).json({
            success: true,
            cart
        });
    } catch (error) {
        console.error("Get cart error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while fetching cart"
        });
    }
};


// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Product ID and quantity are required"
            });
        }

        if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive whole number"
            });
        }

        const product = await Product.findById(productId);

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (Number(quantity) > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock"
            });
        }

        const cart = await Cart.findOne({
            user: req.user.userId
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product is not in your cart"
            });
        }

        item.quantity = Number(quantity);

        await cart.save();
        await cart.populate("items.product");

        res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            cart
        });
    } catch (error) {
        console.error("Update cart error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while updating cart"
        });
    }
};


// Remove product from cart
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({
            user: req.user.userId
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const initialLength = cart.items.length;

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        if (cart.items.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: "Product is not in your cart"
            });
        }

        await cart.save();
        await cart.populate("items.product");

        res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart
        });
    } catch (error) {
        console.error("Remove from cart error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while removing product from cart"
        });
    }
};


// Clear cart
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user.userId
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Cart is already empty"
            });
        }

        cart.items = [];

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully"
        });
    } catch (error) {
        console.error("Clear cart error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while clearing cart"
        });
    }
};


module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
};