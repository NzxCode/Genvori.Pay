import 'dotenv/config';
import express from 'express';

import apiRoutes from './src/app.js'; 
import { supabase } from './src/config/supabase.js';

const app = express();
const PORT = process.env.PORT;
const GATEWAY_API_KEY = process.env.GATEWAY_API_KEY;

const allowedOrigins = [
  'http://localhost:5173',
  'https://genvori.tech'
];

app.use((req, res, next) => {
    res.removeHeader('Access-Control-Allow-Origin');
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use((req, res, next) => {
    console.log(`[EXPRESS] ${new Date().toISOString()} - ${req.method} ${req.url} dari ${req.headers.origin || 'No Origin'}`);
    next();
});

const apiKeyMiddleware = (req, res, next) => {
    if (req.method === 'OPTIONS' || req.url === '/favicon.ico' || req.url === '/' || req.url === '/api/health') {
        return next();
    }

    const userApiKey = req.headers['x-api-key'];

    if (!userApiKey || userApiKey !== GATEWAY_API_KEY) {
        console.log(`[EXPRESS] Akses Ditolak! API Key tidak valid/kosong.`);
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized: API Key diperlukan.' 
        });
    }
    next();
};

app.use(express.json());
app.use(apiKeyMiddleware);

app.use(apiRoutes);

app.listen(PORT, () => {
    console.log(`[SERVER] Gateway berjalan di port ${PORT}`);
});