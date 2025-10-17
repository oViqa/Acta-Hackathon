import { create } from 'zustand';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false, // Start with false to avoid loading screen

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.register({ name, email, password });
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // For mock tokens, validate locally
      if (token.startsWith('mock-')) {
        const userId = token.replace('mock-', '').replace('-token', '');
        const user = { 
          id: userId, 
          email: 'user@example.com', 
          name: 'Mock User',
          role: userId.includes('admin') ? 'admin' : 'user'
        };
        set({ user, token, isAuthenticated: true, isLoading: false });
        return;
      }

      // For real tokens, validate with API
      const response = await authAPI.getMe();
      set({ user: response.data, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

// Initialize auth check
if (typeof window !== 'undefined') {
  // Set a timeout to ensure loading state is cleared even if checkAuth fails
  setTimeout(() => {
    const state = useAuthStore.getState();
    if (state.isLoading) {
      useAuthStore.setState({ isLoading: false });
    }
  }, 5000); // 5 second timeout
  
  useAuthStore.getState().checkAuth();
}
