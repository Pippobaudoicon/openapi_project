import express from 'express';
import { checkRole, checkPermission } from '../../middleware/roleAuth.js';
import { checkCache } from '../../middleware/cacheCheck.js';
import { axiosCompanyService, axiosOauthService } from '../../utils/axiosOpenapi.js';
import CompanySearch from '../../models/CompanySearch.js';

const router = express.Router();

//get credit api
router.get('/credit', checkPermission('get_credit'), (req, res) => {
    axiosOauthService.get('/credit')
        .then(response => res.json(response.data))
        .catch(error => res.json(error.message));
});

// get advanced company data by piva
router.get('/IT-advanced/:piva', 
    checkPermission('advanced_search'),
    checkCache('advanced'),
    async (req, res) => {
        try {   
            const response = await axiosCompanyService.get(`/IT-advanced/${req.params.piva}`);
            
            await CompanySearch.updateOne(
                { 
                    piva: req.params.piva,
                    searchType: 'advanced'
                },
                {
                    $set: {
                        data: response.data,
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

// get full company data by piva
router.get('/IT-full/:piva', 
    checkPermission('full_search'),
    checkCache('full'),
    async (req, res) => {
        try {
            const response = await axiosCompanyService.get(`/IT-full/${req.params.piva}`);

            await CompanySearch.updateOne(
                { 
                    piva: req.params.piva,
                    searchType: 'full'
                },
                {
                    $set: {
                        data: response.data,
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

// get boolean if company is closed by piva
router.get('/IT-closed/:piva', 
    checkRole(['admin']),
    checkCache('closed'),
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
                        data: response.data,
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

export default router;