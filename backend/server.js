"use strict";
const EventEmitter = require('events');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');

const userRoutes = require('./routes/users');
const foodRoutes = require('./routes/items');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');

dotenv.config();

const STATE_CLOSED = 'closed';
const STATE_CONNECTING = 'connecting';
const STATE_CONNECTED = 'connected';
const STATE_CLOSING = 'closing';

const SERVER_CONNECT = 'connect';
const SERVER_CLOSE = 'close';
const SERVER_ERROR = 'error';
const DATABASE_CONNECTED = 'databaseConnected';
const DATABASE_DISCONNECTED = 'databaseDisconnected';
const DATABASE_ERROR = 'databaseError';
const REQUEST_RECEIVED = 'requestReceived';
const RESPONSE_SENT = 'responseSent';
const HEALTH_CHECK = 'healthCheck';

class ServerError extends Error {
    constructor(message, code = 'SERVER_ERROR') {
        super(message);
        this.name = 'ServerError';
        this.code = code;
    }
}

class DatabaseError extends ServerError {
    constructor(message, code = 'DATABASE_ERROR') {
        super(message, code);
        this.name = 'DatabaseError';
    }
}

class ConnectionError extends ServerError {
    constructor(message, code = 'CONNECTION_ERROR') {
        super(message, code);
        this.name = 'ConnectionError';
    }
}

const stateTransition = (() => {
    const transitions = {
        [STATE_CLOSED]: [STATE_CLOSED, STATE_CONNECTING],
        [STATE_CONNECTING]: [STATE_CONNECTING, STATE_CLOSING, STATE_CONNECTED, STATE_CLOSED],
        [STATE_CONNECTED]: [STATE_CONNECTED, STATE_CLOSING, STATE_CLOSED],
        [STATE_CLOSING]: [STATE_CLOSING, STATE_CLOSED]
    };

    return (server, newState) => {
        const currentState = server.getState();
        const validTransitions = transitions[currentState];
        
        if (!validTransitions || !validTransitions.includes(newState)) {
            throw new ServerError(`Invalid state transition from ${currentState} to ${newState}`);
        }
        
        server.setState(newState);
        server.emit('stateChange', { from: currentState, to: newState });
        return newState;
    };
})();

class FoodOrderingServer extends EventEmitter {
    constructor(options = {}) {
        super();
        this.options = {
            port: options.port || process.env.PORT || 3000,
            mongoUri: options.mongoUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/foodorderingapp',
            corsOrigin: options.corsOrigin || 'http://localhost:4200',
            maxConnections: options.maxConnections || 100,
            requestTimeout: options.requestTimeout || 30000,
            healthCheckInterval: options.healthCheckInterval || 30000,
            ...options
        };
        this.state = {
            current: STATE_CLOSED,
            operationCount: 0,
            connectionCount: 0,
            startTime: null,
            lastHealthCheck: null,
            errors: [],
            metrics: {
                requests: 0,
                responses: 0,
                errors: 0,
                dbQueries: 0
            }
        };
        this.app = null;
        this.httpServer = null;
        this.dbConnection = null;
        this.healthCheckTimer = null;
        this.initialize();
      }
    initialize() {
        this.app = express();
        this.httpServer = http.createServer(this.app);
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        this.setupEventListeners();
    }

    setupMiddleware() {
        this.app.use((req, res, next) => {
            const startTime = Date.now();
            this.incrementOperationCount();
            this.state.metrics.requests++;
            
            this.emit(REQUEST_RECEIVED, {
                method: req.method,
                url: req.url,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date()
            });

            const originalSend = res.send;
            res.send = (data) => {
                const duration = Date.now() - startTime;
                this.decrementOperationCount();
                this.state.metrics.responses++;
                
                this.emit(RESPONSE_SENT, {
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                    duration,
                    timestamp: new Date()
                });

                return originalSend.call(res, data);
            };

            next();
        });

        this.app.use(cors({
            origin: this.options.corsOrigin,
            credentials: false,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            maxAge: 86400 
        }));

        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        this.app.use((req, res, next) => {
            req.setTimeout(this.options.requestTimeout, () => {
                const error = new ServerError('Request timeout', 'REQUEST_TIMEOUT');
                this.handleError(error);
                if (!res.headersSent) {
                    res.status(408).json({
                        success: false,
                        message: 'Request timeout',
                        code: 'REQUEST_TIMEOUT'
                    });
                }
            });
            next();
        });
    }

