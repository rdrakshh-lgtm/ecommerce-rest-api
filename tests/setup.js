process.env.NODE_ENV = "test";

require("dotenv").config({
    path: ".env.test"
});

const mongoose = require("mongoose");

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
}, 15000);

afterAll(async () => {
    await mongoose.connection.close();
}, 15000);