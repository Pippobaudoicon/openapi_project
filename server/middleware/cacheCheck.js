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
export const checkCache = (modelSearch, searchType = null, searchStatus = null) => async (req, res, next) => {
    const force = req.query.force === 'true';
    if (force) return next();

    const strategyKey = Object.keys(cacheStrategies)
        .find(key => modelSearch.includes(key)) || 'company';
    const strategy = cacheStrategies[strategyKey];

    try {
        const Model = await loadModel(strategy.model);
        const query = buildQuery(strategy, req);
        
        if (searchType && Array.isArray(searchType)) {
            query.searchType = { $in: searchType };
        } else if (searchType) {
            query.searchType = searchType;
        }

        if (searchStatus) {
            query.status = searchStatus;
        }

        const existingSearch = await Model.findOne(query)
            .sort({ createdAt: -1 });
        if (existingSearch && validationFunctions[strategy.validationFn](existingSearch)) {
            return res.json({
                source: 'cache',
                timestamp: existingSearch.createdAt,
                data: existingSearch.data,
                searchType: existingSearch.searchType,
                piva: existingSearch.piva,
            });
        }
    } catch (error) {
        console.error('Cache check error:', error);
    }
    
    next();
};
