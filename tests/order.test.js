const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../src/app");
const User = require("../src/models/User");

describe("Order API", () => {

    test("POST /api/orders should create an order from cart", async () => {
        const email = `orderuser${Date.now()}@example.com`;
        const password = "Test@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Order Test User",
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

        const adminEmail = `orderadmin${Date.now()}@example.com`;
        const adminPassword = "Admin@12345";
        const adminHash = await bcrypt.hash(adminPassword, 12);

        await User.create({
            name: "Order Test Admin",
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
                name: "Order Test Product",
                description: "Product for order testing",
                price: 2500,
                category: "Test",
                stock: 10
            });

        expect(productResponse.statusCode).toBe(201);

        const productId = productResponse.body.product._id;

        const addToCartResponse = await request(app)
            .post("/api/cart")
            .set("Authorization", `Bearer ${token}`)
            .send({
                productId,
                quantity: 2
            });

        expect(addToCartResponse.statusCode).toBe(200);

        const orderResponse = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${token}`)
            .send({
                shippingAddress: "Hubballi, Karnataka, India"
            });

        expect(orderResponse.statusCode).toBe(201);
        expect(orderResponse.body.success).toBe(true);
        expect(orderResponse.body.message).toBe("Order placed successfully");

        expect(orderResponse.body.order).toHaveProperty("_id");
        expect(orderResponse.body.order).toHaveProperty("items");
        expect(orderResponse.body.order).toHaveProperty("totalAmount");
        expect(orderResponse.body.order).toHaveProperty("shippingAddress");

        expect(orderResponse.body.order.items.length).toBe(1);
        expect(orderResponse.body.order.items[0].quantity).toBe(2);
        expect(orderResponse.body.order.totalAmount).toBe(5000);
        expect(orderResponse.body.order.status).toBe("pending");
    }, 20000);


    test("POST /api/orders should reject order when cart is empty", async () => {
        const email = `emptyorder${Date.now()}@example.com`;
        const password = "Test@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Empty Order User",
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
            .post("/api/orders")
            .set("Authorization", `Bearer ${token}`)
            .send({
                shippingAddress: "Hubballi, Karnataka, India"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Your cart is empty");
    }, 15000);


    test("POST /api/orders should reject invalid shipping address", async () => {
        const email = `addressorder${Date.now()}@example.com`;
        const password = "Test@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Address Test User",
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
            .post("/api/orders")
            .set("Authorization", `Bearer ${token}`)
            .send({
                shippingAddress: "Short"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message)
            .toBe("Shipping address must be at least 10 characters long");
    }, 15000);


    test("GET /api/orders should return user's orders", async () => {
        const email = `myorders${Date.now()}@example.com`;
        const password = "Test@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "My Orders User",
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
            .get("/api/orders")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty("count");
        expect(response.body).toHaveProperty("orders");
        expect(Array.isArray(response.body.orders)).toBe(true);
    });


    test("GET /api/orders/:id should reject invalid order ID", async () => {
        const email = `invalidorder${Date.now()}@example.com`;
        const password = "Test@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Invalid Order User",
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
            .get("/api/orders/invalid-id")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(500);
        expect(response.body.success).toBe(false);
    });


    test("DELETE /api/orders/:id should cancel an order", async () => {
        const email = `cancelorder${Date.now()}@example.com`;
        const password = "Test@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Cancel Order User",
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

        const adminEmail = `canceladmin${Date.now()}@example.com`;
        const adminPassword = "Admin@12345";
        const adminHash = await bcrypt.hash(adminPassword, 12);

        await User.create({
            name: "Cancel Order Admin",
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
                name: "Cancel Order Product",
                description: "Product for cancellation testing",
                price: 3000,
                category: "Test",
                stock: 10
            });

        expect(productResponse.statusCode).toBe(201);

        const productId = productResponse.body.product._id;

        const addToCartResponse = await request(app)
            .post("/api/cart")
            .set("Authorization", `Bearer ${token}`)
            .send({
                productId,
                quantity: 2
            });

        expect(addToCartResponse.statusCode).toBe(200);

        const orderResponse = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${token}`)
            .send({
                shippingAddress: "Hubballi, Karnataka, India"
            });

        expect(orderResponse.statusCode).toBe(201);

        const orderId = orderResponse.body.order._id;

        const cancelResponse = await request(app)
            .delete(`/api/orders/${orderId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(cancelResponse.statusCode).toBe(200);
        expect(cancelResponse.body.success).toBe(true);
        expect(cancelResponse.body.message)
            .toBe("Order cancelled successfully");

        expect(cancelResponse.body.order.status).toBe("cancelled");
    }, 20000);

});