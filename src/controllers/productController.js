const Product = require("../models/Product");

// Create Product - Admin only
const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            stock,
            image
        } = req.body;
        if (stock !== undefined && (Number(stock) < 0 || !Number.isInteger(Number(stock)))) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a non-negative whole number"
            });
        }
        const product = await Product.create({
            name,
            description,
            price,
            category,
            stock,
            image
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });
    } catch (error) {
        console.error("Create product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while creating product"
        });
    }
};


// Get All Products
const getProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        const query = {
            isActive: true
        };

        // Search by product name
        if (search) {
            query.name = {
                $regex: search,
                $options: "i"
            };
        }

        // Category filter
        if (category) {
            query.category = {
                $regex: category,
                $options: "i"
            };
        }

        // Price filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            query.price = {};

            if (minPrice !== undefined) {
                query.price.$gte = Number(minPrice);
            }

            if (maxPrice !== undefined) {
                query.price.$lte = Number(maxPrice);
            }
        }

        // Sorting
        let sortOption = { createdAt: -1 };

        if (sort === "price_asc") {
            sortOption = { price: 1 };
        }

        if (sort === "price_desc") {
            sortOption = { price: -1 };
        }

        if (sort === "name_asc") {
            sortOption = { name: 1 };
        }

        if (sort === "name_desc") {
            sortOption = { name: -1 };
        }

        // Pagination
        const currentPage = Math.max(Number(page), 1);
        const itemsPerPage = Math.min(Math.max(Number(limit), 1), 100);
        const skip = (currentPage - 1) * itemsPerPage;

        const totalProducts = await Product.countDocuments(query);

        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(itemsPerPage);

        res.status(200).json({
            success: true,
            count: products.length,
            totalProducts,
            page: currentPage,
            limit: itemsPerPage,
            totalPages: Math.ceil(totalProducts / itemsPerPage),
            products
        });

    } catch (error) {
        console.error("Get products error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while fetching products"
        });
    }
};

// Get Single Product
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.error("Get product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while fetching product"
        });
    }
};


// Update Product - Admin only
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const {
            name,
            description,
            price,
            category,
            stock,
            image,
            isActive
        } = req.body;
        if (stock !== undefined && (Number(stock) < 0 || !Number.isInteger(Number(stock)))) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a non-negative whole number"
            });
        }
        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = price;
        if (category !== undefined) product.category = category;
        if (stock !== undefined) product.stock = stock;
        if (image !== undefined) product.image = image;
        if (isActive !== undefined) product.isActive = isActive;

        await product.save();

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        console.error("Update product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while updating product"
        });
    }
};


// Delete Product - Admin only
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Soft delete
        product.isActive = false;

        await product.save();

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Delete product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while deleting product"
        });
    }
};


module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};