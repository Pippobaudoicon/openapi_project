const express = require('express');
const errorHandler = require('express-error-handler');
const app = express();
const path = require('path');

if (process.env.NODE_ENV === 'development') {
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
    require('dotenv').config({ path: '.env.development' });
} else {
    app.use(errorHandler());
    require('dotenv').config();
}

const port = process.env.PORT || 3000;

// Serve static files from the Vue app
app.use(express.static(path.join(__dirname, '../client/dist')));

const apiRoutes = require('./routes/api/openapi');
app.use('/api', apiRoutes);

// All other routes should serve the Vue app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});