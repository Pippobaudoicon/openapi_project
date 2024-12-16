import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const axiosInstance = axios.create({
    baseURL: process.env.OPENAPI_URL,
    headers: {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN_COMPANY}`
    }
});

export default axiosInstance;