import mongoose from 'mongoose';
import '../config/env.js';
import connectDB from '../config/database.js';
import CompanySearch from '../models/CompanySearch.js';
import meilisearch from '../utils/meilisearch.js';

async function indexAllCompanies() {
    try {
        // Verify environment variables
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        if (!process.env.MEILISEARCH_URL) {
            throw new Error('MEILISEARCH_URL is not defined in environment variables');
        }

        // Connect to MongoDB
        await connectDB();
        console.log('Connected to MongoDB');

        // First, initialize the index with proper settings
        const index = meilisearch.index('companies');
        
        // Configure index settings before adding documents
        await index.updateSettings({
            searchableAttributes: [
                'denominazione',
                'indirizzo',
                'comune',
                'piva'
            ],
            filterableAttributes: [
                'provincia',
                'codice_ateco',
                'fatturato',
                'dipendenti'
            ],
            sortableAttributes: [
                'fatturato',
                'dipendenti',
                'createdAt'
            ]
        });

        console.log('Index settings updated');

        // Get all company searches that are either advanced or full
        const companies = await CompanySearch.find({
            searchType: { $in: ['advanced', 'full'] }
        });

        console.log(`Found ${companies.length} companies to index`);

        //TODO da mappare tutti i campi (profare gpt)
        const documents = companies.map(company => {
            const companyData = Array.isArray(company.data.data) ? company.data.data[0] : company.data.data;
            return {
            id: company._id.toString(),
            piva: company.piva,
            denominazione: companyData.companyName,
            indirizzo: {
                ...companyData.address,
                full: Object.values(companyData.address || {}).join(' ') // Searchable concatenated address
            },
            stato_attivita: companyData.activityStatus,
            data_registrazione: companyData.registrationDate,
            pec: companyData.pec,
            fatturato: {
                ...companyData.balanceSheets,
                full: JSON.stringify(companyData.balanceSheets) // Searchable JSON string
            },
            shareholders: {
                ...companyData.shareHolders,
                full: JSON.stringify(companyData.shareHolders) // Searchable JSON string
            },
            createdAt: company.createdAt.toISOString()
            };
        });

        // Delete existing documents
        await index.deleteAllDocuments();
        console.log('Existing documents deleted');

        // Batch index the documents
        const task = await index.addDocuments(documents);
        console.log('Indexing started with task ID:', task.taskUid);

        // Wait for the task to complete
        let status;
        do {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            status = await meilisearch.getTask(task.taskUid);
            console.log('Indexing status:', status.status);
        } while (status.status !== 'succeeded' && status.status !== 'failed');

        if (status.status === 'succeeded') {
            console.log('Indexing completed successfully!');
        } else {
            console.error('Indexing failed:', status.error);
        }

    } catch (error) {
        console.error('Error during indexing:', error);
    } finally {
        try {
            // Properly close MongoDB connection
            if (mongoose.connection.readyState === 1) {
                await mongoose.connection.close();
                console.log('MongoDB connection closed');
            }
        } catch (err) {
            console.error('Error closing MongoDB connection:', err);
        }
        process.exit();
    }
}

// Run the script
indexAllCompanies();
