import './config/env.js';
import express from 'express';
import errorHandler from 'express-error-handler';
import morgan from 'morgan';
import * as rfs from 'rotating-file-stream';
import { __dirname, path, distDir, logsDir } from './utils/paths.js';
import session from 'express-session';
import passport from 'passport';
import { initializePassport } from './auth/passport-config.js';
import connectDB, { sessionStore } from './config/database.js';
import cors from 'cors';

// Import routes
import apiRoutes from './routes/api/index.js';
import closedCompanyRouter from './routes/api/one-time-script/closedCompany.js';

// Connect to MongoDB
connectDB();

// Create the Express app
const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.APP_URL,
    credentials: true  
}));

// Logging configuration
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: logsDir,
    size: '10M',
    compress: 'gzip',
    teeToStdout: true
});

// Error handling middleware configuration
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
} else {
    app.use(morgan('combined', { stream: accessLogStream }));
}

// Initialize passport
initializePassport();

// Middleware configuration for parsing JSON and URL encoded data
app.use(express.json({
    limit: '1mb',
    verify: (req, res, buf, encoding) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            res.status(400).json({ 
                error: 'Invalid JSON payload',
                details: e.message 
            });
            throw new Error('Invalid JSON');
        }
    }
}));

app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Session configuration - must be before passport middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'scemo-chi-legge',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize passport after session
app.use(passport.initialize());
app.use(passport.session());

// Use the routes
app.use('/api', apiRoutes);
app.use('/closed-company', closedCompanyRouter); //ONE TIME SCRIPT

// Serve static files from the Vue app (but only for non-API routes)
app.use(express.static(path.join(distDir), {
    index: false // Don't serve index.html automatically for directories
}));

// All other NON-API routes should serve the Vue app
app.get('*', (req, res, next) => {
    // Skip serving index.html for API routes
    if (req.path.startsWith('/api/')) {
        return next();
    }
    res.sendFile(path.join(distDir + '/index.html'));
});

// Add error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ 
            error: 'Invalid JSON payload',
            details: err.message 
        });
    }
    next();
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
});