import '../config/env.js';
import axios from 'axios';

const axiosCompanyService = axios.create({
    baseURL: process.env.OPENAPI_COMPANY_URL,
    headers: {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN_COMPANY}`
    }
});

const axiosVisureCameraliService = axios.create({
    method: 'POST',
    baseURL: process.env.OPENAPI_VISURECAMERALI_URL,
    headers: {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN_VISURECAMERALI}`
    }
});

const axiosOauthService = axios.create({
    baseURL: process.env.OPENAPI_OAUTH_URL,
    headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.OAUTH_USERNAME}:${process.env.ACCESS_TOKEN_APIKEY}`).toString('base64')}`
    }
});

export { axiosCompanyService, axiosVisureCameraliService, axiosOauthService };