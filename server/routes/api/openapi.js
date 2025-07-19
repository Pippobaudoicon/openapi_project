import express from 'express';
import { checkRole, checkPermission } from '../../middleware/roleAuth.js';
import { checkCache } from '../../middleware/cacheCheck.js';
import { axiosCompanyService, axiosOauthService, axiosVisureCameraliService } from '../../utils/axiosOpenapi.js';
import CompanySearch from '../../models/CompanySearch.js';
import VisureSearch from '../../models/VisureSearch.js';
import { 
    logActivity, 
    getITSearchDescription, 
    getCompanyDescription, 
    getVisureDescription,
    getBilancioDescription,
    getSearchMetadata,
    getCompanyMetadata,
    getVisureMetadata
} from '../../middleware/activityLogger.js';

const router = express.Router();

// COMPANY ROUTES

//get credit api
router.get('/credit', checkPermission('get_credit'), (req, res) => {
    axiosOauthService.get('/credit')
        .then(response => res.json(response.data))
        .catch(error => res.json(error.message));
});

// get advanced company data by piva
router.get('/IT-advanced/:piva', 
    checkPermission('advanced_search'),
    checkCache('company', 'advanced'),
    logActivity({type:'company_advanced', action:'get_advanced_data', getDescription:getCompanyDescription, getMetadata:getCompanyMetadata}),
    async (req, res) => {
        try {   
            const response = await axiosCompanyService.get(`/IT-advanced/${req.params.piva}`);
            const companyData = response.data.data[0];
            
            await CompanySearch.updateOne(
                { 
                    piva: req.params.piva,
                    searchType: 'advanced'
                },
                {
                    $set: {
                        data: companyData,
                        createdAt: new Date()
                    }
                },
                { upsert: true }
            );

            res.json({
                source: 'api',
                timestamp: new Date(),
                data: companyData,
                piva: req.params.piva,
                searchType: 'advanced'
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    }
);

// get full company data by piva
router.get('/IT-full/:piva', 
    checkPermission('full_search'),
    checkCache('company', 'full'),
    logActivity({type:'company_full', action:'get_full_data', getDescription:getCompanyDescription, getMetadata:getCompanyMetadata}),
    async (req, res) => {
        try {
            const response = await axiosCompanyService.get(`/IT-full/${req.params.piva}`);
            const companyData = response.data.data;
            await CompanySearch.updateOne(
                { 
                    piva: req.params.piva,
                    searchType: 'full'
                },
                {
                    $set: {
                        data: companyData,
                        createdAt: new Date()
                    }
                },
                { upsert: true }
            );

            res.json({
                source: 'api',
                timestamp: new Date(),
                data: companyData,
                piva: req.params.piva,
                searchType: 'full'
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    }
);

// get boolean if company is closed by piva
router.get('/IT-closed/:piva', 
    checkRole(['admin']),
    checkCache('company', 'closed'),
    logActivity({type:'company_status', action:'check_company_status', getDescription:getCompanyDescription, getMetadata:getCompanyMetadata}),
    async (req, res) => {
        try {
            const response = await axiosCompanyService.get(`/IT-closed/${req.params.piva}`);
            
            await CompanySearch.updateOne(
                { 
                    piva: req.params.piva,
                    searchType: 'closed'
                },
                {
                    $set: {
                        data: response.data.data[0],
                        createdAt: new Date()
                    }
                },
                { upsert: true }
            );

            res.json({
                source: 'api',
                timestamp: new Date(),
                data: response.data.data[0]
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    }
);

router.get('/IT-search',
    checkPermission('search_companies'),
    //TODO add cache check for search using searchKey
    logActivity({type:'company_search', action:'search_companies', getDescription:getITSearchDescription, getMetadata:getSearchMetadata}),
    async (req, res) => {
        try {
            const queryParams = {};
            /**
             * @property {string} dryRun - If true, the operation returns only the number of results without actual data and the cost.
             * @property {string} dataEnrichment - Data enrichment for the response, if it is not set the call will return only the ids (default:'name') ['start', 'advanced', 'pec', 'address', 'shareholders', 'name'].
             * @property {string} lat - Latitude coordinate for location-based queries.
             * @property {string} long - Longitude coordinate for location-based queries.
             * @property {string} radius - Radius (in kilometers) for location-based queries.
             * @property {string} companyName - Filters results by the name of the company only full words.
             * @property {string} autocomplete - is used to search for strings that begin with the specified query
             */
            const validParams = [
                'dryRun', 'dataEnrichment',
                'lat', 'long', 'radius',
                'companyName', 'autocomplete', 'province', 'townCode', 'atecoCode',
                'cciaa', 'reaCode', 'minTurnover', 'maxTurnover', 'minEmployees', 'maxEmployees',
                'sdiCode', 'legalFormCode', 'shareHolderTaxCode', 'activityStatus', 'pec',
                'creationTimestamp', 'lastUpdateTimestamp', 'skip', 'limit'
            ];

            if (!req.query.dataEnrichment) {
                queryParams.dataEnrichment = 'name';
            }

            // Only include provided parameters
            validParams.forEach(param => {
                if (req.query[param] !== undefined) {
                    queryParams[param] = req.query[param];
                }
            });

            // Make API call with query parameters
            const response = await axiosCompanyService.get('/IT-search', {
                params: queryParams
            });

            // Generate a unique key for this search based on parameters
            const searchKey = JSON.stringify(queryParams);

            // Store the search results
            await CompanySearch.updateOne(
                {
                    searchKey,
                    searchType: 'search'
                },
                {
                    $set: {
                        parameters: queryParams,
                        data: response.data.data,
                        createdAt: new Date()
                    }
                },
                { upsert: true }
            );

            res.json({
                source: 'api',
                timestamp: new Date(),
                data: response.data.data
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    }
);

// VISURE CAMERALI ROUTES

// get impresa data by piva
router.get('/impresa/:piva',
    checkRole(['admin']),
    checkCache('visure', 'impresa'),
    async (req, res) => {
        try {
            const response = await axiosVisureCameraliService.get(`/impresa/${req.params.piva}`);

            await CompanySearch.updateOne(
                { 
                    piva: req.params.piva,
                    searchType: 'impresa'
                },
                {
                    $set: {
                        data: response.data.data[0],
                        createdAt: new Date()
                    }
                },
                { upsert: true }
            );

            res.json({
                source: 'api',
                timestamp: new Date(),
                data: response.data.data[0]
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    }
)

// search companies by parameters
router.get('/impresa',
    checkRole(['admin']),
    checkCache('visure', 'search'),
    async (req, res) => {
        try {
            // Build query parameters object
            const queryParams = {};
            const validParams = [
                'denominazione', 'provincia', 'codice_ateco',
                'fatturato_min', 'fatturato_max', 'dipendenti_min',
                'dipendenti_max', 'skip', 'limit', 'lat', 'lng', 'radius'
            ];

            // Only include provided parameters
            validParams.forEach(param => {
                if (req.query[param] !== undefined) {
                    queryParams[param] = req.query[param];
                }
            });

            // Make API call with query parameters
            const response = await axiosVisureCameraliService.get('/impresa', {
                params: queryParams
            });

            // Generate a unique key for this search based on parameters
            const searchKey = JSON.stringify(queryParams);

            // Store the search results
            await VisureSearch.updateOne(
                {
                    searchKey,
                    searchType: 'search'
                },
                {
                    $set: {
                        parameters: queryParams,
                        data: response.data.data,
                        createdAt: new Date()
                    }
                },
                { upsert: true }
            );

            res.json({
                source: 'api',
                timestamp: new Date(),
                data: response.data.data
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    }
);

// post bilancio-ottico by piva
router.post('/bilancio-ottico',
    checkRole(['admin']),
    checkCache('visure', 'bilancio'),
    async (req, res) => {
        try {
            const data = {
                cf_piva_id: req.body.piva,
                callback: {
                    url: `${process.env.SERVER_URL}/api/v1/callback/visure`,
                    field: 'result',
                    method: 'POST',
                    data: {
                        modelSearch: 'VisureSearch',
                        searchType: 'bilancio',
                        piva: req.body.piva,
                        requestTime: new Date().toISOString()
                    }
                }
            }
            const response = await axiosVisureCameraliService.post('/bilancio-ottico', data);

            // Store the initial request with status "in progress"
            await VisureSearch.updateOne(
                { 
                    piva: req.body.piva,
                    searchType: 'bilancio'
                },
                {
                    $set: {
                        requestId: response.data.data.id,
                        status: 'pending',
                        createdAt: new Date(),
                        data: response.data.data
                    }
                },
                { upsert: true }
            );

            res.json({
                source: 'api',
                status: 'pending',
                timestamp: new Date(),
                data: response.data.data
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    }
);

// get check for bilancio-ottico by piva
router.get('/bilancio-ottico/:piva',
    checkRole(['admin']),
    checkCache('visure', 'bilancio', 'complete'),
    async (req, res) => {
        try {
            const search = await VisureSearch.findOne({
                piva: req.params.piva,
                searchType: 'bilancio'
            });
            
            if (!search) return res.status(404).json({ message: 'No data found' });

            const response = await axiosVisureCameraliService.get(`/bilancio-ottico/${search.data.id}`);

            // If status is complete, update the database
            if (response.data.data.stato_richiesta === 'Dati disponibili') {
                await VisureSearch.updateOne(
                    { 
                        piva: req.params.piva,
                        searchType: 'bilancio'
                    },
                    {
                        $set: {
                            status: 'complete',
                            data: response.data.data,
                            updatedAt: new Date()
                        }
                    }
                );
            }

            res.json({
                source: 'api',
                timestamp: new Date(),
                data: response.data.data
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    }
);

// get all bilancio-ottico requets status
router.get('/bilancio-ottico', 
    checkRole(['admin']),
    async (req, res) => {
        try {
            const response = await axiosVisureCameraliService.get('/bilancio-ottico');
            res.json(response.data);
        } catch (error) {
            res.status(500).json(error.message);
        }
    }
);

// get all visure from cache
router.get('/visure',
    checkRole(['admin']),
    async (req, res) => {
        try {
            const searches = await VisureSearch.find({
                searchType: { $ne: 'search' }
            }).sort({ createdAt: -1 });

            res.json({
                source: 'cache',
                timestamp: new Date(),
                data: searches
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    }
)

// download the zip file from the bilancio-ottico request
router.get('/bilancio-ottico/:id/allegati',
    checkRole(['admin']),
    async (req, res) => {
        try {
            const response = await axiosVisureCameraliService.get(`/bilancio-ottico/${req.params.id}/allegati`);
            console.log(response);
            const fileData = response.data.data;
            
            // Convert base64 to buffer
            const fileBuffer = Buffer.from(fileData.file, 'base64');
            
            // Set headers for file download
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${fileData.nome}"`);
            res.setHeader('Content-Length', fileData.dimensione);
            
            // Send the file
            res.send(fileBuffer);
        } catch (error) {
            res.status(500).json(error.message);
        }
    }
);

// elasticsearch search


import visureCallbacks from './callbacks/visure.js';
router.use('/callback', visureCallbacks);

export default router;