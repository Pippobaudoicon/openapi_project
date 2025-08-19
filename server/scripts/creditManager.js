import mongoose from 'mongoose';
import User from '../models/User.js';
import CreditTransaction from '../models/CreditTransaction.js';
import '../config/env.js'; // Load environment variables

// Connect to database
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// Add credits to a user
async function addCredits(userEmail, amount, description = 'Script credit addition') {
    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            throw new Error(`User with email ${userEmail} not found`);
        }

        const transaction = await CreditTransaction.createCredit({
            userId: user._id,
            amount: Math.abs(amount),
            description,
            metadata: {
                addedByScript: true,
                scriptTimestamp: new Date()
            },
            notes: 'Added via credit management script'
        });

        console.log(`✅ Added ${amount} credits to ${userEmail}`);
        console.log(`   Previous balance: ${transaction.balanceBefore}`);
        console.log(`   New balance: ${transaction.balanceAfter}`);
        console.log(`   Transaction ID: ${transaction._id}`);

        return transaction;
    } catch (error) {
        console.error(`❌ Error adding credits to ${userEmail}:`, error.message);
        throw error;
    }
}

// Set credit limits for a user
async function setCreditLimits(userEmail, { creditLimit, dailyLimit, monthlyLimit }) {
    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            throw new Error(`User with email ${userEmail} not found`);
        }

        const updateFields = {};
        if (creditLimit !== undefined) updateFields.creditLimit = creditLimit;
        if (dailyLimit !== undefined) updateFields['creditSettings.dailyLimit'] = dailyLimit;
        if (monthlyLimit !== undefined) updateFields['creditSettings.monthlyLimit'] = monthlyLimit;

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('email creditBalance creditLimit creditSettings');

        console.log(`✅ Updated credit limits for ${userEmail}`);
        console.log(`   Credit Limit: ${updatedUser.creditLimit}`);
        console.log(`   Daily Limit: ${updatedUser.creditSettings?.dailyLimit}`);
        console.log(`   Monthly Limit: ${updatedUser.creditSettings?.monthlyLimit}`);

        return updatedUser;
    } catch (error) {
        console.error(`❌ Error updating limits for ${userEmail}:`, error.message);
        throw error;
    }
}

