const dotenv = require("dotenv");
const app = require("./src/app");
const connectDB = require("./src/config/database");
const validateEnv = require("./src/config/env");

dotenv.config();

validateEnv();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();