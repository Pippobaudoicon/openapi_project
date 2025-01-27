import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId
    },
    name: {
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
    verificationToken: String
}, { timestamps: true });

export default mongoose.model('User', userSchema);
