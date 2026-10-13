import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — token automatic-a add pannum
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — 401 vandha logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API functions
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  profile: () => api.get('/auth/profile/'),
};

export const quizAPI = {
  getTests: () => api.get('/quiz/tests/'),
  getTestDetail: (id) => api.get(`/quiz/tests/${id}/`),
  submitTest: (id, data) => api.post(`/quiz/tests/${id}/submit/`, data),
  getResults: () => api.get('/quiz/results/'),
  getResultDetail: (id) => api.get(`/quiz/results/${id}/`),
  getWeakTopics: () => api.get('/quiz/weak-topics/'),
};