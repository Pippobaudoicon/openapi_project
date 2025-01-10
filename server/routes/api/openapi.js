import express from 'express';
import axiosInstance from '../../utils/axiosCompanyOpenapi.js';
import fs from 'fs';
import { __dirname, path, dataCompaniesDir } from '../../utils/paths.js';

const router = express.Router();

//Check if a company is closed by PIVA
router.get('/v1/check-closed-company/:piva', (req, res) => {
    const piva = req.params.piva;
    axiosInstance.get(`/IT-closed/${piva}`)
        .then(response => res.json(response.data))
        .catch(error => res.json(error));
});

//Convert base64 to zip file
router.post('/v1/base64tozip', express.json({ limit: '10mb' }), (req, res) => {
    const base64 = req.body?.data?.file;
    const fileName = req.body?.data?.nome || 'default.zip';
    const zipFilePath = path.join(dataCompaniesDir, fileName);
    const zipOutput = fs.createWriteStream(zipFilePath);
    const buffer = Buffer.from(base64 || '', 'base64');
    zipOutput.write(buffer);
    zipOutput.end();
    zipOutput.on('finish', () => {
        res.json({ message: 'File saved successfully', path: zipFilePath });
    });
});

export default router;