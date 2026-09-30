const request = require("supertest");
const app = require("../src/app");

describe("Health Check API", () => {
    test("GET /health should return 200", async () => {
        const response = await request(app)
            .get("/health");

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("E-commerce API is running");
    });
});

describe("Security Middleware", () => {
    test("GET /health should include Helmet security headers", async () => {
        const response = await request(app)
            .get("/health");

        expect(response.headers).toHaveProperty("x-content-type-options");
        expect(response.headers["x-content-type-options"]).toBe("nosniff");

        expect(response.headers).toHaveProperty("x-frame-options");
        expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");

        expect(response.headers).toHaveProperty("content-security-policy");
    });
});