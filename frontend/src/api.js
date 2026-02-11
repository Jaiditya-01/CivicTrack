import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
};

export const complaintAPI = {
  createComplaint: (data) => apiClient.post('/complaints', data),
  getComplaints: (params) => apiClient.get('/complaints', { params }),
  getComplaint: (id) => apiClient.get(`/complaints/${id}`),
  updateStatus: (id, data) => apiClient.put(`/complaints/${id}/status`, data),
  rateComplaint: (id, data) => apiClient.put(`/complaints/${id}/rate`, data),
  getStats: () => apiClient.get('/complaints/stats/overview'),
  deleteComplaint: (id) => apiClient.delete(`/complaints/${id}`),
};

export default apiClient;
