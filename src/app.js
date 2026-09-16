const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// Enable CORS
app.use(cors());

// Request logging
app.use(morgan("dev"));

// Parse JSON requests
app.use(express.json());

app.use("/api/users", userRoutes);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

app.use(limiter);

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "E-commerce API is running",
        timestamp: new Date()
    });
});

app.use("/api/auth", authRoutes);

module.exports = app;
