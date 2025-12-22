import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

export const getNode = async () => {
    const response = await api.get('/node');
    return response.data;
};

export const getMap = async () => {
    const response = await api.get('/map');
    return response.data;
};

export const submitAnswer = async (payload) => {
    // payload: { quiz_index: number } or { code: string }
    const response = await api.post('/submit', payload);
    return response.data;
};

export default api;
