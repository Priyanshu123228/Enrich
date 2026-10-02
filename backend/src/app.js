import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';
import { mongoSanitize } from './middlewares/sanitize.middleware.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';

const app = express();

// 1. Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Allow modern frontend communication
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
      // Allow requests with no origin (e.g. mobile apps, Postman, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin = origin.replace(/\/$/, '');

      // In development, allow any localhost / 127.0.0.1 port
      if (
        process.env.NODE_ENV !== 'production' &&
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)
      ) {
        return callback(null, true);
      }

      // Allow configured production origins or *.vercel.app deployment URLs
      if (
        allowedOrigins.includes(cleanOrigin) ||
        /\.vercel\.app$/.test(cleanOrigin) ||
        /\.onrender\.com$/.test(cleanOrigin)
      ) {
        return callback(null, true);
      }

      // Reject unknown origins gracefully
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
  })
);


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 4. Body Parsing with adequate limits for base64 / uploads
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

// 8. Root Health & Documentation Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to LuxeParlour Salon & Spa API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    healthCheck: '/api/v1/health'
  });
});

// 9. 404 Route Not Found & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
