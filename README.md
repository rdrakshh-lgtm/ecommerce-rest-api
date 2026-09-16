# E-Commerce REST API

A robust E-Commerce REST API built using Node.js, Express.js, MongoDB, JWT authentication, and role-based access control. The project is being developed as an internship project with a focus on secure API design, authentication, user management, product management, cart, orders, and inventory management.

## Project Overview

The E-Commerce REST API provides backend services for an online shopping platform. It is designed using a modular architecture so that authentication, users, products, cart, orders, and inventory can be developed and maintained independently.

## Current Features

- User registration
- Secure password hashing using bcrypt
- User login
- JWT-based authentication
- Protected API routes
- Customer and admin roles
- User profile management
- Profile information update
- Password change functionality
- MongoDB database integration
- Environment variable configuration
- Helmet security middleware
- CORS configuration
- API rate limiting
- HTTP request logging using Morgan

## Planned Features

- Admin product management
- Product CRUD operations
- Product search
- Product filtering
- Product sorting
- Pagination
- Inventory management
- Shopping cart
- Order creation
- Order management
- Order cancellation
- Inventory consistency during orders
- Swagger/OpenAPI documentation
- Jest and Supertest API testing
- API performance improvements
- Deployment

## Technology Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication & Security

- JWT (JSON Web Token)
- bcryptjs
- Helmet
- CORS
- Express Rate Limit

### Development & Testing

- Postman
- Jest
- Supertest
- Nodemon
- Morgan

## Project Structure

```text
ecommerce-rest-api/
│
├── src/
│   ├── config/
│   │   └── database.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── services/
│   ├── utils/
│   └── validators/
│
├── tests/
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js