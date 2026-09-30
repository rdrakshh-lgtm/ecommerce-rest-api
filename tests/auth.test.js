const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/app");

describe("Authentication API", () => {

    test("POST /api/auth/register should create a new user", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Jest Test User",
                email: `jestuser${Date.now()}@example.com`,
                password: "Test@12345"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User registered successfully");

        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user).toHaveProperty("name");
        expect(response.body.user).toHaveProperty("email");
        expect(response.body.user).toHaveProperty("role");
    });

    test("POST /api/auth/login should login an existing user", async () => {
        const email = `loginuser${Date.now()}@example.com`;
        const password = "Test@12345";

        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Login Test User",
                email,
                password
            });

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty("token");

        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user.email).toBe(email);
    });

    test("GET /api/users/me should return authenticated user", async () => {
        const email = `protecteduser${Date.now()}@example.com`;
        const password = "Test@12345";

        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Protected Test User",
                email,
                password
            });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        const token = loginResponse.body.token;

        const response = await request(app)
            .get("/api/users/me")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.user.email).toBe(email);
    });

    test("GET /api/users/me should reject unauthenticated request", async () => {
        const response = await request(app)
            .get("/api/users/me");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Authentication required");
    });

    test("GET /api/users/admin-test should reject customer user", async () => {
        const email = `customer${Date.now()}@example.com`;
        const password = "Test@12345";

        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Customer Test User",
                email,
                password
            });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        const token = loginResponse.body.token;

        const response = await request(app)
            .get("/api/users/admin-test")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message)
            .toBe("Access denied. Insufficient permissions.");
    });

    test("GET /api/users/me should reject invalid JWT", async () => {
        const response = await request(app)
            .get("/api/users/me")
            .set("Authorization", "Bearer invalid.jwt.token");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message)
            .toBe("Invalid authentication token");
    });

    test("GET /api/users/me should reject expired JWT", async () => {
        const expiredToken = jwt.sign(
            {
                userId: "507f1f77bcf86cd799439011",
                role: "customer"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "-1s"
            }
        );

        const response = await request(app)
            .get("/api/users/me")
            .set("Authorization", `Bearer ${expiredToken}`);

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message)
            .toBe("Authentication token has expired");
    });

});