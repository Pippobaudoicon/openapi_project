import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId
    },
    firstName: {
        type: String,
        required: false,
        trim: true
    },
    lastName: {
        type: String,
        required: false,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    company: {
        type: String,
        required: false,
        trim: true
    },
    phone: {
        type: String,
        required: false,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: { 
        type: Boolean, 
        default: false 
    },
    creditBalance: {
        type: Number,
        default: 100, // Default starting credits
        min: 0
    },
    creditLimit: {
        type: Number,
        default: 1000, // Default credit limit
        min: 0
    },
    // Credit system settings
    creditSettings: {
        dailyLimit: {
            type: Number,
            default: 50, // Daily spending limit
            min: 0
        },
        monthlyLimit: {
            type: Number,
            default: 500, // Monthly spending limit
            min: 0
        },
        autoRecharge: {
            enabled: {
                type: Boolean,
                default: false
            },
            threshold: {
                type: Number,
                default: 10 // Recharge when balance goes below this
            },
            amount: {
                type: Number,
                default: 100 // Amount to recharge
            }
        }
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, { timestamps: true });

export default mongoose.model('User', userSchema);
