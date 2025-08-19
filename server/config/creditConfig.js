/**
 * Credit cost configuration for OpenAPI and OpenAI services
 * All costs are in credit units
 */

// OpenAPI service costs
export const OPENAPI_COSTS = {
    // Company data retrieval costs
    'IT-advanced': {
        cost: 0.388888,
        description: 'Advanced company data retrieval'
    },
    'IT-full': {
        cost: 0.799999,
        description: 'Full company data with detailed financials'
    },
    'IT-closed': {
        cost: 0.085000,
        description: 'Company closure status check'
    },
    'IT-search': {
        cost: 0.344447, // Base cost
        costPerResult: 0.008333, // Additional cost per result
        maxResults: 100, // Maximum results to charge for
        description: 'Company search with parameters'
    },
    
    // Visure Camerali costs
    'impresa-get': {
        cost: 1,
        description: 'Company registry data retrieval'
    },
    'impresa-search': {
        cost: 2,
        costPerResult: 0.2,
        maxResults: 50,
        description: 'Company registry search'
    },
    'bilancio-ottico-request': {
        cost: 8,
        description: 'Financial statement optical scan request'
    },
    'bilancio-ottico-check': {
        cost: 0.5,
        description: 'Check financial statement processing status'
    },
    'bilancio-ottico-download': {
        cost: 1,
        description: 'Download processed financial statements'
    },
    
    // LLM/AI Analysis costs
    'llm-overview': {
        cost: 0.1, // Base cost for LLM overview generation (additional OpenAI token costs apply)
        description: 'AI-generated financial overview and analysis'
    }
};

// OpenAI model costs (per 1K tokens)
export const OPENAI_COSTS = {
    'gpt-4o-mini': {
        inputCost: 0.003,  // $0.003 per 1K input tokens
        outputCost: 0.006, // $0.006 per 1K output tokens
        description: 'GPT-4o Mini model'
    },
    'gpt-4.1-nano-2025-04-14': {
        inputCost: 0.003,  // $0.003 per 1K input tokens
        outputCost: 0.006, // $0.006 per 1K output tokens
        description: 'GPT-4.1 Nano model'
    }
};

// Convert USD to credits (1 USD = 1 credit)
export const USD_TO_CREDITS = 1;

/**
 * Calculate OpenAI cost in credits based on token usage
 * @param {string} model - OpenAI model name
 * @param {number} inputTokens - Number of input tokens
 * @param {number} outputTokens - Number of output tokens
 * @returns {number} Cost in credits
 */
export function calculateOpenAICost(model, inputTokens = 0, outputTokens = 0) {
    const modelConfig = OPENAI_COSTS[model];
    if (!modelConfig) {
        console.warn(`Unknown OpenAI model: ${model}, using default pricing`);
        return Math.round((inputTokens + outputTokens) / 1000 * 0.01 * USD_TO_CREDITS * 1000000) / 1000000;
    }
    
    const inputCost = (inputTokens / 1000) * modelConfig.inputCost;
    const outputCost = (outputTokens / 1000) * modelConfig.outputCost;
    const totalCostUSD = inputCost + outputCost;
    
    // Convert to credits with up to 6 decimal places precision
    return Math.round(totalCostUSD * USD_TO_CREDITS * 1000000) / 1000000;
}

/**
 * Calculate OpenAPI cost in credits
 * @param {string} endpoint - API endpoint identifier
 * @param {number} resultCount - Number of results (for search endpoints)
 * @returns {number} Cost in credits
 */
export function calculateOpenAPICost(endpoint, resultCount = 1) {
    const config = OPENAPI_COSTS[endpoint];
    if (!config) {
        console.warn(`Unknown OpenAPI endpoint: ${endpoint}, using default cost of 1 credit`);
        return 1;
    }
    
    let totalCost = config.cost;
    
    // Add per-result cost if applicable
    if (config.costPerResult && resultCount > 1) {
        const billableResults = Math.min(resultCount - 1, config.maxResults || resultCount);
        totalCost += billableResults * config.costPerResult;
    }
    
    // Return cost with up to 6 decimal places precision
    return Math.round(totalCost * 1000000) / 1000000;
}

/**
 * Get cost estimate for an action
 * @param {string} serviceType - 'openapi' or 'openai'
 * @param {string} actionType - Action identifier
 * @param {Object} params - Additional parameters
 * @returns {Object} Cost estimate with breakdown
 */
export function getCostEstimate(serviceType, actionType, params = {}) {
    if (serviceType === 'openapi') {
        const cost = calculateOpenAPICost(actionType, params.resultCount);
        const config = OPENAPI_COSTS[actionType];
        
        return {
            cost,
            description: config?.description || 'OpenAPI request',
            breakdown: {
                baseCost: config?.cost || 1,
                perResultCost: config?.costPerResult || 0,
                resultCount: params.resultCount || 1,
                maxBillableResults: config?.maxResults
            }
        };
    }
    
    if (serviceType === 'openai') {
        const cost = calculateOpenAICost(actionType, params.inputTokens, params.outputTokens);
        const config = OPENAI_COSTS[actionType];
        
        return {
            cost,
            description: config?.description || 'OpenAI API request',
            breakdown: {
                model: actionType,
                inputTokens: params.inputTokens || 0,
                outputTokens: params.outputTokens || 0,
                inputCostUSD: config ? (params.inputTokens / 1000) * config.inputCost : 0,
                outputCostUSD: config ? (params.outputTokens / 1000) * config.outputCost : 0
            }
        };
    }
    
    return {
        cost: 1,
        description: 'Unknown service',
        breakdown: {}
    };
}

// Action type mappings for better organization
export const ACTION_MAPPINGS = {
    // OpenAPI endpoints to action types
    '/IT-advanced/': 'IT-advanced',
    '/IT-full/': 'IT-full',
    '/IT-closed/': 'IT-closed',
    '/IT-search': 'IT-search',
    '/impresa/': 'impresa-get',
    '/impresa': 'impresa-search',
    '/bilancio-ottico': 'bilancio-ottico-request',
    '/bilancio-ottico/': 'bilancio-ottico-check',
    // LLM/OpenAI endpoints
    '/llm-overview/': 'llm-overview'
};

/**
 * Map API endpoint to action type
 * @param {string} endpoint - API endpoint path
 * @param {string} method - HTTP method
 * @returns {string} Action type identifier
 */
export function mapEndpointToAction(endpoint, method = 'GET') {
    // Handle specific patterns
    if (endpoint.includes('/bilancio-ottico/') && endpoint.includes('/allegati')) {
        return 'bilancio-ottico-download';
    }
    
    if (endpoint.includes('/bilancio-ottico/') && method === 'GET') {
        return 'bilancio-ottico-check';
    }
    
    if (endpoint.includes('/bilancio-ottico') && method === 'POST') {
        return 'bilancio-ottico-request';
    }
    
    // Check mappings
    for (const [pattern, actionType] of Object.entries(ACTION_MAPPINGS)) {
        if (endpoint.includes(pattern)) {
            return actionType;
        }
    }
    
    return 'unknown';
}
