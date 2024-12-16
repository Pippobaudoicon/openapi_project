import express from 'express';
import axiosInstance from '../../utils/axiosOpenapi.js';

const router = express.Router();

// Example route GET
router.get('/v1/check-closed-company/:piva', (req, res) => {
    const piva = req.params.piva;
    axiosInstance.get(`/IT-closed/${piva}`)
    .then(response => {
        res.json(response.data);
    })
    .catch(error => {
        res.json(error);
    });
});

export default router;