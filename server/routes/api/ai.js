import express from 'express';
import crypto from 'crypto';
import { checkPermission } from '../../middleware/roleAuth.js';
import { parseNaturalLanguageQuery } from '../../services/openaiService.js';
import SearchHistory from '../../models/SearchHistory.js';

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

            const trimmed = query.trim();
            const queryHash = crypto.createHash('sha256').update(trimmed.toLowerCase()).digest('hex');

            // Check for cached full search results
            const cached = await SearchHistory.findOne({
                userId: req.user._id,
                queryHash
            }).sort({ createdAt: -1 });

            if (cached) {
                return res.json({
                    params: cached.parsedParams,
                    interpretation: cached.interpretation,
                    results: cached.results,
                    resultCount: cached.resultCount,
                    cached: true,
                    timestamp: cached.createdAt
                });
            }

            // No cached results — parse via AI
            const result = await parseNaturalLanguageQuery(trimmed);
            res.json(result);
        } catch (error) {
            console.error('Error parsing query:', error);
            res.status(500).json({ error: 'Failed to parse search query.' });
        }
    }
);

router.post('/save-search',
    checkPermission('search_companies'),
    async (req, res) => {
        try {
            const { query, parsedParams, interpretation, results } = req.body;

            if (!query || typeof query !== 'string') {
                return res.status(400).json({ error: 'Query string is required.' });
            }

            const queryHash = crypto.createHash('sha256').update(query.trim().toLowerCase()).digest('hex');

            await SearchHistory.updateOne(
                { userId: req.user._id, queryHash },
                {
                    $set: {
                        rawQuery: query.trim(),
                        parsedParams: parsedParams || {},
                        interpretation: interpretation || '',
                        results: results || [],
                        resultCount: Array.isArray(results) ? results.length : 0,
                        createdAt: new Date()
                    }
                },
                { upsert: true }
            );

            res.json({ success: true });
        } catch (error) {
            console.error('Error saving search:', error);
            res.status(500).json({ error: 'Failed to save search.' });
        }
    }
);

router.get('/search-history',
    checkPermission('search_companies'),
    async (req, res) => {
        try {
            const history = await SearchHistory.find({ userId: req.user._id })
                .sort({ createdAt: -1 })
                .limit(10)
                .select('rawQuery interpretation resultCount createdAt')
                .lean();

            res.json(history);
        } catch (error) {
            console.error('Error fetching search history:', error);
            res.status(500).json({ error: 'Failed to fetch search history.' });
        }
    }
);

export default router;
