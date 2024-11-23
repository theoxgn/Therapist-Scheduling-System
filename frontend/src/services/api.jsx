// src/services/api.jsx
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { token } = response.data;
          
          localStorage.setItem('token', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

const endpoints = {
  auth: {
    login: async (credentials) => {
      try {
        const response = await api.post('/auth/login', credentials);
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return { success: true, user };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Login failed'
        };
      }
    },

    logout: async () => {
      try {
        await api.post('/auth/logout');
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Logout failed'
        };
      }
    },

    checkAuth: async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return { success: false };

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/auth/me');
        return { success: true, user: response.data };
      } catch (error) {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        return { success: false };
      }
    },

    register: (userData) => api.post('/auth/register', userData),
    refreshToken: () => api.post('/auth/refresh')
  },
  branches: {
    getAll: async () => {
      try {
        const response = await api.get('/branches');
        return { 
          success: true, 
          data: response.data 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to fetch branches'
        };
      }
    },

    getOne: async (id) => {
      try {
        const response = await api.get(`/branches/${id}`);
        return { 
          success: true, 
          data: response.data 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to fetch branch'
        };
      }
    },

    create: async (branchData) => {
      try {
        const response = await api.post('/branches', branchData);
        return { 
          success: true, 
          data: response.data 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to create branch'
        };
      }
    },

    update: async (id, branchData) => {
      try {
        const response = await api.put(`/branches/${id}`, branchData);
        return { 
          success: true, 
          data: response.data 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to update branch'
        };
      }
    },

    delete: async (id) => {
      try {
        await api.delete(`/branches/${id}`);
        return { 
          success: true 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to delete branch'
        };
      }
    },

    validateBranch: async (branchData) => {
      try {
        const response = await api.post('/branches/validate', branchData);
        return { 
          success: true, 
          data: response.data 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Branch validation failed'
        };
      }
    }
  },
  // Add this to your existing api.js file under the endpoints object

  therapists: {
    getAll: async () => {
      try {
        const response = await api.get('/therapists');
        return { 
          success: true, 
          data: response.data 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to fetch therapists'
        };
      }
    },

    getByBranch: async (branchCode) => {
      try {
        const response = await api.get('/therapists', {
          params: { branchCode }
        });
        return { 
          success: true, 
          data: response.data 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to fetch therapists for this branch'
        };
      }
    },

    getOne: async (id) => {
      try {
        const response = await api.get(`/therapists/${id}`);
        return { 
          success: true, 
          data: response.data 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to fetch therapist'
        };
      }
    },

    create: async (therapistData) => {
      try {
        const response = await api.post('/therapists', therapistData);
        return { 
          success: true, 
          data: response.data 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to create therapist'
        };
      }
    },

    update: async (id, therapistData) => {
      try {
        const response = await api.put(`/therapists/${id}`, therapistData);
        return { 
          success: true, 
          data: response.data 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to update therapist'
        };
      }
    },

    delete: async (id) => {
      try {
        await api.delete(`/therapists/${id}`);
        return { 
          success: true 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to delete therapist'
        };
      }
    },

    validateTherapist: async (therapistData) => {
      try {
        const response = await api.post('/therapists/validate', therapistData);
        return { 
          success: true, 
          data: response.data 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Therapist validation failed'
        };
      }
    }
  },
  schedules: {
    getByDateRange: async (branchCode, startDate, endDate) => {
      try {
        // Log request parameters for debugging
        console.log('Fetching schedules with params:', { branchCode, startDate, endDate });

        const response = await api.get('/schedules/', {
          params: {
            branchCode,
            startDate,
            endDate
          }
        });

        return { 
          success: true, 
          data: response.data 
        };
      } catch (error) {
        // Detailed error logging
        console.error('Schedule fetch error:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          error: error.message
        });

        return {
          success: false,
          error: error.response?.data?.message || 
                 error.response?.status === 500 ? 
                 'Internal server error occurred. Please try again later.' :
                 'Failed to fetch schedules',
          details: {
            status: error.response?.status,
            technicalMessage: error.message
          }
        };
      }
    },

    create: async (scheduleData) => {
      try {
        const response = await api.post('/schedules', scheduleData);
        return { 
          success: true, 
          data: response.data 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to create schedule'
        };
      }
    },

    update: async (id, scheduleData) => {
      try {
        const response = await api.put(`/schedules/${id}`, scheduleData);
        return { 
          success: true, 
          data: response.data 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to update schedule'
        };
      }
    },

    delete: async (id) => {
      try {
        await api.delete(`/schedules/${id}`);
        return { 
          success: true 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to delete schedule'
        };
      }
    },

    requestLeave: async (leaveData) => {
      try {
        const response = await api.post('/schedules/leave-request', leaveData);
        return { 
          success: true, 
          data: response.data 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to request leave'
        };
      }
    },

    validateSchedule: async (scheduleData) => {
      try {
        const response = await api.post('/schedules/validate', scheduleData);
        return { 
          success: true, 
          data: response.data 
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Schedule validation failed'
        };
      }
    }
  },
};

export const handleApiError = (error) => {
  const defaultError = 'An unexpected error occurred';
  
  if (error.response) {
    const message = error.response.data?.message || defaultError;
    const status = error.response.status;
    return { message, status };
  }
  
  if (error.request) {
    return { 
      message: 'Unable to connect to server', 
      status: 0 
    };
  }
  
  return { 
    message: error.message || defaultError, 
    status: 0 
  };
};

export default endpoints;