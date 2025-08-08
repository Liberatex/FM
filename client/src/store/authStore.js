import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,

  login: async (email, password) => {
    try {
      set({ isLoading: true });
      
      // Simulate API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      set({
        user: data.data.user,
        isAuthenticated: true,
        token: data.data.tokens.accessToken,
        isLoading: false,
      });

      // Store token in localStorage
      localStorage.setItem('token', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${get().token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and localStorage
      set({
        user: null,
        isAuthenticated: false,
        token: null,
        isLoading: false,
      });
      
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  register: async (userData) => {
    try {
      set({ isLoading: true });
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      
      set({
        user: data.data.user,
        isAuthenticated: true,
        token: data.data.tokens.accessToken,
        isLoading: false,
      });

      localStorage.setItem('token', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        set({
          user: data.data.user,
          isAuthenticated: true,
          token,
          isLoading: false,
        });
      } else {
        // Token is invalid, clear everything
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          isLoading: false,
        });
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      set({ isLoading: false });
      console.error('Auth check error:', error);
    }
  },
})); 