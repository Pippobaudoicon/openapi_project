import fs from 'fs';
import express from 'express';
import openapiRoutes from './openapi.js';
import authRoutes from './auth.js';
import activityRoutes from './activities.js';
import companyRoutes from './company.js';

import { checkPermission, checkRole } from '../../middleware/roleAuth.js';
import { fileService } from '../../services/fileService.js';
import { path, dataCompaniesDir, companiesDir } from '../../utils/paths.js';

const router = express.Router();

// Mount all routes from openapi.js under /v1
router.use('/v1/auth', authRoutes);
router.use('/v1/activities', activityRoutes);
router.use('/v1', openapiRoutes);
router.use('/v1/company', companyRoutes);

//Convert base64 to zip file and saves it to disk
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

//Download a file from disk by name and extension (e.g. 'default.zip')
router.get('/v1/download/*', checkRole('admin'), async (req, res) => {
    try {
        //Extract the file name from the URL path (e.g. 'default.zip' or 'default/default2/default.pdf') 
        const file = req.params[0];
        await fileService.validateCompanyFile(file);
        const filePath = path.join(companiesDir, file);
        res.download(filePath, file);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

//DEBUGGING purposes only
router.get('/v1/test/:test', (req, res) => {
    const test = req.params.test;
    const test2 = `Basic ${Buffer.from(`${'info@interjob.it'}:${'4d8875edeb2554e01f3ccc083938cbb6'}`).toString('base64')}`;
    res.json({ test: test, test2: test2 });
});

export default router;
