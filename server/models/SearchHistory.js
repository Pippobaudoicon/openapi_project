import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    queryHash: {
        type: String,
        required: true,
        index: true
    },
    rawQuery: {
        type: String,
        required: true
    },
    parsedParams: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    interpretation: {
        type: String,
        default: ''
    },
    results: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },
    resultCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '7d'
    }
});

searchHistorySchema.index({ userId: 1, queryHash: 1 });

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
