import CreditTransaction from '../models/CreditTransaction.js';
import { 
    calculateOpenAPICost, 
    calculateOpenAICost, 
    mapEndpointToAction,
    getCostEstimate 
} from '../config/creditConfig.js';

/**
 * Middleware to track credit usage for OpenAPI calls
 * This should be added AFTER the actual API call to capture response data
 */
export const trackOpenAPICredit = (actionType = null) => {
    return async (req, res, next) => {
        // Store original json function
        const originalJson = res.json;
        
        // Override res.json to capture response data
        res.json = async function(data) {
            try {
                // Determine action type
                const endpoint = req.route?.path || req.path;
                const method = req.method;
                const resolvedActionType = actionType || mapEndpointToAction(endpoint, method);
                
                // Skip credit tracking for certain cases
                if (resolvedActionType === 'unknown' || req.skipCreditTracking) {
                    return originalJson.call(this, data);
                }
                
                // Get user ID from request (assuming it's set by auth middleware)
                const userId = req.user?.id || req.user?._id;
                if (!userId) {
                    console.warn('Credit tracking skipped: No user ID in request');
                    return originalJson.call(this, data);
                }
                
                // Calculate cost based on response data
                let resultCount = 1;
                if (data?.data && Array.isArray(data.data)) {
                    resultCount = data.data.length;
                } else if (data?.data?.data && Array.isArray(data.data.data)) {
                    resultCount = data.data.data.length;
                }
                
                const creditCost = calculateOpenAPICost(resolvedActionType, resultCount);
                
                // Get related activity ID if available
                const relatedActivityId = req.activityId || null;
                
                try {
                    // Create credit transaction with limit checks
                    await CreditTransaction.createDebitWithLimits({
                        userId,
                        serviceType: 'openapi',
                        actionType: resolvedActionType,
                        amount: creditCost,
                        description: `OpenAPI ${method} ${endpoint}${resultCount > 1 ? ` (${resultCount} results)` : ''}`,
                        metadata: {
                            endpoint,
                            method,
                            resultCount,
                            responseStatus: res.statusCode,
                            piva: req.params.piva,
                            searchParams: req.query
                        },
                        relatedActivityId,
                        apiEndpoint: endpoint,
                        httpMethod: method,
                        responseStatus: res.statusCode
                    });
                    
                    console.log(`Credit tracked: ${creditCost} credits for ${resolvedActionType} (User: ${userId})`);
                    
                } catch (creditError) {
                    console.error('Error tracking OpenAPI credits:', creditError);
                    
                    // Handle different types of credit errors
                    if (creditError.message.includes('Insufficient credit balance') || 
                        creditError.code === 'insufficient_balance') {
                        res.status(402); // Payment Required
                        return originalJson.call(this, {
                            error: 'Insufficient credit balance',
                            message: 'Please add more credits to your account to continue using this service.',
                            ...creditError.details
                        });
                    }
                    
                    if (creditError.code === 'daily_limit_exceeded') {
                        res.status(429); // Too Many Requests
                        return originalJson.call(this, {
                            error: 'Daily credit limit exceeded',
                            message: 'You have reached your daily credit spending limit. Try again tomorrow or contact support to increase your limit.',
                            ...creditError.details
                        });
                    }
                    
                    if (creditError.code === 'monthly_limit_exceeded') {
                        res.status(429); // Too Many Requests
                        return originalJson.call(this, {
                            error: 'Monthly credit limit exceeded',
                            message: 'You have reached your monthly credit spending limit. Wait for next month or contact support to increase your limit.',
                            ...creditError.details
                        });
                    }
                    
                    // For other errors, log but don't block the response
                    console.error('Non-blocking credit tracking error:', creditError);
                }
            } catch (error) {
                console.error('Error in credit tracking middleware:', error);
            }
            
            // Always return the original response
            return originalJson.call(this, data);
        };
        
        next();
    };
};

/**
 * Middleware to track credit usage for OpenAI calls
 * This should be called manually after OpenAI API calls with token usage data
 */
export const trackOpenAICredit = async ({
    userId,
    model,
    promptTokens = 0,
    completionTokens = 0,
    description,
    metadata = {},
    relatedActivityId = null,
    skipLimitCheck = false
}) => {
    try {
        const totalTokens = promptTokens + completionTokens;
        const creditCost = calculateOpenAICost(model, promptTokens, completionTokens);
        
        const debitMethod = skipLimitCheck ?
            CreditTransaction.createDebit.bind(CreditTransaction) :
            CreditTransaction.createDebitWithLimits.bind(CreditTransaction);

        await debitMethod({
            userId,
            serviceType: 'openai',
            actionType: model,
            amount: creditCost,
            description: description || `OpenAI ${model} (${totalTokens} tokens)`,
            metadata: {
                ...metadata,
                totalTokens,
                model
            },
            relatedActivityId,
            openaiModel: model,
            tokensUsed: totalTokens,
            promptTokens,
            completionTokens,
            skipLimitCheck
        });
        
        console.log(`OpenAI Credit tracked: ${creditCost} credits for ${model} (${totalTokens} tokens, User: ${userId})`);
        
        return {
            success: true,
            creditCost,
            tokensUsed: totalTokens
        };
        
    } catch (error) {
        console.error('Error tracking OpenAI credits:', error);
        throw error;
    }
};

