const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

dotenv.config({
    path: process.env.NODE_ENV === "test" ? ".env.test" : ".env"
});

const app = express();

// ===============================
// Security Middleware
// ===============================

app.use(helmet());
app.use(cors());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

if (process.env.NODE_ENV !== "test") {
    app.use(limiter);
}

// ===============================
// General Middleware
// ===============================

app.use(morgan("dev"));
app.use(express.json());

// ===============================
// Homepage
// ===============================

app.get("/", (req, res) => {
    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="description" content="E-commerce REST API built with Node.js, Express, and MongoDB.">
            <title>E-Commerce REST API</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    background: #0f172a;
                    color: #f8fafc;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }

                .container {
                    width: 100%;
                    max-width: 850px;
                    text-align: center;
                }

                .badge {
                    display: inline-block;
                    padding: 8px 14px;
                    border: 1px solid #334155;
                    border-radius: 30px;
                    color: #93c5fd;
                    background: #1e293b;
                    font-size: 13px;
                    margin-bottom: 24px;
                }

                h1 {
                    font-size: clamp(34px, 6vw, 58px);
                    margin-bottom: 18px;
                    letter-spacing: -1.5px;
                }

                h1 span {
                    color: #60a5fa;
                }

                .description {
                    color: #cbd5e1;
                    font-size: 17px;
                    line-height: 1.8;
                    max-width: 650px;
                    margin: 0 auto 32px;
                }

                .buttons {
                    display: flex;
                    justify-content: center;
                    gap: 14px;
                    flex-wrap: wrap;
                    margin-bottom: 38px;
                }

                .button {
                    text-decoration: none;
                    padding: 14px 22px;
                    border-radius: 9px;
                    font-weight: bold;
                    transition: 0.2s;
                }

                .primary {
                    background: #3b82f6;
                    color: white;
                }

                .secondary {
                    border: 1px solid #475569;
                    color: #f8fafc;
                }

                .button:hover {
                    transform: translateY(-2px);
                    opacity: 0.9;
                }

                .features {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
                    gap: 16px;
                    margin-top: 20px;
                    text-align: left;
                }

                .card {
                    padding: 22px;
                    border: 1px solid #334155;
                    border-radius: 14px;
                    background: #1e293b;
                }

                .card .icon {
                    font-size: 25px;
                    margin-bottom: 14px;
                }

                .card h3 {
                    font-size: 16px;
                    margin-bottom: 9px;
                }

                .card p {
                    color: #94a3b8;
                    font-size: 14px;
                    line-height: 1.6;
                }

                footer {
                    color: #94a3b8;
                    font-size: 13px;
                    margin-top: 35px;
                }

                footer a {
                    color: #93c5fd;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <main class="container">
                <div class="badge">● Backend API Project</div>

                <h1>E-Commerce <span>REST API</span></h1>

                <p class="description">
                    A secure backend API for online retail, featuring user
                    authentication, product management, shopping cart operations,
                    and order processing.
                </p>

                <div class="buttons">
                    <a class="button primary" href="/api/products">
                        Explore Products →
                    </a>

                    <a class="button secondary"
                       href="https://github.com/rdrakshh-lgtm/ecommerce-rest-api"
                       target="_blank"
                       rel="noopener noreferrer">
                        View GitHub ↗
                    </a>
                </div>

                <section class="features">
                    <article class="card">
                        <div class="icon">🔐</div>
                        <h3>Secure Authentication</h3>
                        <p>JWT-based authentication and role-based access control.</p>
                    </article>

                    <article class="card">
                        <div class="icon">📦</div>
                        <h3>Product Management</h3>
                        <p>Product catalog, search, filtering, and pagination.</p>
                    </article>

                    <article class="card">
                        <div class="icon">🛒</div>
                        <h3>Shopping Cart</h3>
                        <p>Cart operations with quantity and input validation.</p>
                    </article>

                    <article class="card">
                        <div class="icon">🚚</div>
                        <h3>Order Processing</h3>
                        <p>Order creation, order history, and cancellation.</p>
                    </article>
                </section>

                <footer>
                    Built with Node.js, Express.js and MongoDB<br><br>
                    <a href="/health">Check API Health</a>
                    &nbsp; · &nbsp;
                    <a href="https://github.com/rdrakshh-lgtm/ecommerce-rest-api"
                       target="_blank"
                       rel="noopener noreferrer">Source Code</a>
                </footer>
            </main>
        </body>
        </html>
    `);
});

// ===============================
// Health Check
// ===============================

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "E-commerce API is running",
        timestamp: new Date()
    });
});

// ===============================
// API Routes
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// ===============================
// 404 Handler
// ===============================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// ===============================
// Global Error Handler
// ===============================

app.use((err, req, res, next) => {
    console.error("Global error:", err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});

module.exports = app;