import fs from 'fs';

export const fileUtils = {
    // Generic base64 to buffer conversion
    base64ToBuffer: (base64String) => {
        return Buffer.from(base64String || '', 'base64');
    },

    // Generic file existence check
    fileExists: async (path) => {
        try {
            await fs.promises.access(path);
            return true;
        } catch {
            return false;
        }
    },

    // Generic file extension getter
    getFileExtension: (filename) => {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    }
};
