import express from 'express';
import { checkRole, checkPermission } from '../../middleware/roleAuth.js';
import { checkCache } from '../../middleware/cacheCheck.js';
import { searchCompanies } from '../../utils/meilisearch.js';
import { getLLMOverview } from '../../services/gpt.js';
import { 
    logActivity, 
    getSearchDescription, 
    getCompanyDescription, 
    getSearchMetadata,
    getCompanyMetadata,
} from '../../middleware/activityLogger.js';
import CompanySearch from '../../models/CompanySearch.js';

const router = express.Router();


router.get('/search', 
    checkPermission('search'),
    logActivity({type:'search', action:'company_search', getDescription:getSearchDescription, getMetadata:getSearchMetadata}),
    async (req, res) => {
        try {
            const {
                q = '', // general search query
                provincia,
                codice_ateco,
                fatturato_min,
                fatturato_max,
                dipendenti_min,
                dipendenti_max,
                from = 0,
                size = 10
            } = req.query;

            const searchParams = {
                q,
                provincia,
                codice_ateco,
                fatturato_min,
                fatturato_max,
                dipendenti_min,
                dipendenti_max,
                from: parseInt(from),
                size: parseInt(size)
            };

            const results = await searchCompanies(searchParams);
            res.json(results);
        } catch (error) {
            res.status(500).json(error.message);
        }
    }
);


router.get('/:piva',
    checkPermission('company_details'),
    checkCache('company', ['advanced', 'full']),
    logActivity({type:'company_basic', action:'get_basic_data', getDescription:getCompanyDescription, getMetadata:getCompanyMetadata}),
);

router.get('/llm-overview/:piva',
    checkPermission('company_llm_overview'),
    logActivity({type:'company_overview', action:'get_overview_data', getDescription:getCompanyDescription, getMetadata:getCompanyMetadata}),
    async (req, res) => {
        try {
            const { piva } = req.params;

            const companyRecord = await CompanySearch.fetchByPivaFull(piva);
            if (!companyRecord) {
                return res.status(404).json({ error: 'Company data not found in database.' });
            }

            // Send data to LLM and get the overview
            const overview = await getLLMOverview(companyRecord.data);

            // Return the overview
            res.json({ overview });
        } catch (error) {
            console.error('Error fetching LLM overview:', error);
            res.status(500).json({ error: 'Failed to fetch LLM overview.' });
        }
    }
);

export default router;