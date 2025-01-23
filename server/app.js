import './config/env.js';
import express from 'express';
import errorHandler from 'express-error-handler';
import morgan from 'morgan';
import * as rfs from 'rotating-file-stream';
import { __dirname, path, distDir, logsDir } from './utils/paths.js';

// Import routes
import apiRoutes from './routes/api/index.js';
import closedCompanyRouter from './routes/api/one-time-script/closedCompany.js';

// Create the Express app
const app = express();

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
    app.use(errorHandler());
}

// Use the routes
app.use(express.static(path.join(distDir))); // Serve static files from the Vue app
app.use('/api', apiRoutes);
app.use('/closed-company', closedCompanyRouter); //ONE TIME SCRIPT


// Middleware configuration for parsing JSON and URL encoded data for all routes except /api
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// All other routes should serve the Vue app
app.get('*', (req, res) => {
    res.sendFile(path.join(distDir + '/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});