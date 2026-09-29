const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const User = require("../src/models/User");

describe("Cart API", () => {

    test("POST /api/cart should add a product to cart", async () => {
        const email = `cartuser${Date.now()}@example.com`;
        const password = "Test@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Cart Test User",
            email,
            password: hashedPassword,
            role: "customer"
        });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

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

        expect(adminLogin.statusCode).toBe(200);

        const adminToken = adminLogin.body.token;

        const productResponse = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Cart Test Product",
                description: "Product for cart testing",
                price: 2000,
                category: "Test",
                stock: 10
            });

        expect(productResponse.statusCode).toBe(201);

        const productId = productResponse.body.product._id;

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
            .send({
                email,
                password
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

        const response = await request(app)
            .get("/api/cart")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty("cart");
        expect(response.body.cart).toHaveProperty("items");
        expect(Array.isArray(response.body.cart.items)).toBe(true);
    });


    test("PUT /api/cart should update cart quantity", async () => {
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
            .send({
                email,
                password
            });

        expect(loginResponse.statusCode).toBe(200);

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

        expect(adminLogin.statusCode).toBe(200);

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

        expect(productResponse.statusCode).toBe(201);

        const productId = productResponse.body.product._id;

        const addResponse = await request(app)
            .post("/api/cart")
            .set("Authorization", `Bearer ${token}`)
            .send({
                productId,
                quantity: 2
            });

        expect(addResponse.statusCode).toBe(200);

        const response = await request(app)
            .put("/api/cart")
            .set("Authorization", `Bearer ${token}`)
            .send({
                productId,
                quantity: 5
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Cart quantity updated");
    });
    test("DELETE /api/cart/:productId should remove product from cart", async () => {
    const email = `removecart${Date.now()}@example.com`;
    const password = "Test@12345";

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
        name: "Remove Cart User",
        email,
        password: hashedPassword,
        role: "customer"
    });

    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password
        });

    const token = loginResponse.body.token;

    const adminEmail = `removeadmin${Date.now()}@example.com`;
    const adminPassword = "Admin@12345";
    const adminHash = await bcrypt.hash(adminPassword, 12);

    await User.create({
        name: "Remove Cart Admin",
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
            name: "Remove Cart Product",
            description: "Product for remove cart testing",
            price: 1200,
            category: "Test",
            stock: 10
        });

    expect(productResponse.statusCode).toBe(201);

    const productId = productResponse.body.product._id;

    const addResponse = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({
            productId,
            quantity: 2
        });

    expect(addResponse.statusCode).toBe(200);

    const response = await request(app)
        .delete(`/api/cart/${productId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Product removed from cart");
});


    test("DELETE /api/cart should clear the user's cart", async () => {
        const email = `clearcart${Date.now()}@example.com`;
        const password = "Test@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Clear Cart User",
            email,
            password: hashedPassword,
            role: "customer"
        });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        const token = loginResponse.body.token;

        const adminEmail = `clearadmin${Date.now()}@example.com`;
        const adminPassword = "Admin@12345";
        const adminHash = await bcrypt.hash(adminPassword, 12);

        await User.create({
            name: "Clear Cart Admin",
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
                name: "Clear Cart Product",
                description: "Product for clear cart testing",
                price: 1800,
                category: "Test",
                stock: 10
            });

        expect(productResponse.statusCode).toBe(201);

        const productId = productResponse.body.product._id;

        const addResponse = await request(app)
            .post("/api/cart")
            .set("Authorization", `Bearer ${token}`)
            .send({
                productId,
                quantity: 2
            });

        expect(addResponse.statusCode).toBe(200);

        const response = await request(app)
            .delete("/api/cart")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Cart cleared successfully");
    });

});