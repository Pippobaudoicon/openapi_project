import mongoose from 'mongoose';

const creditTransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    transactionType: {
        type: String,
        enum: ['debit', 'credit', 'refund'],
        required: true
    },
    serviceType: {
        type: String,
        enum: ['openapi', 'openai', 'manual'],
        required: true
    },
    actionType: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    balanceBefore: {
        type: Number,
        required: true
    },
    balanceAfter: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Reference to related search/activity
    relatedActivityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
    },
    // OpenAPI specific fields
    apiEndpoint: String,
    httpMethod: String,
    responseStatus: Number,
    
    // OpenAI specific fields
    openaiModel: String,
    tokensUsed: Number,
    promptTokens: Number,
    completionTokens: Number,
    
    // Status and error tracking
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'completed'
    },
    errorMessage: String,
    
    // Admin fields
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: String
}, { 
    timestamps: true,
    index: { userId: 1, createdAt: -1 }
});

// Static method to create a debit transaction
creditTransactionSchema.statics.createDebit = async function({
    userId,
    serviceType,
    actionType,
    amount,
    description,
    metadata = {},
    relatedActivityId,
    apiEndpoint,
    httpMethod,
    responseStatus,
    openaiModel,
    tokensUsed,
    promptTokens,
    completionTokens
}) {
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    const balanceBefore = user.creditBalance || 0;
    const balanceAfter = balanceBefore - amount;
    
    if (balanceAfter < 0) {
        throw new Error('Insufficient credit balance');
    }
    
    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        // Update user balance
        await User.findByIdAndUpdate(
            userId,
            { creditBalance: balanceAfter },
            { session }
        );
        
        // Create transaction record
        const transaction = new this({
            userId,
            transactionType: 'debit',
            serviceType,
            actionType,
            amount,
            balanceBefore,
            balanceAfter,
            description,
            metadata,
            relatedActivityId,
            apiEndpoint,
            httpMethod,
            responseStatus,
            openaiModel,
            tokensUsed,
            promptTokens,
            completionTokens,
            status: 'completed'
        });
        
        const savedTransaction = await transaction.save({ session });
        
        await session.commitTransaction();
        return savedTransaction;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// Static method to create a credit transaction (adding credits)
creditTransactionSchema.statics.createCredit = async function({
    userId,
    amount,
    description,
    metadata = {},
    processedBy,
    notes
}) {
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    const balanceBefore = user.creditBalance || 0;
    const balanceAfter = balanceBefore + amount;
    
    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        // Update user balance
        await User.findByIdAndUpdate(
            userId,
            { creditBalance: balanceAfter },
            { session }
        );
        
        // Create transaction record
        const transaction = new this({
            userId,
            transactionType: 'credit',
            serviceType: 'manual',
            actionType: 'credit_add',
            amount,
            balanceBefore,
            balanceAfter,
            description,
            metadata,
            processedBy,
            notes,
            status: 'completed'
        });
        
        const savedTransaction = await transaction.save({ session });
        
        await session.commitTransaction();
        return savedTransaction;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// Get user's credit usage statistics
creditTransactionSchema.statics.getUserStats = async function(userId, startDate, endDate) {
    const matchStage = {
        userId: new mongoose.Types.ObjectId(userId),
        transactionType: 'debit',
        status: 'completed'
    };
    
    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }
    
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$serviceType',
                totalSpent: { $sum: '$amount' },
                totalTransactions: { $sum: 1 },
                actions: {
                    $push: {
                        actionType: '$actionType',
                        amount: '$amount',
                        createdAt: '$createdAt'
                    }
                }
            }
        },
        {
            $group: {
                _id: null,
                totalSpent: { $sum: '$totalSpent' },
                totalTransactions: { $sum: '$totalTransactions' },
                serviceBreakdown: {
                    $push: {
                        serviceType: '$_id',
                        spent: '$totalSpent',
                        transactions: '$totalTransactions',
                        actions: '$actions'
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalSpent: 1,
                totalTransactions: 1,
                serviceBreakdown: 1
            }
        }
    ]);
};

// Check if user can spend the specified amount (considering limits)
creditTransactionSchema.statics.canUserSpend = async function(userId, amount) {
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    
    if (!user) throw new Error('User not found');
    
    // Check credit balance
    if (user.creditBalance < amount) {
        return {
            canSpend: false,
            reason: 'insufficient_balance',
            details: {
                currentBalance: user.creditBalance,
                requiredAmount: amount,
                shortfall: amount - user.creditBalance
            }
        };
    }

    // Check daily limit
    if (user.creditSettings?.dailyLimit) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaySpent = await this.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
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
        ]);

        const dailySpent = todaySpent.length > 0 ? todaySpent[0].totalSpent : 0;
        if (dailySpent + amount > user.creditSettings.dailyLimit) {
            return {
                canSpend: false,
                reason: 'daily_limit_exceeded',
                details: {
                    dailyLimit: user.creditSettings.dailyLimit,
                    alreadySpentToday: dailySpent,
                    requestedAmount: amount,
                    remainingDailyLimit: user.creditSettings.dailyLimit - dailySpent
                }
            };
        }
    }

    // Check monthly limit
    if (user.creditSettings?.monthlyLimit) {
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        const nextMonth = new Date(thisMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const monthlySpent = await this.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
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
        ]);

        const monthlySpentAmount = monthlySpent.length > 0 ? monthlySpent[0].totalSpent : 0;
        if (monthlySpentAmount + amount > user.creditSettings.monthlyLimit) {
            return {
                canSpend: false,
                reason: 'monthly_limit_exceeded',
                details: {
                    monthlyLimit: user.creditSettings.monthlyLimit,
                    alreadySpentThisMonth: monthlySpentAmount,
                    requestedAmount: amount,
                    remainingMonthlyLimit: user.creditSettings.monthlyLimit - monthlySpentAmount
                }
            };
        }
    }

    return {
        canSpend: true,
        reason: 'approved',
        details: {
            currentBalance: user.creditBalance,
            balanceAfter: user.creditBalance - amount
        }
    };
};

// Enhanced debit method with limit checks
creditTransactionSchema.statics.createDebitWithLimits = async function({
    userId,
    serviceType,
    actionType,
    amount,
    description,
    metadata = {},
    relatedActivityId,
    apiEndpoint,
    httpMethod,
    responseStatus,
    openaiModel,
    tokensUsed,
    promptTokens,
    completionTokens,
    skipLimitCheck = false
}) {
    // Check spending limits unless explicitly skipped
    if (!skipLimitCheck) {
        const spendingCheck = await this.canUserSpend(userId, amount);
        if (!spendingCheck.canSpend) {
            const error = new Error(`Transaction denied: ${spendingCheck.reason}`);
            error.code = spendingCheck.reason;
            error.details = spendingCheck.details;
            throw error;
        }
    }

    // Proceed with original debit logic
    return this.createDebit({
        userId,
        serviceType,
        actionType,
        amount,
        description,
        metadata,
        relatedActivityId,
        apiEndpoint,
        httpMethod,
        responseStatus,
        openaiModel,
        tokensUsed,
        promptTokens,
        completionTokens
    });
};

export default mongoose.model('CreditTransaction', creditTransactionSchema, 'credit_transactions');
