const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { globalLimiter } = require('./middleware/rateLimiter');
// const { csrfTokenEndpoint, csrfProtection } = require('./middleware/csrf');
const { errorHandler, notFoundHandler, requestLogger } = require('./middleware/errorHandler');
const logger = require('./config/logger');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');
const transactionRoutes = require('./routes/transaction');
const userRoutes = require('./routes/user');
const aiRoutes = require('./routes/ai');

const app = express();
app.set('trust proxy', 1);

// ─── Security Headers (Helmet) ──────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ─── CORS ───────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
}));

// ─── Body Parsing & Cookies ─────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// ─── Request Logging ────────────────────────────────────────────────
app.use(requestLogger);

// ─── Global Rate Limiter ────────────────────────────────────────────
app.use(globalLimiter);

// ─── Health Check ───────────────────────────────────────────────────
// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ─── Routes ─────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/account', accountRoutes);
app.use('/transactions', transactionRoutes);
app.use('/user', userRoutes);
app.use('/ai', aiRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Production Error Handler ───────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
module.exports = app;