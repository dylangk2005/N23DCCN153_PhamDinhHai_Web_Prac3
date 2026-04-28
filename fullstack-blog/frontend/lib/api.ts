import axios from 'axios';

const api = axios.create({
    baseURL: '', // để trống vì đã có proxy
    headers: { 'Content-Type': 'application/json' },
});

export default api;