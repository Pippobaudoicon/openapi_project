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
import authRoutes from './routes/api/auth.js';

// Connect to MongoDB
connectDB();

// Create the Express app
const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // Your Vue dev server URL
    credentials: true // Allow credentials
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
app.use(express.json({ limit: '1mb' }));
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
app.use(express.static(path.join(distDir))); // Serve static files from the Vue app
app.use('/api/auth', authRoutes);  // Add auth routes first
app.use('/api', apiRoutes);
app.use('/closed-company', closedCompanyRouter); //ONE TIME SCRIPT

// All other routes should serve the Vue app
app.get('*', (req, res) => {
    res.sendFile(path.join(distDir + '/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});