    setupRoutes() {
        this.app.get('/health', (req, res) => {
            const healthData = this.getHealthStatus();
            this.emit(HEALTH_CHECK, healthData);
            
            const statusCode = healthData.status === 'healthy' ? 200 : 503;
            res.status(statusCode).json(healthData);
        });

        this.app.get('/metrics', (req, res) => {
            res.json(this.getMetrics());
        });

        this.app.use('/api/users', userRoutes);
        this.app.use('/api/items', foodRoutes);
        this.app.use('/api/orders', orderRoutes);
        this.app.use('/api/cart', cartRoutes);

        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: `Route ${req.method} ${req.originalUrl} not found`,
                code: 'ROUTE_NOT_FOUND'
            });
        });
    }

    setupErrorHandling() {
        this.app.use((err, req, res, next) => {
            this.state.metrics.errors++;
            this.handleError(err);

            const isDevelopment = process.env.NODE_ENV === 'development';
            const errorResponse = {
                success: false,
                message: err.message || 'Internal server error',
                code: err.code || 'INTERNAL_ERROR'
            };

            if (isDevelopment) {
                errorResponse.stack = err.stack;
                errorResponse.details = err;
            }

            const statusCode = err.statusCode || err.status || 500;
            res.status(statusCode).json(errorResponse);
        });
    }

    setupEventListeners() {
        if (mongoose.connection) {
            mongoose.connection.on('connected', () => {
                this.emit(DATABASE_CONNECTED);
            });

            mongoose.connection.on('disconnected', () => {
                this.emit(DATABASE_DISCONNECTED);
            });

            mongoose.connection.on('error', (error) => {
                const dbError = new DatabaseError(error.message);
                this.emit(DATABASE_ERROR, dbError);
                this.handleError(dbError);
            });
        }

        this.on('stateChange', ({ from, to }) => {
            console.log(`Server state changed: ${from} -> ${to}`);
        });

        this.on(DATABASE_CONNECTED, () => {
            console.log('Database connected successfully');
        });

        this.on(DATABASE_DISCONNECTED, () => {
            console.log('Database disconnected');
        });

        this.on(DATABASE_ERROR, (error) => {
            console.error('Database error:', error.message);
        });

        process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            this.handleError(error);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            this.handleError(new ServerError(`Unhandled Promise Rejection: ${reason}`));
        });
    }

    async connectDatabase() {
        try {
            const options = {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                bufferCommands: false,
                maxIdleTimeMS: 30000,
                family: 4
            };

            await mongoose.connect(this.options.mongoUri, options);
            this.dbConnection = mongoose.connection;
            
            if (process.env.NODE_ENV === 'development') {
                mongoose.set('debug', (coll, method, query, doc) => {
                    this.state.metrics.dbQueries++;
                    console.log(`MongoDB ${method} on ${coll}:`, query);
                });
            }

        } catch (error) {
            const dbError = new DatabaseError(`Failed to connect to database: ${error.message}`);
            this.emit(DATABASE_ERROR, dbError);
            throw dbError;
        }
    }

    async connect() {
        if (this.state.current !== STATE_CLOSED) {
            console.log(`Server already in state: ${this.state.current}`);
            return;
        }

        try {
            stateTransition(this, STATE_CONNECTING);
            await this.connectDatabase();
            await new Promise((resolve, reject) => {
                this.httpServer.listen(this.options.port, (error) => {
                    if (error) {
                        reject(new ConnectionError(`Failed to start HTTP server: ${error.message}`));
                    } else {
                        resolve();
                    }
                });
            });

            stateTransition(this, STATE_CONNECTED);
            this.state.startTime = new Date();
            this.startHealthMonitoring();
            
            console.log(`Food Ordering Server is running on port ${this.options.port}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Database: ${this.options.mongoUri}`);
            console.log(`CORS enabled for: ${this.options.corsOrigin}`);
            
            this.emit(SERVER_CONNECT, this);

        } catch (error) {
            stateTransition(this, STATE_CLOSED);
            this.handleError(error);
            throw error;
        }
    }

    async destroy(options = {}, callback = null) {
        if (typeof options === 'function') {
            callback = options;
            options = { force: false };
        }

        if (this.state.current === STATE_CLOSED) {
            if (callback) callback();
            return;
        }

        try {
            stateTransition(this, STATE_CLOSING);
            this.stopHealthMonitoring();
            if (this.httpServer) {
                await new Promise((resolve) => {
                    this.httpServer.close(() => resolve());
                });
            }
            if (this.dbConnection) {
                await mongoose.disconnect();
            }

            stateTransition(this, STATE_CLOSED);
            this.emit(SERVER_CLOSE);

            console.log('Server shut down successfully');
            
            if (callback) callback();

        } catch (error) {
            this.handleError(error);
            if (callback) callback(error);
            throw error;
        }
    }

    async gracefulShutdown(signal) {
        console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
        if (this.httpServer) {
            this.httpServer.close();
        }
        const shutdownTimeout = 30000; 
        const checkInterval = 100;
        let elapsed = 0;

        while (this.state.operationCount > 0 && elapsed < shutdownTimeout) {
            console.log(`Waiting for ${this.state.operationCount} operations to complete...`);
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            elapsed += checkInterval;
        }

        if (this.state.operationCount > 0) {
            console.log(`Forcing shutdown with ${this.state.operationCount} operations still running`);
        }

        await this.destroy();
        process.exit(0);
    }

    startHealthMonitoring() {
        this.healthCheckTimer = setInterval(() => {
            const health = this.getHealthStatus();
            this.state.lastHealthCheck = new Date();
            
            if (health.status !== 'healthy') {
                console.warn('Health check failed:', health);
                this.emit('healthCheckFailed', health);
            }
        }, this.options.healthCheckInterval);
    }

    stopHealthMonitoring() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }
    }

    getHealthStatus() {
        const uptime = this.state.startTime ? Date.now() - this.state.startTime.getTime() : 0;
        const memoryUsage = process.memoryUsage();
        
        const health = {
            status: 'healthy',
            timestamp: new Date(),
            uptime: uptime,
            server: {
                state: this.state.current,
                operationCount: this.state.operationCount,
                connectionCount: this.state.connectionCount
            },
            database: {
                connected: mongoose.connection.readyState === 1,
                state: this.getDatabaseState()
            },
            memory: {
                rss: Math.round(memoryUsage.rss / 1024 / 1024),
                heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                external: Math.round(memoryUsage.external / 1024 / 1024)
            },
            metrics: this.state.metrics
        };

        if (this.state.current !== STATE_CONNECTED || 
            mongoose.connection.readyState !== 1 ||
            this.state.errors.length > 10) {
            health.status = 'unhealthy';
        }

        return health;
    }
    getMetrics() {
        return {
            ...this.state.metrics,
            uptime: this.state.startTime ? Date.now() - this.state.startTime.getTime() : 0,
            state: this.state.current,
            operationCount: this.state.operationCount,
            connectionCount: this.state.connectionCount,
            recentErrors: this.state.errors.slice(-5)
        };
    }
    getDatabaseState() {
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        return states[mongoose.connection.readyState] || 'unknown';
    }

    handleError(error) {
        const errorInfo = {
            message: error.message,
            code: error.code || 'UNKNOWN_ERROR',
            name: error.name || 'Error',
            stack: error.stack,
            timestamp: new Date()
        };

        this.state.errors.push(errorInfo);
        if (this.state.errors.length > 50) {
            this.state.errors.shift();
        }
        this.emit(SERVER_ERROR, error);

        if (error instanceof DatabaseError || error instanceof ConnectionError) {
            console.error('Critical Error:', error.message);
        } else {
            console.error('Error:', error.message);
        }
        if (process.env.NODE_ENV === 'development') {
            console.error(error.stack);
        }
    }
    getState() { return this.state.current; }
    setState(newState) { this.state.current = newState; }
    
    incrementOperationCount() { return ++this.state.operationCount; }
    decrementOperationCount() { return --this.state.operationCount; }
    incrementConnectionCount() { return ++this.state.connectionCount; }
    decrementConnectionCount() { return --this.state.connectionCount; }

    static get SERVER_CONNECT() { return SERVER_CONNECT; }
    static get SERVER_CLOSE() { return SERVER_CLOSE; }
    static get SERVER_ERROR() { return SERVER_ERROR; }
    static get DATABASE_CONNECTED() { return DATABASE_CONNECTED; }
    static get DATABASE_DISCONNECTED() { return DATABASE_DISCONNECTED; }
    static get DATABASE_ERROR() { return DATABASE_ERROR; }
    static get REQUEST_RECEIVED() { return REQUEST_RECEIVED; }
    static get RESPONSE_SENT() { return RESPONSE_SENT; }
    static get HEALTH_CHECK() { return HEALTH_CHECK; }
}

if (require.main === module) {
    const server = new FoodOrderingServer();
    
    server.connect().catch((error) => {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    });
}
module.exports = {
    FoodOrderingServer,
    ServerError,
    DatabaseError,
    ConnectionError,
    STATE_CLOSED,
    STATE_CONNECTING,
    STATE_CONNECTED,
    STATE_CLOSING
};
