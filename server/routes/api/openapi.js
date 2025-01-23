import express from 'express';
import { axiosCompanyService, axiosOauthService } from '../../utils/axiosOpenapi.js';

const router = express.Router();

//get credit api
router.get('/credit', (req, res) => {
    axiosOauthService.get('/credit')
        .then(response => res.json(response.data))
        .catch(error => res.json(error.message));
});

//Check if a company is closed by PIVA
router.get('/check-closed-company/:piva', (req, res) => {
    const piva = req.params.piva;
    axiosCompanyService.get(`/IT-closed/${piva}`)
        .then(response => res.json(response.data))
        .catch(error => res.json(error.message));
});

export default router;