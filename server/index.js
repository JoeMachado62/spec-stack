const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { sequelize } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const specRoutes = require('./routes/specifications');
const exampleRoutes = require('./routes/examples');
const executionRoutes = require('./routes/execution');

const app = express();
const PORT = process.env.PORT || 3001;

// === Middleware ===
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        // Allow localhost and VPS IP
        const allowedPatterns = [/localhost/, /127\.0\.0\.1/, /187\.77\.207\.153/];
        if (allowedPatterns.some(p => p.test(origin))) return callback(null, true);
        // Also allow any origin in development
        if (process.env.NODE_ENV !== 'production') return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// AI endpoints get a more generous limit
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { error: 'Too many AI requests. Please wait a moment before generating more.' }
});
app.use((req, res, next) => {
    if (req.path.match(/^\/api\/specs\/.+\/stage\/.+/)) {
        return aiLimiter(req, res, next);
    }
    next();
});

// === Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/specs', specRoutes);
app.use('/api/examples', exampleRoutes);
app.use('/api/execution', executionRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Spec Stack API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Endpoint not found.' });
    }
    next();
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'development'
            ? err.message
            : 'An unexpected error occurred.'
    });
});

// === Database Sync & Start ===
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully.');

        // Sync models (use migrations in production)
        await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
        console.log('✅ Database models synced.');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Spec Stack API running on http://0.0.0.0:${PORT}`);
            console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
