import { MeiliSearch } from 'meilisearch';

const meilisearch = new MeiliSearch({
    host: process.env.MEILISEARCH_URL || 'http://localhost:7700',
    apiKey: process.env.MEILI_MASTER_KEY || ''
});

// Initialize the companies index with proper settings
const initializeIndex = async () => {
    const index = meilisearch.index('companies');
    
    await index.updateSettings({
        searchableAttributes: [
            'denominazione',
            'indirizzo',
            'comune'
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
};

// Call this when your app starts
initializeIndex().catch(console.error);

export const indexCompany = async (company) => {
    try {
        const index = client.index('companies');
        await index.addDocuments([{
            id: company.piva,
            piva: company.piva,
            denominazione: company.denominazione,
            provincia: company.provincia,
            comune: company.comune,
            indirizzo: company.indirizzo,
            codice_ateco: company.codice_ateco,
            fatturato: company.fatturato,
            dipendenti: company.dipendenti,
            createdAt: new Date().toISOString()
        }]);
    } catch (error) {
        console.error('Meilisearch indexing error:', error);
    }
};

export const searchCompanies = async ({
    q = '',
    provincia,
    codice_ateco,
    fatturato_min,
    fatturato_max,
    dipendenti_min,
    dipendenti_max,
    from = 0,
    size = 10
}) => {
    try {
        const index = client.index('companies');
        
        // Build filter string
        const filters = [];
        if (provincia) filters.push(`provincia = ${provincia.toUpperCase()}`);
        if (codice_ateco) filters.push(`codice_ateco = ${codice_ateco}`);
        if (fatturato_min || fatturato_max) {
            filters.push(`fatturato ${fatturato_min ? `>= ${fatturato_min}` : ''} ${fatturato_max ? `AND fatturato <= ${fatturato_max}` : ''}`);
        }
        if (dipendenti_min || dipendenti_max) {
            filters.push(`dipendenti ${dipendenti_min ? `>= ${dipendenti_min}` : ''} ${dipendenti_max ? `AND dipendenti <= ${dipendenti_max}` : ''}`);
        }

        const results = await index.search(q, {
            filter: filters,
            offset: parseInt(from),
            limit: parseInt(size)
        });

        return {
            total: results.estimatedTotalHits,
            hits: results.hits
        };
    } catch (error) {
        console.error('Meilisearch search error:', error);
        return { total: 0, hits: [] };
    }
};

export default meilisearch;
