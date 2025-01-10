import express from 'express';
import axiosInstance from '../../utils/axiosCompanyOpenapi.js';
import fs from 'fs';
import { __dirname, path, dataCompaniesDir } from '../../utils/paths.js';

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

router.post('/v1/base64tozip', (req, res) => {
    console.log(req)
    const base64 = req.body.data.file;
    const zipFilePath = path.join(dataCompaniesDir, 'output.zip');
    const zipOutput = fs.createWriteStream(zipFilePath);
    const buffer = Buffer.from(base64, 'base64');
    console.log(buffer);
    zipOutput.write(buffer);
    zipOutput.end();
    zipOutput.on('finish', () => {
        res.json({ message: 'File saved successfully', path: zipFilePath });
    });
});

export default router;