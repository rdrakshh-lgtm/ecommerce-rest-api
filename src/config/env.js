const requiredEnvVariables = [
    "MONGO_URI",
    "JWT_SECRET"
];

const validateEnv = () => {
    const missingVariables = requiredEnvVariables.filter(
        variable => !process.env[variable]
    );

    if (missingVariables.length > 0) {
        console.error(
            `Missing required environment variables: ${missingVariables.join(", ")}`
        );

        process.exit(1);
    }
};

module.exports = validateEnv;