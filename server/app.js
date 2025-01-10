import express from 'express';
import errorHandler from 'express-error-handler';
import dotenv from 'dotenv';
import morgan from 'morgan';
import * as rfs from 'rotating-file-stream';
import { __dirname, path, distDir, logsDir } from './utils/paths.js';

// My import routes
import apiRoutes from './routes/api/openapi.js';
import closedCompanyRouter from './routes/api/one-time-script/closedCompany.js'; //ONE TIME SCRIPT

// Create the Express app
const app = express();

// Create rotating log stream
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: logsDir,
    size: '10M',      // Rotate when size exceeds 10MB
    compress: 'gzip', // Compress rotated files
    teeToStdout: true // Also log to console
});

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
    dotenv.config({ path: '.env.development' });
} else {
    app.use(morgan('combined', { stream: accessLogStream }));
    app.use(errorHandler());
    dotenv.config();
}

// ROUTES
app.use(express.static(path.join(distDir))); // Serve static files from the Vue app
app.use('/api', apiRoutes);
app.use('/closed-company', closedCompanyRouter); //ONE TIME SCRIPT

// All other routes should serve the Vue app
app.get('*', (req, res) => {
    res.sendFile(path.join(distDir + '/index.html'));
});

// Middleware to parse JSON data
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(express.json());

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});