// Get user credit information
async function getUserCredits(userEmail) {
    try {
        const user = await User.findOne({ email: userEmail })
            .select('email firstName lastName creditBalance creditLimit creditSettings');
        
        if (!user) {
            throw new Error(`User with email ${userEmail} not found`);
        }

        // Get recent transactions
        const recentTransactions = await CreditTransaction.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('transactionType amount description createdAt');

        // Get spending stats
        const stats = await CreditTransaction.getUserStats(user._id);

        console.log(`\n📊 Credit Information for ${userEmail}:`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Current Balance: ${user.creditBalance}`);
        console.log(`   Credit Limit: ${user.creditLimit}`);
        console.log(`   Daily Limit: ${user.creditSettings?.dailyLimit || 'Not set'}`);
        console.log(`   Monthly Limit: ${user.creditSettings?.monthlyLimit || 'Not set'}`);
        
        if (stats && stats.length > 0) {
            console.log(`   Total Spent: ${stats[0].totalSpent}`);
            console.log(`   Total Transactions: ${stats[0].totalTransactions}`);
        }

        console.log(`\n🔄 Recent Transactions:`);
        recentTransactions.forEach((tx, index) => {
            const type = tx.transactionType === 'debit' ? '🔴' : '🟢';
            const sign = tx.transactionType === 'debit' ? '-' : '+';
            console.log(`   ${index + 1}. ${type} ${sign}${tx.amount} - ${tx.description} (${tx.createdAt.toLocaleDateString()})`);
        });

        return { user, recentTransactions, stats: stats[0] };
    } catch (error) {
        console.error(`❌ Error getting user credits:`, error.message);
        throw error;
    }
}

// List all users with low credits
async function listLowCreditUsers(threshold = 10) {
    try {
        const users = await User.find({ 
            creditBalance: { $lte: threshold },
            isActive: true 
        }).select('email firstName lastName creditBalance creditLimit');

        console.log(`\n⚠️  Users with credits <= ${threshold}:`);
        users.forEach(user => {
            console.log(`   ${user.email} (${user.firstName} ${user.lastName}): ${user.creditBalance} credits`);
        });

        return users;
    } catch (error) {
        console.error('❌ Error listing low credit users:', error.message);
        throw error;
    }
}

// Bulk add credits to multiple users
async function bulkAddCredits(userEmails, amount, description = 'Bulk credit addition') {
    const results = [];
    
    for (const email of userEmails) {
        try {
            const transaction = await addCredits(email, amount, description);
            results.push({ email, success: true, transaction: transaction._id });
        } catch (error) {
            results.push({ email, success: false, error: error.message });
        }
    }

    console.log(`\n📋 Bulk Operation Results:`);
    results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`   ${status} ${result.email}: ${result.success ? 'Success' : result.error}`);
    });

    return results;
}

// Main function to handle command line arguments
async function main() {
    await connectDB();

    const command = process.argv[2];
    
    try {
        switch (command) {
            case 'add':
                const addEmail = process.argv[3];
                const addAmount = parseFloat(process.argv[4]);
                const addDesc = process.argv[5] || 'Script credit addition';
                
                if (!addEmail || !addAmount) {
                    console.log('Usage: npm run script:credits add <email> <amount> [description]');
                    process.exit(1);
                }
                
                await addCredits(addEmail, addAmount, addDesc);
                break;
                
            case 'info':
                const infoEmail = process.argv[3];
                
                if (!infoEmail) {
                    console.log('Usage: npm run script:credits info <email>');
                    process.exit(1);
                }
                
                await getUserCredits(infoEmail);
                break;
                
            case 'limits':
                const limitsEmail = process.argv[3];
                const creditLimit = process.argv[4] ? parseFloat(process.argv[4]) : undefined;
                const dailyLimit = process.argv[5] ? parseFloat(process.argv[5]) : undefined;
                const monthlyLimit = process.argv[6] ? parseFloat(process.argv[6]) : undefined;
                
                if (!limitsEmail) {
                    console.log('Usage: npm run script:credits limits <email> [creditLimit] [dailyLimit] [monthlyLimit]');
                    process.exit(1);
                }
                
                await setCreditLimits(limitsEmail, { creditLimit, dailyLimit, monthlyLimit });
                break;
                
            case 'low':
                const threshold = process.argv[3] ? parseFloat(process.argv[3]) : 10;
                await listLowCreditUsers(threshold);
                break;
                
            case 'bulk':
                const emails = process.argv[3] ? process.argv[3].split(',') : [];
                const bulkAmount = parseFloat(process.argv[4]);
                const bulkDesc = process.argv[5] || 'Bulk credit addition';
                
                if (emails.length === 0 || !bulkAmount) {
                    console.log('Usage: npm run script:credits bulk <email1,email2,email3> <amount> [description]');
                    process.exit(1);
                }
                
                await bulkAddCredits(emails, bulkAmount, bulkDesc);
                break;
                
            default:
                console.log('Credit Management Script');
                console.log('');
                console.log('Available commands:');
                console.log('  add <email> <amount> [description]     - Add credits to a user');
                console.log('  info <email>                          - Get user credit information');
                console.log('  limits <email> [credit] [daily] [monthly] - Set credit limits');
                console.log('  low [threshold]                       - List users with low credits');
                console.log('  bulk <emails> <amount> [description]  - Bulk add credits to multiple users');
                console.log('');
                console.log('Examples:');
                console.log('  npm run script:credits add user@example.com 100');
                console.log('  npm run script:credits info user@example.com');
                console.log('  npm run script:credits limits user@example.com 1000 50 500');
                console.log('  npm run script:credits low 20');
                console.log('  npm run script:credits bulk user1@example.com,user2@example.com 50');
        }
    } catch (error) {
        console.error('Script error:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

import { fileURLToPath } from 'url';
import path from 'path';

// Run the script
const scriptPath = path.resolve(process.argv[1]);
const metaPath = path.resolve(fileURLToPath(import.meta.url));
if (metaPath === scriptPath) {
    main();
}

export {
    addCredits,
    setCreditLimits,
    getUserCredits,
    listLowCreditUsers,
    bulkAddCredits
};
