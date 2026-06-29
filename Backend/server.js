require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { randomUUID } = require('crypto');

const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

if (!AI_SERVICE_URL && NODE_ENV !== 'test') {
  console.error('FATAL: AI_SERVICE_URL environment variable is not set');
  process.exit(1);
}

const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Managed by the frontend separately
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin) || NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
  })
);

// ── Request ID Middleware ─────────────────────────────────────────────────────
app.use((req, _res, next) => {
  req.id = randomUUID().slice(0, 8);
  next();
});

// ── Request Logger ────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const color = res.statusCode >= 500 ? '\x1b[31m' : res.statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(
      `${color}[${req.id}] ${req.method} ${req.path} → ${res.statusCode} (${ms}ms)\x1b[0m`
    );
  });
  next();
});

app.use(express.json({ limit: '10mb' }));

// ── Rate Limiters ─────────────────────────────────────────────────────────────
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down and try again in a minute.' },
});

const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many uploads. Please wait a few minutes before uploading again.' },
});

// ── Multer ────────────────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'docquery-backend',
    environment: NODE_ENV,
  });
});

// ── Upload ────────────────────────────────────────────────────────────────────
app.post('/api/upload', uploadLimiter, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    console.log(`[${req.id}] UPLOAD → "${req.file.originalname}" (${(req.file.size / 1024).toFixed(1)} KB)`);

    const response = await axios.post(`${AI_SERVICE_URL}/upload`, formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120000,
    });

    res.json(response.data);
  } catch (error) {
    handleProxyError(error, res, 'upload', req.id);
  }
});

// ── Chat ──────────────────────────────────────────────────────────────────────
app.post('/api/chat', chatLimiter, async (req, res) => {
  try {
    const { question, session_id } = req.body;

    if (!question || !session_id) {
      return res.status(400).json({
        error: 'Missing required fields: question and session_id',
      });
    }
    if (typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question must be a non-empty string' });
    }
    if (question.length > 2000) {
      return res.status(400).json({ error: 'Question must not exceed 2000 characters' });
    }
    if (typeof session_id !== 'string' || session_id.trim().length === 0) {
      return res.status(400).json({ error: 'session_id must be a non-empty string' });
    }

    console.log(`[${req.id}] CHAT → session:${session_id.slice(0, 8)} | "${question.slice(0, 60)}${question.length > 60 ? '…' : ''}"`);

    const response = await axios.post(
      `${AI_SERVICE_URL}/chat`,
      { question, session_id },
      { timeout: 60000 }
    );

    res.json(response.data);
  } catch (error) {
    handleProxyError(error, res, 'chat', req.id);
  }
});

// ── Error Proxy Handler ───────────────────────────────────────────────────────
function handleProxyError(error, res, context, reqId = '?') {
  const ctx = context.toUpperCase();

  if (error.response) {
    const { status, data } = error.response;
    console.error(`[${reqId}] ${ctx} | AI service returned ${status}:`, JSON.stringify(data).slice(0, 200));
    return res.status(status).json({
      error: typeof data === 'string' ? data : data.error || data.message || 'AI service error',
      details: NODE_ENV === 'development' ? data : undefined,
    });
  }

  if (error.code === 'ECONNABORTED') {
    console.error(`[${reqId}] ${ctx} | Request timeout`);
    return res.status(504).json({ error: 'AI service timed out. Please try again.' });
  }

  if (error.code === 'ECONNREFUSED') {
    console.error(`[${reqId}] ${ctx} | Connection refused — is the AI service running?`);
    return res.status(503).json({ error: 'AI service is not reachable. Please check the service is running.' });
  }

  if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
    console.error(`[${reqId}] ${ctx} | DNS/network error: ${error.message}`);
    return res.status(503).json({ error: 'Cannot reach the AI service (network error).' });
  }

  console.error(`[${reqId}] ${ctx} | Unexpected: ${error.message}`);
  res.status(503).json({ error: 'AI service is currently unavailable. Please try again later.' });
}

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[FATAL]', err.stack || err.message);
  res.status(500).json({
    error: NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

module.exports = app;
