import express from 'express';
import errorHandler from 'express-error-handler';
import dotenv from 'dotenv';
import { __dirname, path, distDir } from './utils/paths.js';

// My imports
import apiRoutes from './routes/api/openapi.js';
import closedCompanyRouter from './routes/closed-company.js';

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
    dotenv.config({ path: '.env.development' });
} else {
    app.use(errorHandler());
    dotenv.config();
}

const port = process.env.PORT || 3000;

// Serve static files from the Vue app
app.use(express.static(path.join(distDir)));

app.use('/api', apiRoutes);
app.use('/closed-company', closedCompanyRouter);

// All other routes should serve the Vue app
app.get('*', (req, res) => {
    res.sendFile(path.join(distDir +'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});