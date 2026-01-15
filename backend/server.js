require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path'); // Import path for file handling

const userRoutes = require('./routes/users');
const foodRoutes = require('./routes/items');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');

const logToCloudWatch = require('./cloudwatch-logger.js');
const fetchCloudWatchLogs = require('./utils/fetch-cloudwatch-logs');
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodorderingapp';

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.options('*', cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Request logging middleware ---
app.use(async (req, res, next) => {
  const start = Date.now();
  res.on('finish', async () => {
    const durationMs = Date.now() - start;
    // Avoid excessive await here; CloudWatch client can be a bottleneck. Keep it simple for now.
    await logToCloudWatch('info', 'request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  });
  next();
});

// --- Health route (fix signature: req, res) ---
app.get('/health', async (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  await logToCloudWatch('debug', 'health-check', { dbState, timestamp: new Date().toISOString() });
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    database: dbState
  });
});

app.get('/test-cookies', async (req, res) => {
  res.cookie('testCookie', 'cookieValue', { httpOnly: true });
  await logToCloudWatch('info', 'test-cookies', { cookies: req.cookies || {} });
  res.json({ cookies: req.cookies });
});

app.use('/api/users', userRoutes);
app.use('/api/items', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/uploads', require('express').static(path.join(__dirname, 'uploads')));

app.get('/api/logs', async (req, res) => {
  try {
    const { logGroupName, startTime, endTime } = req.query;
    const logs = await fetchCloudWatchLogs(logGroupName, startTime, endTime);
    
    fs.writeFileSync('cloudwatch-logs.json', JSON.stringify(logs, null, 2));

    res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching logs:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/fetch-logs', async (req, res) => {
  try {
    const logGroupName = req.query.logGroupName || '/aws/lambda/Food-App-test';
    const startTime = req.query.startTime ? parseInt(req.query.startTime, 10) : Date.now() - 24 * 60 * 60 * 1000;
    const endTime = req.query.endTime ? parseInt(req.query.endTime, 10) : Date.now();
    const outputFilePath = path.join(__dirname, 'logs', 'cloudwatch-logs.json');
    const interval = req.query.interval ? parseInt(req.query.interval, 10) : null;

    await fetchCloudWatchLogs(logGroupName, startTime, endTime, outputFilePath, interval);

    res.json({
      success: true,
      message: interval
        ? `Real-time log fetching started with an interval of ${interval}ms.`
        : 'Logs fetched successfully.',
      filePath: outputFilePath
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.use('*', async (req, res) => {
  await logToCloudWatch('warn', 'route-not-found', { method: req.method, url: req.originalUrl });
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// --- Error handler (fix signature: err, req, res, next) ---
app.use(async (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const statusCode = err.statusCode || err.status || 500;

  await logToCloudWatch('error', 'unhandled-error', {
    statusCode,
    message: err.message,
    stack: isDevelopment ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method
  });

  const errorResponse = {
    success: false,
    message: err.message || 'Internal server error'
  };
  if (isDevelopment) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    await logToCloudWatch('info', 'db-connected', { uri: MONGODB_URI });
  } catch (error) {
    await logToCloudWatch('error', 'db-connection-failed', { message: error.message });
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', async () => {
  await logToCloudWatch('warn', 'db-disconnected');
});

mongoose.connection.on('error', async (error) => {
  await logToCloudWatch('error', 'db-error', { message: error.message });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await logToCloudWatch('info', 'sigterm-received');
  await mongoose.disconnect();
  await logToCloudWatch('info', 'db-disconnected-on-sigterm');
  process.exit(0);
});

process.on('SIGINT', async () => {
  await logToCloudWatch('info', 'sigint-received');
  await mongoose.disconnect();
  await logToCloudWatch('info', 'db-disconnected-on-sigint');
  process.exit(0);
});

app.listen(PORT, async () => {
  await logToCloudWatch('info', 'server-started', { port: PORT });
  console.log(`Server is running on port ${PORT}`);
  await connectDatabase();
});


