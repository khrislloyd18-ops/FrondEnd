// Database service for handling database connections and authentication
import axios from 'axios';

// Database configuration
const RAW_DB_API_URL = process.env.REACT_APP_API_URL || 'https://127.0.0.1:8000/api';
// Enforce HTTPS for all API calls in production
const DB_API_URL =
  process.env.NODE_ENV === 'production'
    ? RAW_DB_API_URL.replace(/^http:\/\//, 'https://')
    : RAW_DB_API_URL;

// Create database API instance
const dbApi = axios.create({
  baseURL: DB_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Enable for database sessions
  timeout: 10000, // 10 second timeout
});

// Request interceptor for database
dbApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Database Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('Database Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for database
dbApi.interceptors.response.use(
  (response) => {
    console.log('Database Response:', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('Database Response Error:', error.response?.status, error.config?.url, error.response?.data);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear local storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          break;
        case 403:
          // Forbidden - insufficient permissions
          console.error('Access forbidden: insufficient permissions');
          break;
        case 404:
          // Not found - endpoint doesn't exist
          console.error('Database endpoint not found');
          break;
        case 422:
          // Validation error
          console.error('Validation error:', error.response.data.errors);
          break;
        case 500:
          // Server error
          console.error('Database server error');
          break;
        default:
          console.error('Database error:', error.response.data?.message || 'Unknown error');
      }
    } else if (error.request) {
      // Network error - server not reachable
      console.error('Database network error - server not reachable');
    } else {
      // Request configuration error
      console.error('Database request configuration error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Database authentication service
export const database = {
  // Test database connection
  testConnection: async () => {
    try {
      const response = await dbApi.get('/health');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Authentication endpoints
  auth: {
    // Login with database
    login: async (credentials) => {
      try {
        const response = await dbApi.post('/signin', credentials);
        return { success: true, data: response.data };
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.message || 'Login failed',
          errors: error.response?.data?.errors || {}
        };
      }
    },

    // Register with database
    register: async (userData) => {
      try {
        const response = await dbApi.post('/register', userData);
        return { success: true, data: response.data };
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.message || 'Registration failed',
          errors: error.response?.data?.errors || {}
        };
      }
    },

    // Logout from database
    logout: async () => {
      try {
        const response = await dbApi.post('/logout');
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Get current user from database
    me: async () => {
      try {
        const response = await dbApi.get('/me');
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  // Dashboard endpoints
  dashboard: {
    // Get dashboard stats from database
    getStats: async () => {
      try {
        const response = await dbApi.get('/dashboard/stats');
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Get enrollment trends from database
    getEnrollmentTrends: async () => {
      try {
        const response = await dbApi.get('/dashboard/enrollment-trends');
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Get course distribution from database
    getCourseDistribution: async () => {
      try {
        const response = await dbApi.get('/dashboard/course-distribution');
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Get attendance patterns from database
    getAttendancePatterns: async () => {
      try {
        const response = await dbApi.get('/dashboard/attendance-patterns');
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  // Students endpoints
  students: {
    // Get all students from database
    getAll: async () => {
      try {
        const response = await dbApi.get('/students');
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Create student in database
    create: async (studentData) => {
      try {
        const response = await dbApi.post('/students', studentData);
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Update student in database
    update: async (id, studentData) => {
      try {
        const response = await dbApi.put(`/students/${id}`, studentData);
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Delete student from database
    delete: async (id) => {
      try {
        const response = await dbApi.delete(`/students/${id}`);
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  // Courses endpoints
  courses: {
    // Get all courses from database
    getAll: async () => {
      try {
        const response = await dbApi.get('/courses');
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Create course in database
    create: async (courseData) => {
      try {
        const response = await dbApi.post('/courses', courseData);
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Update course in database
    update: async (id, courseData) => {
      try {
        const response = await dbApi.put(`/courses/${id}`, courseData);
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Delete course from database
    delete: async (id) => {
      try {
        const response = await dbApi.delete(`/courses/${id}`);
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  }
};

// Export the database API instance for direct use
export { dbApi };

// Export default
export default database;
