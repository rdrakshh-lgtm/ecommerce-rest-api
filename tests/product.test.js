const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const User = require("../src/models/User");

describe("Product API", () => {

    test("POST /api/products should create a product", async () => {

        const email = `admin${Date.now()}@example.com`;
        const password = "Admin@12345";

        // Create admin user directly for testing
        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Test Admin",
            email,
            password: hashedPassword,
            role: "admin"
        });

        // Login as admin
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

        // Create product
        const response = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Test Laptop",
                description: "Laptop created during automated testing",
                price: 50000,
                category: "Electronics",
                stock: 10
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.product).toHaveProperty("_id");
        expect(response.body.product.name).toBe("Test Laptop");
        expect(response.body.product.price).toBe(50000);
        expect(response.body.product.stock).toBe(10);
    });
    test("GET /api/products should return products", async () => {
        const response = await request(app)
            .get("/api/products");

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty("products");
        expect(Array.isArray(response.body.products)).toBe(true);
    });
    test("GET /api/products/:id should return a product", async () => {
        const email = `admin${Date.now()}@example.com`;
        const password = "Admin@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Test Admin",
            email,
            password: hashedPassword,
            role: "admin"
        });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        const token = loginResponse.body.token;

        const createResponse = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Test Phone",
                description: "Phone created for automated testing",
                price: 25000,
                category: "Electronics",
                stock: 20
            });

        const productId = createResponse.body.product._id;

        const response = await request(app)
            .get(`/api/products/${productId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.product._id).toBe(productId);
        expect(response.body.product.name).toBe("Test Phone");
    });
    test("GET /api/products/:id should reject invalid product ID", async () => {
        const response = await request(app)
            .get("/api/products/invalid-id");

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Invalid product ID");
    });
    test("PUT /api/products/:id should update a product", async () => {
        const email = `admin${Date.now()}@example.com`;
        const password = "Admin@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Test Admin",
            email,
            password: hashedPassword,
            role: "admin"
        });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        const token = loginResponse.body.token;

        const createResponse = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Original Product",
                description: "Original product description",
                price: 1000,
                category: "Test",
                stock: 10
            });

        const productId = createResponse.body.product._id;

        const response = await request(app)
            .put(`/api/products/${productId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Updated Product",
                price: 1500,
                stock: 20
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.product.name).toBe("Updated Product");
        expect(response.body.product.price).toBe(1500);
        expect(response.body.product.stock).toBe(20);
    });
    test("DELETE /api/products/:id should delete a product", async () => {
        const email = `admin${Date.now()}@example.com`;
        const password = "Admin@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Test Admin",
            email,
            password: hashedPassword,
            role: "admin"
        });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        const token = loginResponse.body.token;

        const createResponse = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Product To Delete",
                description: "Product created for delete testing",
                price: 2000,
                category: "Test",
                stock: 5
            });

        const productId = createResponse.body.product._id;

        const response = await request(app)
            .delete(`/api/products/${productId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });
        test("POST /api/products should reject negative price", async () => {
        const email = `pricevalidation${Date.now()}@example.com`;
        const password = "Admin@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Price Validation Admin",
            email,
            password: hashedPassword,
            role: "admin"
        });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        const token = loginResponse.body.token;

        const response = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Invalid Price Product",
                description: "Product with invalid price",
                price: -100,
                category: "Test",
                stock: 10
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message)
            .toBe("Price must be a valid non-negative number");
    });

    test("POST /api/products should reject invalid price", async () => {
        const email = `invalidprice${Date.now()}@example.com`;
        const password = "Admin@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Invalid Price Admin",
            email,
            password: hashedPassword,
            role: "admin"
        });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        const token = loginResponse.body.token;

        const response = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Invalid Price Product",
                description: "Product with invalid price",
                price: "not-a-number",
                category: "Test",
                stock: 10
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message)
            .toBe("Price must be a valid non-negative number");
    });

    test("POST /api/products should reject negative stock", async () => {
        const email = `stockvalidation${Date.now()}@example.com`;
        const password = "Admin@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Stock Validation Admin",
            email,
            password: hashedPassword,
            role: "admin"
        });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        const token = loginResponse.body.token;

        const response = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Invalid Stock Product",
                description: "Product with invalid stock",
                price: 1000,
                category: "Test",
                stock: -5
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message)
            .toBe("Stock must be a non-negative whole number");
    });

    test("POST /api/products should reject decimal stock", async () => {
        const email = `decimalstock${Date.now()}@example.com`;
        const password = "Admin@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Decimal Stock Admin",
            email,
            password: hashedPassword,
            role: "admin"
        });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        const token = loginResponse.body.token;

        const response = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Decimal Stock Product",
                description: "Product with decimal stock",
                price: 1000,
                category: "Test",
                stock: 5.5
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message)
            .toBe("Stock must be a non-negative whole number");
    });

    test("GET /api/products should reject invalid page", async () => {
        const response = await request(app)
            .get("/api/products?page=0");

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message)
            .toBe("Page must be a positive whole number");
    });

    test("GET /api/products should reject invalid limit", async () => {
        const response = await request(app)
            .get("/api/products?limit=101");

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message)
            .toBe("Limit must be between 1 and 100");
    });
});