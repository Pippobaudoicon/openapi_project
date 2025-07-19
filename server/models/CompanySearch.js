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
        enum: ['advanced', 'full', 'closed', 'search'],
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    // For search-type caching
    searchKey: {
        type: String,
        index: true,
        required: function() { return this.searchType === 'search'; }
    },
    parameters: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    llmOverview: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d' // Automatically delete after 30 days
    }
});

//TODO SAVE FOR searchType 'full' different response payload
// Middleware to handle indexing after save
CompanySearchSchema.post('save', async function(doc) {
    if (doc.data && (doc.searchType === 'advanced')) {
        try {
            const index = meilisearch.index('companies');

            let companyData = doc.data;
            if (companyData.data) {
                companyData = Array.isArray(companyData.data) ? companyData.data[0] : companyData.data;
            }

            //TODO Improve this mapping to handle different structures
            const document = {
                id: doc._id.toString(),
                piva: doc.piva,
                denominazione: companyData.companyName ||
                    companyData.denominazione ||
                    companyData.ragione_sociale ||
                    companyData.nome ||
                    'Unknown',
                provincia: companyData.address?.registeredOffice?.province ||
                    companyData.provincia ||
                    companyData.province ||
                    '',
                comune: companyData.address?.registeredOffice?.town ||
                    companyData.comune ||
                    companyData.city ||
                    '',
                codice_ateco: companyData.atecoClassification?.ateco?.code ||
                    companyData.codice_ateco ||
                    companyData.atecoCode ||
                    '',
                descrizione_ateco: companyData.atecoClassification?.ateco?.description || '',
                fatturato: companyData.balanceSheets?.last?.turnover ||
                    companyData.fatturato ||
                    companyData.revenue ||
                    0,
                dipendenti: companyData.balanceSheets?.last?.employees ||
                    companyData.dipendenti ||
                    companyData.employees ||
                    0,
                indirizzo: companyData.address?.registeredOffice?.streetName ||
                    companyData.indirizzo ||
                    companyData.address ||
                    '',
                cap: companyData.address?.registeredOffice?.zipCode || '',
                stato_attivita: companyData.activityStatus ||
                    companyData.stato_attivita ||
                    companyData.stato ||
                    'Unknown',
                data_registrazione: companyData.registrationDate ||
                    companyData.data_registrazione ||
                    '',
                data_inizio: companyData.startDate || '',
                pec: companyData.pec || '',
                codice_fiscale: companyData.taxCode || '',
                forma_giuridica: companyData.detailedLegalForm?.description || '',
                capitale_sociale: companyData.balanceSheets?.last?.shareCapital || 0,
                patrimonio_netto: companyData.balanceSheets?.last?.netWorth || 0,
                searchType: doc.searchType,
                createdAt: doc.createdAt.toISOString()
            };

            await index.addDocuments([document]);
        } catch (error) {
            console.error('Error indexing company:', error);
        }
    }
});

// Middleware to handle indexing after update
CompanySearchSchema.post('updateOne', async function() {
    try {
        const query = this.getQuery();
        const doc = await this.model.findOne(query);

        if (doc && doc.data && (doc.searchType === 'advanced' || doc.searchType === 'full')) {
            const index = meilisearch.index('companies');
            await index.addDocuments([{
                id: doc._id.toString(),
                ...doc.data
            }]);
        }
    } catch (error) {
        console.error('Error indexing company after update:', error);
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

export default mongoose.model('CompanySearch', CompanySearchSchema, 'company_searches');
