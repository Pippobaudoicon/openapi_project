import { path, dataCompaniesDir } from '../utils/paths.js';
import { fileUtils } from '../utils/fileUtils.js';

export const fileService = {
    // Handling company zip files based on response data of OpenAPI Visure Camerali
    saveBase64AsZip: async (base64, fileName) => {
        const zipFilePath = path.join(dataCompaniesDir, fileName);
        
        // Using generic utility
        const buffer = fileUtils.base64ToBuffer(base64);
        
        // Business-specific validation
        if (fileUtils.getFileExtension(fileName) !== 'zip') {
            throw new Error('Only ZIP files are allowed');
        }

        return new Promise((resolve, reject) => {
            const zipOutput = fs.createWriteStream(zipFilePath);
            zipOutput.write(buffer);
            zipOutput.end();
            zipOutput.on('finish', () => resolve(zipFilePath));
            zipOutput.on('error', reject);
        });
    },

    // Company file validation if it exists in the data directory
    validateCompanyFile: async (fileName) => {
        const filePath = path.join(dataCompaniesDir, fileName);
        const exists = await fileUtils.fileExists(filePath);
        
        if (!exists) {
            throw new Error('Company file not found');
        }

        return true;
    }
};
