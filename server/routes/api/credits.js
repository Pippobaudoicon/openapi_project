import express from 'express';
import User from '../../models/User.js';
import CreditTransaction from '../../models/CreditTransaction.js';
import { checkPermission } from '../../middleware/roleAuth.js';
import { logActivity } from '../../middleware/activityLogger.js';
import { getUserCreditInfo } from '../../middleware/creditTracker.js';

const router = express.Router();

// Get user's credit information
router.get('/balance', checkPermission('user'), async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const creditInfo = await getUserCreditInfo(userId);
        
        res.json({
            success: true,
            ...creditInfo
        });
    } catch (error) {
        console.error('Error getting credit info:', error);
        res.status(500).json({ error: 'Failed to retrieve credit information' });
    }
});

// Get user's credit transaction history
router.get('/transactions', checkPermission('user'), async (req, res) => {
    try {
        const { page = 1, limit = 20, type, startDate, endDate } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        const query = { userId: req.user._id };
        
        if (type) {
            query.transactionType = type;
        }
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const transactions = await CreditTransaction.find(query)
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate('processedBy', 'firstName lastName email');

        const total = await CreditTransaction.countDocuments(query);

        res.json({
            transactions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's credit usage statistics
router.get('/stats', checkPermission('user'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const stats = await CreditTransaction.getUserStats(req.user._id, startDate, endDate);
        
        res.json(stats.length > 0 ? stats[0] : {
            totalSpent: 0,
            totalTransactions: 0,
            serviceBreakdown: []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user's credit settings (self-service)
router.put('/settings', checkPermission('user'), async (req, res) => {
    try {
        const { dailyLimit, monthlyLimit, autoRecharge } = req.body;
        
        const updateFields = {};
        if (dailyLimit !== undefined) updateFields['creditSettings.dailyLimit'] = Math.max(0, dailyLimit);
        if (monthlyLimit !== undefined) updateFields['creditSettings.monthlyLimit'] = Math.max(0, monthlyLimit);
        if (autoRecharge !== undefined) updateFields['creditSettings.autoRecharge'] = autoRecharge;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('creditSettings');

        await logActivity(req, 'credit_settings_update', 'User updated credit settings', {
            newSettings: updateFields
        });

        res.json({
            message: 'Credit settings updated successfully',
            settings: user.creditSettings
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin routes
// Add credits to a user (admin only)
router.post('/add', checkPermission('admin'), async (req, res) => {
    try {
        const { userId, amount, description, notes } = req.body;

        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({ 
                error: 'Valid userId and positive amount are required' 
            });
        }

        const transaction = await CreditTransaction.createCredit({
            userId,
            amount: Math.abs(amount), // Ensure positive
            description: description || `Credits added by admin`,
            metadata: {
                addedByAdmin: true,
                adminId: req.user._id
            },
            processedBy: req.user._id,
            notes: notes || ''
        });

        await logActivity(req, 'credit_add', `Added ${amount} credits to user`, {
            targetUserId: userId,
            amount,
            transactionId: transaction._id
        });

        res.json({
            message: 'Credits added successfully',
            transaction,
            newBalance: transaction.balanceAfter
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deduct credits from a user (admin only)
router.post('/deduct', checkPermission('admin'), async (req, res) => {
    try {
        const { userId, amount, description, notes } = req.body;

        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({ 
                error: 'Valid userId and positive amount are required' 
            });
        }

        const transaction = await CreditTransaction.createDebit({
            userId,
            serviceType: 'manual',
            actionType: 'admin_deduct',
            amount: Math.abs(amount), // Ensure positive
            description: description || `Credits deducted by admin`,
            metadata: {
                deductedByAdmin: true,
                adminId: req.user._id,
                notes: notes || ''
            }
        });

        await logActivity(req, 'credit_deduct', `Deducted ${amount} credits from user`, {
            targetUserId: userId,
            amount,
            transactionId: transaction._id
        });

        res.json({
            message: 'Credits deducted successfully',
            transaction,
            newBalance: transaction.balanceAfter
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Set user credit limit (admin only)
router.put('/limit/:userId', checkPermission('admin'), async (req, res) => {
    try {
        const { userId } = req.params;
        const { creditLimit } = req.body;

        if (creditLimit < 0) {
            return res.status(400).json({ error: 'Credit limit cannot be negative' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { creditLimit: creditLimit },
            { new: true, runValidators: true }
        ).select('firstName lastName email creditBalance creditLimit');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await logActivity(req, 'credit_limit_update', `Updated credit limit for user`, {
            targetUserId: userId,
            newLimit: creditLimit,
            previousLimit: user.creditLimit
        });

        res.json({
            message: 'Credit limit updated successfully',
            user: {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                creditBalance: user.creditBalance,
                creditLimit: user.creditLimit
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all users with credit information (admin only)
router.get('/users', checkPermission('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const skip = (page - 1) * limit;

        // Build query for search
        let query = {};
        if (search) {
            query = {
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { company: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const users = await User.find(query)
            .select('firstName lastName email company creditBalance creditLimit creditSettings createdAt isActive')
            .sort(sort)
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        // Get recent transactions for each user
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const recentTransactions = await CreditTransaction.find({ userId: user._id })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('transactionType amount createdAt description');

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const monthlySpending = await CreditTransaction.aggregate([
                {
                    $match: {
                        userId: user._id,
                        transactionType: 'debit',
                        createdAt: { $gte: thirtyDaysAgo }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSpent: { $sum: '$amount' }
                    }
                }
            ]);

            return {
                ...user.toObject(),
                monthlySpending: monthlySpending.length > 0 ? monthlySpending[0].totalSpent : 0,
                recentTransactions
            };
        }));

        res.json({
            users: usersWithStats,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bulk credit operations (admin only)
router.post('/bulk', checkPermission('admin'), async (req, res) => {
    try {
        const { operation, users, amount, description } = req.body;

        if (!operation || !users || !Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ 
                error: 'Operation, users array, and amount are required' 
            });
        }

        if (!['add', 'deduct'].includes(operation)) {
            return res.status(400).json({ 
                error: 'Operation must be either "add" or "deduct"' 
            });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid positive amount is required' });
        }

        const results = [];
        const errors = [];

        for (const userId of users) {
            try {
                let transaction;
                if (operation === 'add') {
                    transaction = await CreditTransaction.createCredit({
                        userId,
                        amount: Math.abs(amount),
                        description: description || `Bulk credit addition by admin`,
                        metadata: {
                            bulkOperation: true,
                            adminId: req.user._id
                        },
                        processedBy: req.user._id
                    });
                } else {
                    transaction = await CreditTransaction.createDebit({
                        userId,
                        serviceType: 'manual',
                        actionType: 'admin_bulk_deduct',
                        amount: Math.abs(amount),
                        description: description || `Bulk credit deduction by admin`,
                        metadata: {
                            bulkOperation: true,
                            adminId: req.user._id
                        }
                    });
                }

                results.push({
                    userId,
                    success: true,
                    transaction: transaction._id,
                    newBalance: transaction.balanceAfter
                });
            } catch (error) {
                errors.push({
                    userId,
                    success: false,
                    error: error.message
                });
            }
        }

        await logActivity(req, 'credit_bulk_operation', `Bulk ${operation} operation completed`, {
            operation,
            amount,
            usersCount: users.length,
            successCount: results.length,
            errorCount: errors.length
        });

        res.json({
            message: `Bulk ${operation} operation completed`,
            results,
            errors,
            summary: {
                total: users.length,
                successful: results.length,
                failed: errors.length
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
