const express = require("express");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration and login
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rahul Kumar
 *               email:
 *                 type: string
 *                 example: rahul@example.com
 *               password:
 *                 type: string
 *                 example: StrongPass123
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Invalid input or user already exists
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: rahul@example.com
 *                   password:
 *                     type: string
 *                     example: StrongPass123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginUser);

module.exports = router;