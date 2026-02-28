import express from 'express';
import { checkPermission } from '../../middleware/roleAuth.js';
import { parseNaturalLanguageQuery } from '../../services/openaiService.js';

const router = express.Router();

router.post('/parse-query',
    checkPermission('search_companies'),
    async (req, res) => {
        try {
            const { query } = req.body;

            if (!query || typeof query !== 'string') {
                return res.status(400).json({ error: 'Query string is required.' });
            }

            if (query.length > 500) {
                return res.status(400).json({ error: 'Query must be 500 characters or less.' });
            }

            const result = await parseNaturalLanguageQuery(query.trim());
            res.json(result);
        } catch (error) {
            console.error('Error parsing query:', error);
            res.status(500).json({ error: 'Failed to parse search query.' });
        }
    }
);

export default router;
