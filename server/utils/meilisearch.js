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
            'comune',
            'provincia',
            'piva',
            'codice_ateco'
        ],
        filterableAttributes: [
            'provincia',
            'codice_ateco',
            'fatturato',
            'dipendenti',
            'createdAt',
            'searchType',
            'taxCode'
        ],
        sortableAttributes: [
            'fatturato',
            'dipendenti',
            'createdAt',
            'searchType',
            'taxCode'
        ]
    });
};

// Call this when your app starts
initializeIndex().catch(console.error);

export const indexCompany = async (company) => {
    try {
        const index = meilisearch.index('companies');
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
        const index = meilisearch.index('companies');
        
        // Build filter array
        const filters = [];
        if (provincia) filters.push(`provincia = "${provincia.toUpperCase()}"`);
        if (codice_ateco) filters.push(`codice_ateco = "${codice_ateco}"`);
        if (fatturato_min) filters.push(`fatturato >= ${fatturato_min}`);
        if (fatturato_max) filters.push(`fatturato <= ${fatturato_max}`);
        if (dipendenti_min) filters.push(`dipendenti >= ${dipendenti_min}`);
        if (dipendenti_max) filters.push(`dipendenti <= ${dipendenti_max}`);

        const searchOptions = {
            offset: parseInt(from),
            limit: parseInt(size)
        };

        if (filters.length > 0) {
            searchOptions.filter = filters.join(' AND ');
        }

        const results = await index.search(q, searchOptions);

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
