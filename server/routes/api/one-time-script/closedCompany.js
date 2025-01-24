import express from 'express';
import processCsv from '../../../services/one-time-scripts/processCsv.js';

const router = express.Router();

router.post('/process-csv', (req, res) => {
    // processCsv(); // Disabled preventing the script from running and spending tokens
    res.send('Function temporarely disabled, preventing human error.');
});

export default router;