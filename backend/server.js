require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/db/connect');
const { env } = require('./src/config');


(async () => {
    try {
        if (env.MONGODB_URI) {
            await connectDB(env.MONGODB_URI);
        }
        app.listen(env.PORT, () => {
            console.log(`API listening on http://localhost:${env.PORT} (mode: ${env.AI_MODE})`);
        });
    } catch (err) {
        console.error('Startup error:', err);
        process.exit(1);
    }
})();