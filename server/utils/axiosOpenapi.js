import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const axiosCompanyService = axios.create({
    baseURL: process.env.OPENAPI_COMPANY_URL,
    headers: {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN_COMPANY}`
    }
});

const axiosVisureCameraliService = axios.create({
    baseURL: process.env.OPENAPI_VISURECAMERALI_URL,
    headers: {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN_VISURECAMERALI}`
    }
});

export { axiosCompanyService, axiosVisureCameraliService };