import axios from 'axios';
// In dev we prefer to hit the Vite dev server proxy (no cross-origin). If VITE_API_BASE
// is set (for production or custom dev setups) we'll use it, otherwise default to ''
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE || '', withCredentials: true });
export async function analyze({ response_text, optional_context = [] }) {
    const { data } = await api.post('/api/thi', { response_text, optional_context });
    return data;
}