import express from 'express';
import { checkRole, checkPermission } from '../../middleware/roleAuth.js';
import { checkCache } from '../../middleware/cacheCheck.js';
import { searchCompanies } from '../../utils/meilisearch.js';
import { getLLMOverview, stripCompanyData } from '../../services/openaiService.js';
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
    checkCache('company', ['full', 'advanced', 'closed']),
    logActivity({type:'company_basic', action:'get_basic_data', getDescription:getCompanyDescription, getMetadata:getCompanyMetadata}),
);

//TODO snellire il return se passato parametro get così da non ricevere 100kb di data quando me ne servono solo 2kb ad esempio
// Get all stored companies from MongoDB
router.get('/stored',
    checkPermission('company_details'),
    async (req, res) => {
        try {
            const { format } = req.query;
            const records = await CompanySearch.find({
                searchType: { $in: ["full", "advanced", "closed"] }
            });

            if (format === 'slim') {
                const slimRecords = records.map(rec => {

                    return {
                        searchType: rec.searchType,
                        piva: rec.piva,
                        data: {
                            companyName: rec.data?.companyName
                                ?? rec.data?.companyDetails?.companyName
                                ?? rec.piva,
                            town: rec.data?.address?.registeredOffice?.town
                                ?? rec.data?.address?.town,
                            province: rec.data?.address?.registeredOffice?.province
                                ?? rec.data?.address?.province?.code,
                            activityStatus: rec.data?.companyStatus?.activityStatus?.code
                                ?? rec.data?.activityStatus,
                            registrationDate: (rec.data?.registrationDate
                                ?? rec.data?.companyDates?.registrationDate)?.split('T')[0],
                            taxCodeCeased: rec.data?.taxCodeCeased
                        }

                    };
                });

                return res.json({ data: slimRecords });
            }

            res.json({ data: records });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
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
            if (companyRecord.llmOverview) {
                return res.json({ overview: companyRecord.llmOverview });
            }
            const slimCompanyRecord = stripCompanyData(companyRecord.data);
            const overview = await getLLMOverview(slimCompanyRecord);

            // Save the LLM overview to the database
            companyRecord.llmOverview = overview;
            await companyRecord.save();

            res.json({ overview });
        } catch (error) {
            console.error('Error fetching LLM overview:', error);
            res.status(500).json({ error: 'Failed to fetch LLM overview.' });
        }
    }
);

export default router;