const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../src/app");
const User = require("../src/models/User");
const Order = require("../src/models/Order");

describe("Admin Order API", () => {

    test("GET /api/admin/orders should allow admin to view all orders", async () => {
        const email = `adminorders${Date.now()}@example.com`;
        const password = "Admin@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Admin Orders User",
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

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

        const response = await request(app)
            .get("/api/admin/orders")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty("count");
        expect(response.body).toHaveProperty("orders");
        expect(Array.isArray(response.body.orders)).toBe(true);
    });


    test("GET /api/admin/orders should reject customer user", async () => {
        const email = `customerorders${Date.now()}@example.com`;
        const password = "Test@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Customer Orders User",
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
            .get("/api/admin/orders")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message)
            .toBe("Access denied. Insufficient permissions.");
    });


    test("PUT /api/admin/orders/:id/status should update order status", async () => {
        const email = `statusadmin${Date.now()}@example.com`;
        const password = "Admin@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        const admin = await User.create({
            name: "Status Admin",
            email,
            password: hashedPassword,
            role: "admin"
        });

        const order = await Order.create({
            user: admin._id,
            items: [
                {
                    product: "6abb55e9602f0d59716ba651",
                    name: "Test Product",
                    price: 1000,
                    quantity: 1,
                    subtotal: 1000
                }
            ],
            totalAmount: 1000,
            shippingAddress: "Hubballi, Karnataka, India",
            status: "pending"
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
            .put(`/api/admin/orders/${order._id}/status`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                status: "confirmed"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message)
            .toBe("Order status updated successfully");
        expect(response.body.order.status).toBe("confirmed");
    });


    test("PUT /api/admin/orders/:id/status should reject invalid status", async () => {
        const email = `invalidstatus${Date.now()}@example.com`;
        const password = "Admin@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Invalid Status Admin",
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

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

        const response = await request(app)
            .put("/api/admin/orders/000000000000000000000000/status")
            .set("Authorization", `Bearer ${token}`)
            .send({
                status: "invalid-status"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Invalid order status");
    });


    test("PUT /api/admin/orders/:id/status should reject customer user", async () => {
        const email = `customerstatus${Date.now()}@example.com`;
        const password = "Test@12345";

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Customer Status User",
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
            .put("/api/admin/orders/000000000000000000000000/status")
            .set("Authorization", `Bearer ${token}`)
            .send({
                status: "confirmed"
            });

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message)
            .toBe("Access denied. Insufficient permissions.");
    });

});