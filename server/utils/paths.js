import { fileURLToPath } from 'url';
import path from 'path';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
export { path };
export const rootDir = path.resolve(__dirname, '../..');
export const clientDir = path.resolve(rootDir, 'client');
export const distDir = path.resolve(clientDir, 'dist');
export const publicDir = path.resolve(clientDir, 'public');
export const serverDir = path.resolve(rootDir, 'server');
export const dataCompaniesDir = path.resolve(serverDir, 'companies/data');