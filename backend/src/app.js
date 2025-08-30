const express = require('express');
require('express-async-errors');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const analyzeRoutes = require('./routes/analyze.routes');
const authRoutes = require('./routes/auth.routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const setupPassport = require('./config/passport');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middlewares/error');


const app = express();
app.use(helmet());
// Configure CORS to return an explicit origin (required when credentials=true).
// Accept a comma-separated list in CORS_ORIGIN, e.g. "http://localhost:5173,http://localhost:3000"
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
	origin: function (origin, callback) {
		// allow requests with no origin (like mobile apps or curl)
		if (!origin) return callback(null, true);
		if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
		return callback(new Error('CORS policy: origin not allowed'));
	},
	credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
// session for passport (used only for OAuth flows)
app.use(session({ secret: process.env.SESSION_SECRET || 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
setupPassport();

// apply a conservative rate limiter to auth endpoints
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });
app.use('/api/auth', authLimiter);

app.use(compression());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));


app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api', analyzeRoutes);


app.use(notFound);
app.use(errorHandler);


module.exports = app;