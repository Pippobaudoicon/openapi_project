import mongoose from 'mongoose';
import meilisearch from '../utils/meilisearch.js';

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
        expires: '30d' // Automatically delete after 30 days
    }
});

// Middleware to handle indexing after save
CompanySearchSchema.post('save', async function(doc) {
    if (doc.data && (doc.searchType === 'advanced' || doc.searchType === 'full')) {
        try {
            const index = meilisearch.index('companies');
            await index.addDocuments([{
                id: doc._id.toString(),
                ...doc.data
            }]);
        } catch (error) {
            console.error('Error indexing company:', error);
        }
    }
});

// Middleware to handle indexing after update
CompanySearchSchema.post('updateOne', async function(doc) {
    if (doc.data && (doc.searchType === 'advanced' || doc.searchType === 'full')) {
        try {
            const index = meilisearch.index('companies');
            await index.addDocuments([{
                id: doc._id.toString(),
                ...doc.data
            }]);
        } catch (error) {
            console.error('Error indexing company:', error);
        }
    }
});

// Static method to fetch a full record, cached by PIVA
CompanySearchSchema.statics.fetchByPivaFull = async function(piva) {
    try {
        const record = await this.findOne({ piva, searchType: 'full' });
        return record;
    } catch (error) {
        console.error('Error fetching company record by PIVA:', error);
        throw new Error('Failed to fetch company record.');
    }
};

// Static method to fetch an advanced record, cached by PIVA
CompanySearchSchema.statics.fetchByPivaAdvanced = async function(piva) {
    try {
        const record = await this.findOne({ piva, searchType: 'advanced' });
        return record;
    } catch (error) {
        console.error('Error fetching company record by PIVA:', error);
        throw new Error('Failed to fetch company record.');
    }
};

export default mongoose.model('CompanySearch', CompanySearchSchema, 'company_searches');
