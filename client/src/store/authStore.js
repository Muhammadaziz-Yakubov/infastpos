import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { username, password });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      set({ 
        user: data, 
        token: data.token, 
        isAuthenticated: true, 
        loading: false 
      });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login xatosi', 
        loading: false 
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const { data } = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(data));
      set({ user: data, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  }
}));

export default useAuthStore;
