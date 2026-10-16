const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "E-Commerce REST API",
            version: "1.0.0",
            description:
                "REST API for an online retail platform with authentication, product management, shopping cart, and order processing."
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Local development server"
            },
            {
                url: "https://ecommerce-rest-api-0tk9.onrender.com",
                description: "Production server"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter your JWT token"
                }
            }
        }
    },
    apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;