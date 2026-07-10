// src/services/api.ts
const BASE_URL = 'http://192.168.1.9:3000/api/v1';
const API_KEY = '';

async function request(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        ...options.headers,
    };

    console.log(`[API Request] ${options.method || 'GET'} -> ${url}`);
    console.log(`[API Headers]`, headers);

    const response = await fetch(url, {
        ...options,
        headers,
    });

    console.log(`[API Response] ${response.status} ${response.statusText} <- ${url}`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[API Error] ${response.status}:`, errorData);
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

export const authApi = {
    register: (data: any) => request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    verifyOtp: (data: any) => request('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    login: (data: any) => request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    logout: (token: string) => request('/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    }),
    forgotPassword: (data: any) => request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    verifyResetOtp: (data: any) => request('/auth/verify-reset-otp', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    resetPassword: (data: any) => request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    getProfile: (token: string) => request('/auth/profile', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    }),
    updateProfile: (token: string, data: any) => request('/auth/profile', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    }),
    setPin: (token: string, data: { pin: string }) => request('/auth/set-pin', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    }),
    loginPin: (data: { email: string, pin: string }) => request('/auth/login-pin', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

export const walletApi = {
    create: (token: string, data: any) => request('/wallets', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    }),
    getAll: (token: string) => request('/wallets', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    }),
    getDetail: (token: string, id: string) => request(`/wallets/${id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    }),
    getTransactions: (token: string, id: string, page = 1, limit = 10) => request(`/wallets/${id}/transactions?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    }),
    transfer: (token: string, data: any) => request('/wallets/transfer', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    }),
    topUp: (token: string, data: any) => request('/wallets/top-up', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    }),
    getHistory: (token: string, page = 1, limit = 20, type = '') => request(`/history?page=${page}&limit=${limit}${type ? `&type=${type}` : ''}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    }),
};

export const paymentApi = {
    charge: (token: string, data: any) => request('/payments/charge', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    }),
    getStatus: (token: string, id: string) => request(`/payments/${id}/status`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    }),
};

export const projectApi = {
    getAll: (token: string) => request('/projects', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    }),
    create: (token: string, data: any) => request('/projects', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    }),
    getById: (token: string, id: string) => request(`/projects/${id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    }),
    update: (token: string, id: string, data: any) => request(`/projects/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    }),
    remove: (token: string, id: string) => request(`/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    }),
    getBudget: (token: string, id: string) => request(`/projects/${id}/budget`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    }),
};

export const locationApi = {
    updateLocation: (token: string, data: { latitude: number, longitude: number, accuracy: number, address: string }) => request('/location/update', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    }),
};

export const notificationApi = {
    getNotifications: (token: string, page = 1, limit = 10, isRead = false) => request(`/notifications?page=${page}&limit=${limit}&is_read=${isRead}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    }),
    markAsRead: (token: string, notificationId: string) => request(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
    }),
};
