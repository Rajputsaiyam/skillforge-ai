require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const { passport } = require('./config/passport');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const gemini = require('./services/geminiService');

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const skillRoutes = require('./routes/skillRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const progressRoutes = require('./routes/progressRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');

connectDB();

const app = express();

// Production Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows SPA client assets, Google fonts, and inline styles
    crossOriginEmbedderPolicy: false,
  })
);

// High-performance gzip/deflate response compression
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(passport.initialize());

// Production Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 authentication attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' },
});

const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 80, // Limit AI inference calls per IP to 80 per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'AI request limit reached. Please wait a moment before asking again.' },
});

// Apply global rate limiter
app.use('/api', globalLimiter);

// Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 SkillForge AI Backend API is live and running!',
    status: 'healthy',
    documentation: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

// Comprehensive Production Diagnostics & Readiness Probe
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }[dbState] || 'unknown';
  const memUsage = process.memoryUsage();

  res.json({
    status: dbState === 1 ? 'ok' : 'degraded',
    service: 'SkillForge AI API (Production Ready)',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      connected: dbState === 1,
    },
    memory: {
      heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      rssMB: Math.round(memUsage.rss / 1024 / 1024),
    },
    ai: {
      geminiConfigured: gemini.isConfigured(),
      geminiModel: gemini.model,
      ragEngine: 'Active (Hybrid Semantic + BM25 Lexical with Transparent Citations)',
    },
  });
});

// Mount Routes with specialized rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', aiLimiter, chatRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SkillForge AI production backend running on port ${PORT}`));
