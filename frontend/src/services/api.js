import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
};

// ── Items ─────────────────────────────────────────────
export const itemsAPI = {
  reportLost: (formData) =>
    api.post('/items/lost', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  reportFound: (formData) =>
    api.post('/items/found', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  getLostItems: (params) => api.get('/items/lost', { params }),
  getFoundItems: (params) => api.get('/items/found', { params }),
  getLostItem: (id) => api.get(`/items/lost/${id}`),
  getFoundItem: (id) => api.get(`/items/found/${id}`),
  getMyItems: () => api.get('/items/my-items'),
  getCategories: () => api.get('/items/categories'),

  resolveLost: (id) => api.put(`/items/lost/${id}/resolve`),
  resolveFound: (id) => api.put(`/items/found/${id}/resolve`),

  getImageUrl: (filename) =>
    filename ? `${API_BASE}/items/images/${filename}` : null,
};

// ── Matches ───────────────────────────────────────────
export const matchesAPI = {
  getMyMatches: () => api.get('/matches/'),
  getAllMatches: (params) => api.get('/matches/all', { params }),
  getStats: () => api.get('/matches/stats'),
  claimMatch: (id) => api.post(`/matches/${id}/claim`),
};

// ── Admin ─────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getLostItems: () => api.get('/admin/items/lost'),
  getFoundItems: () => api.get('/admin/items/found'),
  deleteLostItem: (id) => api.delete(`/admin/items/lost/${id}`),
  deleteFoundItem: (id) => api.delete(`/admin/items/found/${id}`),
  getUsers: () => api.get('/admin/users'),
};

export default api;
