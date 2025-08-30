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
// const MongoStore = require('connect-mongo');   // optional: use this in prod
const { notFound, errorHandler } = require('./middlewares/error');

const app = express();

/** ---- REQUIRED when behind Railway/any proxy (affects secure cookies) ---- */
app.set('trust proxy', 1);

app.use(helmet());

/** ---- CORS ----
 * Set CORS_ORIGIN to a comma-separated list, e.g.:
 *   https://thi-iiit.vercel.app,http://localhost:5173
 */
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl/postman
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS policy: origin not allowed'));
  },
  credentials: true,
}));

// Good preflight behavior
app.options('*', cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS policy: origin not allowed'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

/** ---- Session for Passport (cross-site cookie settings) ---- */
const prod = process.env.NODE_ENV === 'production';
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  // store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }), // <— enable in prod
  cookie: {
    httpOnly: true,
    secure: prod,                  // HTTPS on Railway
    sameSite: prod ? 'none' : 'lax', // required for cross-site cookies (Vercel -> Railway)
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));

app.use(passport.initialize());
app.use(passport.session());
setupPassport();

app.get('/', (_req, res) => {
  res.send('Server is running ✅');
});


/** ---- Rate limit auth endpoints ---- */
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });
app.use('/api/auth', authLimiter);

app.use(compression());
if (!prod) app.use(morgan('dev'));

/** ---- Health check (Railway) ---- */
app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

/** ---- Routes ---- */
app.use('/api/auth', authRoutes);
app.use('/api', analyzeRoutes);

/** ---- Errors ---- */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
