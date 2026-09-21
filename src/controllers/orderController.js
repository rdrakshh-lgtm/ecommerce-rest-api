const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Place an order
const createOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { shippingAddress } = req.body;

        if (!shippingAddress || !shippingAddress.trim()) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required"
            });
        }

        let createdOrder;

        await session.withTransaction(async () => {
            const cart = await Cart.findOne({
                user: req.user.userId
            })
                .populate("items.product")
                .session(session);

            if (!cart || cart.items.length === 0) {
                throw new Error("Your cart is empty");
            }

            let totalAmount = 0;
            const orderItems = [];

            // Validate products and calculate total
            for (const item of cart.items) {
                const product = item.product;

                if (!product || !product.isActive) {
                    throw new Error(
                        "One or more products are no longer available"
                    );
                }

                if (item.quantity > product.stock) {
                    throw new Error(
                        `Insufficient stock for ${product.name}`
                    );
                }

                const subtotal = product.price * item.quantity;

                totalAmount += subtotal;

                orderItems.push({
                    product: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    subtotal
                });
            }

            // Reduce stock inside transaction
            for (const item of cart.items) {
                const product = await Product.findById(
                    item.product._id
                ).session(session);

                if (!product || product.stock < item.quantity) {
                    throw new Error(
                        `Stock changed for ${item.product.name}. Please try again.`
                    );
                }

                product.stock -= item.quantity;

                await product.save({ session });
            }

            // Create order inside transaction
            const orders = await Order.create(
                [
                    {
                        user: req.user.userId,
                        items: orderItems,
                        totalAmount,
                        shippingAddress: shippingAddress.trim()
                    }
                ],
                { session }
            );

            createdOrder = orders[0];

            // Clear cart inside transaction
            cart.items = [];

            await cart.save({ session });
        });

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: createdOrder
        });

    } catch (error) {
        console.error("Create order error:", error.message);

        if (
            error.message === "Your cart is empty" ||
            error.message.includes("Insufficient stock") ||
            error.message.includes("no longer available") ||
            error.message.includes("Stock changed")
        ) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error while placing order"
        });

    } finally {
        await session.endSession();
    }
};


// Get my orders
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user.userId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Get orders error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while fetching orders"
        });
    }
};


// Get single order
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Get order error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while fetching order"
        });
    }
};


// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Order is already cancelled"
            });
        }

        if (
            order.status === "shipped" ||
            order.status === "delivered"
        ) {
            return res.status(400).json({
                success: false,
                message: "Order cannot be cancelled at this stage"
            });
        }

        // Restore stock
        for (const item of order.items) {
            const product = await Product.findById(item.product);

            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        order.status = "cancelled";

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order
        });

    } catch (error) {
        console.error("Cancel order error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while cancelling order"
        });
    }
};


module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder
};