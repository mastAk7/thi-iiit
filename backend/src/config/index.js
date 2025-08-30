const env = {
    PORT: process.env.PORT || 4000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI || '',
    AI_MODE: process.env.AI_MODE || 'mock',
    AI_BASE_URL: process.env.AI_BASE_URL || 'http://localhost:5001',
    AI_TIMEOUT_MS: Number(process.env.AI_TIMEOUT_MS || 15000)
};
module.exports = { env };