const request = require("supertest");
const express = require("express");
const rateLimit = require("express-rate-limit");

describe("Rate Limiting", () => {
    test("should block requests after the configured limit", async () => {
        const testApp = express();

        const limiter = rateLimit({
            windowMs: 60 * 1000,
            max: 2,
            message: {
                success: false,
                message: "Too many requests. Please try again later."
            }
        });

        testApp.use(limiter);

        testApp.get("/test", (req, res) => {
            res.status(200).json({
                success: true,
                message: "Request allowed"
            });
        });

        const firstRequest = await request(testApp)
            .get("/test");

        const secondRequest = await request(testApp)
            .get("/test");

        const thirdRequest = await request(testApp)
            .get("/test");

        expect(firstRequest.statusCode).toBe(200);
        expect(secondRequest.statusCode).toBe(200);

        expect(thirdRequest.statusCode).toBe(429);
        expect(thirdRequest.body.success).toBe(false);
        expect(thirdRequest.body.message)
            .toBe("Too many requests. Please try again later.");
    });
});