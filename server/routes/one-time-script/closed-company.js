import express from 'express';
import processCsv from '../../utils/one-time-scripts/processCsv.js';

const router = express.Router();

router.post('/process-csv', (req, res) => {
    processCsv();
    res.send('CSV processing started.');
});

export default router;