const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const User = require("../src/models/User");

describe("Cart API", () => {

    test("POST /api/cart should add a product to cart", async () => {
        const email = `cartuser${Date.now()}@example.com`;
        const password = "Test@12345";

        // Create customer
        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Cart Test User",
            email,
            password: hashedPassword,
            role: "customer"
        });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        const token = loginResponse.body.token;

        // Create product using admin
        const adminEmail = `cartadmin${Date.now()}@example.com`;
        const adminPassword = "Admin@12345";
        const adminHash = await bcrypt.hash(adminPassword, 12);

        await User.create({
            name: "Cart Test Admin",
            email: adminEmail,
            password: adminHash,
            role: "admin"
        });

        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: adminEmail,
                password: adminPassword
            });

        const adminToken = adminLogin.body.token;

        const productResponse = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Cart Test Product",
                description: "Product for cart testing",
                price: 1000,
                category: "Test",
                stock: 10
            });

        const productId = productResponse.body.product._id;

        // Add product to cart
        const response = await request(app)
            .post("/api/cart")
            .set("Authorization", `Bearer ${token}`)
            .send({
                productId,
                quantity: 2
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.cart).toBeDefined();
        expect(response.body.cart.items.length).toBeGreaterThan(0);
    }, 15000);
    test("GET /api/cart should return the user's cart", async () => {
        const email = `getcart${Date.now()}@example.com`;
        const password = "Test@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Get Cart User",
            email,
            password: hashedPassword,
            role: "customer"
        });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({ email, password });

        const token = loginResponse.body.token;

        const response = await request(app)
            .get("/api/cart")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty("cart");
    });
    test("PUT /api/cart/:productId should update cart quantity", async () => {
        const email = `updatecart${Date.now()}@example.com`;
        const password = "Test@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Update Cart User",
            email,
            password: hashedPassword,
            role: "customer"
        });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({ email, password });

        const token = loginResponse.body.token;

        const adminEmail = `updateadmin${Date.now()}@example.com`;
        const adminPassword = "Admin@12345";
        const adminHash = await bcrypt.hash(adminPassword, 12);

        await User.create({
            name: "Update Cart Admin",
            email: adminEmail,
            password: adminHash,
            role: "admin"
        });

        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: adminEmail,
                password: adminPassword
            });

        const adminToken = adminLogin.body.token;

        const productResponse = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Update Cart Product",
                description: "Product for quantity update testing",
                price: 1500,
                category: "Test",
                stock: 20
            });

        const productId = productResponse.body.product._id;

        // Add product
        await request(app)
            .post("/api/cart")
            .set("Authorization", `Bearer ${token}`)
            .send({
                productId,
                quantity: 2
            });

        // Update quantity
        const response = await request(app)
            .put("/api/cart")
            .set("Authorization", `Bearer ${token}`)
            .send({
                quantity: 5
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });
});