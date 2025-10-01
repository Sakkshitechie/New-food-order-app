const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const userRoutes = require('./routes/users');
const foodRoutes = require('./routes/items');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodorderingapp';

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.use('/api/users', userRoutes);
app.use('/api/items', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

app.use((err, req, res, next) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorResponse = {
        success: false,
        message: err.message || 'Internal server error'
    };

    if (isDevelopment) {
        errorResponse.stack = err.stack;
    }

    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json(errorResponse);
});

async function connectDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
    } catch (error) {
        process.exit(1);
    }
}

mongoose.connection.on('disconnected', () => {
    // Database disconnected
});

mongoose.connection.on('error', (error) => {
    // Database error occurred
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    await mongoose.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await mongoose.disconnect();
    process.exit(0);
});

async function startServer() {
    try {
        await connectDatabase();
        app.listen(PORT, () => {});
    } catch (error) {
        process.exit(1);
    }
}

startServer();
