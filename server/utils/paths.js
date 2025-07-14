import { fileURLToPath } from 'url';
import path from 'path';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
export { path };
/**
 * Full path to the root directory
*/
export const rootDir = path.resolve(__dirname, '../..');
/**
 * Full path to the client directory
*/
export const clientDir = path.resolve(rootDir, 'modern-client');
/**
 * Full path to the dist directory of the client
*/
export const distDir = path.resolve(clientDir, 'dist');
/**
 * Full path to the public directory of the client
*/
export const publicDir = path.resolve(clientDir, 'public');
/**
 * Full path to the server directory
*/
export const serverDir = path.resolve(rootDir, 'server');
/**
 * Full path to the logs directory of the server
*/
export const logsDir = path.resolve(serverDir, 'logs');
/**
 * Absolute path to the companies directory within the server
*/
export const companiesDir = path.resolve(serverDir, 'companies');
/**
 * Path to the directory containing company data files
*/
export const dataCompaniesDir = path.resolve(companiesDir, 'data');