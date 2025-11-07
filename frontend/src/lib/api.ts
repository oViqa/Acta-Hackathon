import axios, { AxiosError } from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (data: { name: string; password: string }) => {
    const response = await apiClient.post('/auth/login', data);
    return response;
  },

  register: async (data: { name: string; password: string }) => {
    const response = await apiClient.post('/auth/register', data);
    return response;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response;
  },
};

// Events API
export const eventsAPI = {
  getEvents: async (params?: {
    lat?: number;
    lng?: number;
    radius?: number;
    status?: string;
    limit?: number;
  }) => {
    const response = await apiClient.get('/events', { params });
    return response;
  },

  createEvent: async (data: {
    title: string;
    description?: string;
    location: {
      lat: number;
      lng: number;
    };
    city: string;
    state?: string;
    address?: string;
    startTime: string;
    endTime: string;
    attendeeLimit: number;
  }) => {
    const response = await apiClient.post('/events', data);
    return response;
  },

  getEventById: async (eventId: string) => {
    const response = await apiClient.get(`/events/${eventId}`);
    return response;
  },

  updateEvent: async (eventId: string, data: any) => {
    const response = await apiClient.put(`/events/${eventId}`, data);
    return response;
  },

  deleteEvent: async (eventId: string) => {
    const response = await apiClient.delete(`/events/${eventId}`);
    return response;
  },
};

// Attendance API
export const attendanceAPI = {
  joinEvent: async (eventId: string, formData: FormData) => {
    const response = await apiClient.post('/attendance/join', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  getEventRequests: async (eventId: string) => {
    const response = await apiClient.get(`/attendance/event/${eventId}/requests`);
    return response;
  },

  approveRequest: async (requestId: string) => {
    const response = await apiClient.post(`/attendance/${requestId}/approve`);
    return response;
  },

  rejectRequest: async (requestId: string) => {
    const response = await apiClient.post(`/attendance/${requestId}/reject`);
    return response;
  },
};

// Leaderboard API
export const leaderboardAPI = {
  getLeaderboard: async () => {
    const response = await apiClient.get('/leaderboard');
    return response;
  },
};

// Error handling helper
export function handleApiError(error: any): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    
    if (axiosError.response) {
      // Server responded with error
      const errorData = axiosError.response.data;
      return errorData?.error || errorData?.message || 'An error occurred';
    } else if (axiosError.request) {
      // Request made but no response
      return 'Unable to connect to server. Please check your internet connection.';
    }
  }
  
  // Generic error
  return error?.message || 'An unexpected error occurred';
}

