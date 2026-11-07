'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { sendError } = require('./utils/response');
const { generalLimiter } = require('./middlewares/rateLimit.middleware');
const { errorHandler } = require('./middlewares/error.middleware');
const setupSwagger = require('./config/swagger');

const app = express();

// ── Security & utility middleware ─────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// ── General API rate limiter ──────────────────────────────────────────────────
app.use('/api', generalLimiter);

// ── Swagger Documentation ─────────────────────────────────────────────────────
setupSwagger(app);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'E-Learning API is healthy',
    data: { uptime: process.uptime() },
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/courses', require('./routes/course.routes'));

// TODO: Mount additional routes here as they are built
// app.use('/api/users',        require('./routes/user.routes'));
// app.use('/api/courses',      require('./routes/course.routes'));
// app.use('/api/enroll',       require('./routes/enrollment.routes'));
// app.use('/api/assignments',  require('./routes/assignment.routes'));
// app.use('/api/exams',        require('./routes/exam.routes'));
// app.use('/api/grades',       require('./routes/grade.routes'));
// app.use('/api/history',      require('./routes/history.routes'));
// app.use('/api/certificates', require('./routes/certificate.routes'));
// app.use('/api/students',     require('./routes/instructor.routes'));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  return sendError(res, 404, `Route ${req.originalUrl} not found.`);
});

// ── Global error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

module.exports = app;
