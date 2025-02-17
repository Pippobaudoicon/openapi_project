import express from 'express';
import VisureSearch from '../../../models/VisureSearch.js';


const router = express.Router();
// Generic callback endpoint
router.post('/visure',
    async (req, res) => {
        try {
            // The result will be in the field specified in the callback
            const result = req.body.result;
            if (!result) {
                throw new Error('No result data received in callback');
            }

            const { searchType, piva, requestTime } = result;
            const status = result.stato_richiesta || result.status;
            const data = result.data || result;

            // Handle different types of callbacks
            await VisureSearch.updateOne(
                {
                    piva,
                    searchType
                },
                {
                    $set: {
                        status: status === 'Dati disponibili' ? 'complete' : 'pending',
                        data: data,
                        updatedAt: new Date(),
                        requestTime: new Date(requestTime)
                    }
                }
            );

            res.status(200).json({
                message: 'Callback processed successfully',
                type,
                piva
            });
        } catch (error) {
            console.error('Callback processing error:', error);
            res.status(500).json({
                error: 'Failed to process callback',
                details: error.message
            });
        }
    }
);

export default router;