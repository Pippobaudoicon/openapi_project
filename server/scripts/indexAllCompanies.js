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
        const documents = companies.map((company, index) => {
            try {
                // Handle different data structures
                let companyData = company.data;
                
                // If data has a nested data property, use it
                if (companyData.data) {
                    companyData = Array.isArray(companyData.data) ? companyData.data[0] : companyData.data;
                }

                // Create a safe mapping that handles missing fields
                const document = {
                    id: company._id.toString(),
                    piva: company.piva,
                    denominazione: companyData.companyName || 
                                 companyData.denominazione || 
                                 companyData.ragione_sociale || 
                                 companyData.nome || 
                                 'Unknown',
                    provincia: companyData.address?.registeredOffice?.province || 
                              companyData.provincia || 
                              companyData.province || '',
                    comune: companyData.address?.registeredOffice?.town || 
                           companyData.comune || 
                           companyData.city || '',
                    codice_ateco: companyData.atecoClassification?.ateco?.code || 
                                 companyData.codice_ateco || 
                                 companyData.atecoCode || '',
                    descrizione_ateco: companyData.atecoClassification?.ateco?.description || '',
                    fatturato: companyData.balanceSheets?.last?.turnover || 
                              companyData.fatturato || 
                              companyData.revenue || 0,
                    dipendenti: companyData.balanceSheets?.last?.employees || 
                               companyData.dipendenti || 
                               companyData.employees || 0,
                    indirizzo: companyData.address?.registeredOffice?.streetName || 
                              companyData.indirizzo || 
                              companyData.address || '',
                    cap: companyData.address?.registeredOffice?.zipCode || '',
                    stato_attivita: companyData.activityStatus || 
                                   companyData.stato_attivita || 
                                   companyData.stato || 'Unknown',
                    data_registrazione: companyData.registrationDate || 
                                       companyData.data_registrazione || '',
                    data_inizio: companyData.startDate || '',
                    pec: companyData.pec || '',
                    codice_fiscale: companyData.taxCode || '',
                    forma_giuridica: companyData.detailedLegalForm?.description || '',
                    capitale_sociale: companyData.balanceSheets?.last?.shareCapital || 0,
                    patrimonio_netto: companyData.balanceSheets?.last?.netWorth || 0,
                    searchType: company.searchType,
                    createdAt: company.createdAt.toISOString()
                };

                return document;
            } catch (error) {
                console.error(`Error processing company ${index} (${company.piva}):`, error);
                console.error('Company data:', JSON.stringify(company.data, null, 2));
                
                // Return a minimal document to avoid breaking the entire process
                return {
                    id: company._id.toString(),
                    piva: company.piva,
                    denominazione: 'Error processing data',
                    provincia: '',
                    comune: '',
                    codice_ateco: '',
                    fatturato: 0,
                    dipendenti: 0,
                    indirizzo: '',
                    stato_attivita: 'Unknown',
                    data_registrazione: '',
                    pec: '',
                    searchType: company.searchType,
                    createdAt: company.createdAt.toISOString()
                };
            }
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