/**
 * Middleware to check if user has sufficient credits for an action (with limits)
 */
export const checkCreditBalance = (serviceType, actionType, params = {}) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id || req.user?._id;
            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            
            // Get cost estimate
            const estimate = getCostEstimate(serviceType, actionType, params);
            
            // Check if user can spend this amount (includes balance and limits)
            const spendingCheck = await CreditTransaction.canUserSpend(userId, estimate.cost);
            
            if (!spendingCheck.canSpend) {
                const statusCode = spendingCheck.reason === 'insufficient_balance' ? 402 : 429;
                const errorMessages = {
                    'insufficient_balance': 'Insufficient credit balance',
                    'daily_limit_exceeded': 'Daily credit limit exceeded',
                    'monthly_limit_exceeded': 'Monthly credit limit exceeded'
                };
                
                return res.status(statusCode).json({
                    error: errorMessages[spendingCheck.reason] || 'Credit spending not allowed',
                    message: `${errorMessages[spendingCheck.reason]}. Please check your account settings or contact support.`,
                    action: actionType,
                    estimate,
                    ...spendingCheck.details
                });
            }
            
            // Add estimate to request for potential use
            req.creditEstimate = estimate;
            next();
            
        } catch (error) {
            console.error('Error checking credit balance:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

/**
 * Helper function to manually track credits (for use in service functions)
 */
export const manualCreditTrack = async ({
    userId,
    serviceType,
    actionType,
    amount,
    description,
    metadata = {},
    relatedActivityId = null,
    tokensUsed = null,
    promptTokens = null,
    completionTokens = null,
    model = null,
    skipLimitCheck = false
}) => {
    try {
        const debitMethod = skipLimitCheck ? 
            CreditTransaction.createDebit : 
            CreditTransaction.createDebitWithLimits;
            
        return await debitMethod({
            userId,
            serviceType,
            actionType,
            amount,
            description,
            metadata,
            relatedActivityId,
            openaiModel: model,
            tokensUsed,
            promptTokens,
            completionTokens,
            status: 'completed',
            skipLimitCheck
        });
    } catch (error) {
        console.error('Manual credit tracking failed:', error);
        throw error;
    }
};

/**
 * Get user's credit information
 */
export const getUserCreditInfo = async (userId) => {
    try {
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(userId).select('creditBalance creditLimit creditSettings');
        
        if (!user) {
            throw new Error('User not found');
        }
        
        const stats = await CreditTransaction.getUserStats(userId);
        const recentTransactions = await CreditTransaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('relatedActivityId')
            .populate('processedBy', 'firstName lastName email')
            .lean();
        
        // Calculate daily and monthly spending
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        const nextMonth = new Date(thisMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        const [dailySpending, monthlySpending] = await Promise.all([
            CreditTransaction.aggregate([
                {
                    $match: {
                        userId: new (await import('mongoose')).default.Types.ObjectId(userId),
                        transactionType: 'debit',
                        status: 'completed',
                        createdAt: { $gte: today, $lt: tomorrow }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSpent: { $sum: '$amount' }
                    }
                }
            ]),
            CreditTransaction.aggregate([
                {
                    $match: {
                        userId: new (await import('mongoose')).default.Types.ObjectId(userId),
                        transactionType: 'debit',
                        status: 'completed',
                        createdAt: { $gte: thisMonth, $lt: nextMonth }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSpent: { $sum: '$amount' }
                    }
                }
            ])
        ]);
        
        return {
            currentBalance: user.creditBalance || 0,
            creditLimit: user.creditLimit || 0,
            creditSettings: user.creditSettings || {},
            dailySpending: dailySpending.length > 0 ? dailySpending[0].totalSpent : 0,
            monthlySpending: monthlySpending.length > 0 ? monthlySpending[0].totalSpent : 0,
            stats: stats[0] || {
                totalSpent: 0,
                totalTransactions: 0,
                serviceBreakdown: []
            },
            recentTransactions
        };
    } catch (error) {
        console.error('Error getting user credit info:', error);
        throw error;
    }
};

export default {
    trackOpenAPICredit,
    trackOpenAICredit,
    checkCreditBalance,
    manualCreditTrack,
    getUserCreditInfo
};
