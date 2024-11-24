import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-url.com/api'  // Replace with your deployed backend URL
  : 'http://localhost:5001/api';

const api = axios.create({
  baseURL,
  withCredentials: true
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const auth = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getCurrentUser: () => api.get('/auth/me')
};

// Groups API
export const groups = {
  create: (data: { name: string }) =>
    api.post('/groups', data),
  
  getAll: () => api.get('/groups'),
  
  addMember: (groupId: string, data: { email: string }) =>
    api.post(`/groups/${groupId}/members`, data)
};

// Expenses API
export const expenses = {
  create: (data: {
    description: string;
    amount: number;
    date: Date;
    category: string;
    groupId: string;
    splitBetween: Array<{ user: string; share: number }>;
  }) => api.post('/expenses', data),
  
  getGroupExpenses: (groupId: string) =>
    api.get(`/expenses/group/${groupId}`),
  
  update: (expenseId: string, data: any) =>
    api.put(`/expenses/${expenseId}`, data),
  
  delete: (expenseId: string) =>
    api.delete(`/expenses/${expenseId}`)
};
