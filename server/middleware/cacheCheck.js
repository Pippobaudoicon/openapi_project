import { cacheStrategies, modelMapping, validationFunctions } from '../config/cacheStrategies.js';

/**
 * Dynamic model loader
 */
const loadModel = async (modelName) => {
    const module = await import(modelMapping[modelName]);
    return module.default;
};

/**
 * Builds query object based on strategy parameters
 */
const buildQuery = (strategy, req) => {
    return strategy.searchParams.reduce((query, param) => {
        if (req.params[param]) query[param] = req.params[param];
        if (req.query[param]) query[param] = req.query[param];
        return query;
    }, {});
};

/**
 * Enhanced cache check middleware
 * @param {string} modelSearch - Main search type by model (company/visure)
 * @param {string} [searchType] - Optional sub type by searchType (advanced/full/closed)
 */
export const checkCache = (modelSearch, searchType = null) => async (req, res, next) => {
    const force = req.query.force === 'true';
    if (force) return next();

    const strategyKey = Object.keys(cacheStrategies)
        .find(key => modelSearch.includes(key)) || 'company';
    const strategy = cacheStrategies[strategyKey];

    try {
        const Model = await loadModel(strategy.model);
        const query = buildQuery(strategy, req);
        
        // Add searchType to query if provided
        if (searchType) {
            query.searchType = searchType;
        }

        const existingSearch = await Model.findOne(query)
            .sort({ createdAt: -1 });

        if (existingSearch && validationFunctions[strategy.validationFn](existingSearch)) {
            return res.json({
                source: 'cache',
                timestamp: existingSearch.createdAt,
                data: existingSearch.data
            });
        }
    } catch (error) {
        console.error('Cache check error:', error);
    }
    
    next();
};
