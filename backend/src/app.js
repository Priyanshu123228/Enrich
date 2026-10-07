import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';
import { mongoSanitize } from './middlewares/sanitize.middleware.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Enable trust proxy for reverse proxy platforms (Render, Vercel, Heroku, AWS)
app.set('trust proxy', 1);

// Force HTTPS in production (Handles Render, Vercel, AWS reverse proxies)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
  }
  next();
});

// 1. Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
  })
);

// Disable X-Powered-By header
app.disable('x-powered-by');

// 2. Logging in Development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3. Robust CORS Configuration
const configuredClientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const defaultDevOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000'
];

const allowedOrigins = Array.from(new Set([...configuredClientUrls, ...defaultDevOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin = origin.replace(/\/$/, '');

      if (
        process.env.NODE_ENV !== 'production' &&
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)
      ) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(cleanOrigin) ||
        /\.vercel\.app$/.test(cleanOrigin) ||
        /\.onrender\.com$/.test(cleanOrigin)
      ) {
        return callback(null, true);
      }

      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 4. Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// 5. NoSQL Injection Sanitization
app.use(mongoSanitize);

// 6. Global API Rate Limiting (Applied to /api/*)
app.use('/api', apiLimiter);

// 7. Mount API Routes
app.use('/api/v1', routes);

// 8. Root Health Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Enrich Beauty Parlour & Cosmetic Clinic API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    healthCheck: '/api/v1/health'
  });
});

// 9. Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
