import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import os from 'node:os';

import bookRoutes from './routes/bookRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dbConnecter from './utils/db.js';
import { LOCAL_UPLOAD_DIR, LOCAL_UPLOAD_PATH, isCloudinaryConfigured } from './config/cloudinary.js';
import { notFound, errorHandler } from './middleware/error.js';

const PORT = Number.parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

const requiredEnv = ['DBURL', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`[startup] Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('[startup] Copy server/.env.example to server/.env and fill in the values.');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

/* ------------------------------- Middleware ------------------------------- */

const configuredOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAllOrigins = configuredOrigins.includes('*');

app.use(
  cors({
    origin: allowAllOrigins
      ? '*'
      : (origin, callback) => {
          // Requests from native apps do not send an Origin header.
          if (!origin || configuredOrigins.includes(origin)) return callback(null, true);
          const error = new Error('Origin is not allowed by CORS');
          error.status = 403;
          return callback(error);
        },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    maxAge: 86400,
  })
);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Lightweight request logging (no tokens or bodies).
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    console.log(
      `[api] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - startedAt}ms)`
    );
  });
  next();
});

// Uploaded files in local development.
app.use(LOCAL_UPLOAD_PATH, express.static(LOCAL_UPLOAD_DIR, { maxAge: '1d' }));

/* --------------------------------- Routes --------------------------------- */

const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: NODE_ENV,
    uptime: Math.round(process.uptime()),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    storage: isCloudinaryConfigured ? 'cloudinary' : 'local',
    timestamp: new Date().toISOString(),
  });
};

app.get('/', (req, res) => {
  res.json({
    name: 'Iweohun API',
    version: '1.0.0',
    health: '/health',
    api: '/api',
  });
});
app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

// Canonical API paths + legacy root paths kept for older app builds.
app.use('/api', bookRoutes);
app.use('/api', userRoutes);
app.use(bookRoutes);
app.use(userRoutes);

app.use(notFound);
app.use(errorHandler);

/* ------------------------------- Start server ------------------------------ */

const getLanUrls = (port) =>
  Object.values(os.networkInterfaces())
    .flat()
    .filter((entry) => entry && entry.family === 'IPv4' && !entry.internal)
    .map((entry) => `http://${entry.address}:${port}`);

const startServer = async () => {
  await dbConnecter();

  const server = app.listen(PORT, HOST, () => {
    console.log(`[api] Iweohun API listening on http://localhost:${PORT}`);
    if (HOST === '0.0.0.0') {
      getLanUrls(PORT).forEach((url) => console.log(`[api] Device-reachable: ${url}`));
    }
    console.log(`[api] Environment: ${NODE_ENV}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`[api] Port ${PORT} is already in use. Stop the other server or set PORT.`);
    } else {
      console.error('[api] Server error:', error.message);
    }
    process.exit(1);
  });

  const shutdown = async (signal) => {
    console.log(`[api] ${signal} received, shutting down...`);
    server.close(async () => {
      await mongoose.disconnect().catch(() => {});
      process.exit(0);
    });
    // Force exit if connections do not close in time.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, () => shutdown(signal)));
};

startServer().catch((error) => {
  console.error('[api] Failed to start:', error.message);
  process.exit(1);
});
