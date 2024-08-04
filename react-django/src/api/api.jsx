// src/services/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api', // Update this URL to match your backend URL
});

export default axiosInstance;