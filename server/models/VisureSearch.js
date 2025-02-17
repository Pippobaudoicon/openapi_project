import mongoose from 'mongoose';

const VisureSearchSchema = new mongoose.Schema({
    piva: {
        type: String,
        required: true,
        index: true
    },
    searchType: {
        type: String,
        enum: ['advanced', 'full', 'closed'],
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    requestId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d' // Automatically delete after 30 days
    }
});

export default mongoose.model('VisureSearch', VisureSearchSchema, 'visure_searches');