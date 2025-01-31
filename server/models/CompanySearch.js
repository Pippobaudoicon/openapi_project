import mongoose from 'mongoose';

const CompanySearchSchema = new mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d' // Automatically delete after 1 year
    }
});

export default mongoose.model('CompanySearch', CompanySearchSchema, 'company_searches');
