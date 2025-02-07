import CompanySearch from '../models/CompanySearch.js';
import { isDataCurrentYear } from '../utils/searchHelpers.js';

/**
 * Middleware to check if data exists in cache before proceeding with the request.
 * 
 * @param {string} searchType - The type of search being performed
 * @param {boolean} req.query.force - Flag to skip cache check
 * @param {string} req.params.piva - VAT number
 * @async
 * 
 * The middleware checks for cached company data based on:
 * - VAT number (piva) from request parameters
 * - Force flag from query parameters (skips cache if true)
 * 
 * If valid cached data is found, returns:
 * - source: 'cache'
 * - timestamp: when data was cached
 * - data: the cached company data
 * 
 * If no cache found or force=true, passes to next middleware
 */
export const checkCache = (searchType) => async (req, res, next) => {
    const piva = req.params.piva;
    const force = req.query.force === 'true';

    if (!force) {
        try {
            const existingSearch = await CompanySearch.findOne({
                piva,
                searchType
            }).sort({ createdAt: -1 });

            if (existingSearch && isDataCurrentYear(existingSearch)) {
                return res.json({
                    source: 'cache',
                    timestamp: existingSearch.createdAt,
                    data: existingSearch.data.data[0]
                });
            }
        } catch (error) {
            console.error('Cache check error:', error);
        }
    }
    
    next();
};
