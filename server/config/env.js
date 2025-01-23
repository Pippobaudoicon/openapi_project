import dotenv from 'dotenv';
import { path } from '../utils/paths.js';

const envPath = process.env.NODE_ENV === 'development' 
    ? path.resolve(process.cwd(), '.env.development')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });
console.log('Environment:', process.env.NODE_ENV);