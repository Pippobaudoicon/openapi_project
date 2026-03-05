import mongoose from 'mongoose';

/**
 * User model — maps to the 'user' collection (Better Auth's collection).
 * Better Auth manages authentication fields (name, email, emailVerified, image).
 * Custom fields (role, credits, etc.) are added via Better Auth's additionalFields config.
 */
const userSchema = new mongoose.Schema({
    // Better Auth core fields
    name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: null
    },
    // Custom profile fields
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
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    creditBalance: {
        type: Number,
        default: 100,
        min: 0
    },
    creditLimit: {
        type: Number,
        default: 1000,
        min: 0
    },
    creditSettings: {
        dailyLimit: {
            type: Number,
            default: 50,
            min: 0
        },
        monthlyLimit: {
            type: Number,
            default: 500,
            min: 0
        },
        autoRecharge: {
            enabled: {
                type: Boolean,
                default: false
            },
            threshold: {
                type: Number,
                default: 10
            },
            amount: {
                type: Number,
                default: 100
            }
        }
    },
}, { timestamps: true });

// Point to Better Auth's 'user' collection instead of Mongoose default 'users'
export default mongoose.model('User', userSchema, 'user');
