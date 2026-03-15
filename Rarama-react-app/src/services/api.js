import axios from 'axios';
import toast from 'react-hot-toast';

// CRA environment variables (use REACT_APP_ prefix in .env)
const RAW_API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
// Enforce HTTPS for all API calls in production
const API_URL =
  process.env.NODE_ENV === 'production'
    ? RAW_API_URL.replace(/^http:\/\//, 'https://')
    : RAW_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Temporarily disable to test
});

const tryEndpointRequests = async (requests) => {
  let lastError = null;

  for (const request of requests) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status === 404 || status === 405) {
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error('No available endpoint handled this request.');
};

const buildPasswordPayloadVariants = (payload = {}) => {
  const currentPassword =
    payload.current_password || payload.currentPassword || payload.current || '';
  const nextPassword =
    payload.new_password || payload.newPassword || payload.password || '';
  const confirmPassword =
    payload.new_password_confirmation ||
    payload.newPasswordConfirmation ||
    payload.password_confirmation ||
    payload.passwordConfirmation ||
    payload.confirm_password ||
    payload.confirmPassword ||
    '';

  const snakePayload = {
    current_password: currentPassword,
    password: nextPassword,
    password_confirmation: confirmPassword,
  };

  const mixedPayload = {
    current_password: currentPassword,
    new_password: nextPassword,
    new_password_confirmation: confirmPassword,
  };

  const camelPayload = {
    currentPassword,
    newPassword: nextPassword,
    confirmPassword,
  };

  return { snakePayload, mixedPayload, camelPayload };
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only show toast for non-404 errors to reduce popup spam
    if (error.response && error.response.status !== 404) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          toast.error('You don\'t have permission to perform this action.');
          break;
        case 422:
          // Only show validation errors for forms, not for general API calls
          if (error.config.url?.includes('/signin') || error.config.url?.includes('/register')) {
            const errors = error.response.data.errors;
            Object.values(errors).forEach((err) => {
              toast.error(err[0]);
            });
          }
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          // Don't show generic error messages to reduce popup spam
          console.error('API Error:', error.response?.data?.message || 'An error occurred.');
      }
    } else if (error.request) {
      // Network errors - show less frequently
      console.error('Network error:', error.message);
    } else {
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  login: (credentials) => {
    // Trim string fields to prevent whitespace-only inputs reaching the server
    const sanitized = Object.fromEntries(
      Object.entries(credentials).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
    );
    return api.post('/signin', sanitized);
  },
  signUp: (userData) => {
    const sanitized = Object.fromEntries(
      Object.entries(userData).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
    );
    return api.post('/register', sanitized);
  },
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

// Profile endpoints
export const profile = {
  getMe: () => auth.me(),
  updateProfile: (payload) =>
    tryEndpointRequests([
      () => api.put('/profile', payload),
      () => api.patch('/profile', payload),
      () => api.put('/me', payload),
      () => api.post('/profile/update', payload),
    ]),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('profile_picture', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    return tryEndpointRequests([
      () => api.post('/profile/avatar', formData, config),
      () => api.post('/profile/photo', formData, config),
      () => api.post('/me/avatar', formData, config),
      () => api.post('/profile/upload-avatar', formData, config),
    ]);
  },
  changePassword: (payload) =>
    (() => {
      const { snakePayload, mixedPayload, camelPayload } = buildPasswordPayloadVariants(payload);

      return tryEndpointRequests([
        () => api.post('/profile/password', snakePayload),
        () => api.put('/profile/password', snakePayload),
        () => api.patch('/profile/password', snakePayload),

        () => api.post('/user/password', snakePayload),
        () => api.put('/user/password', snakePayload),
        () => api.patch('/user/password', snakePayload),

        () => api.post('/me/password', snakePayload),
        () => api.put('/me/password', snakePayload),
        () => api.patch('/me/password', snakePayload),

        () => api.post('/change-password', snakePayload),
        () => api.post('/update-password', snakePayload),
        () => api.post('/profile/change-password', snakePayload),
        () => api.post('/settings/password', snakePayload),
        () => api.post('/password/change', snakePayload),

        () => api.post('/profile/password', mixedPayload),
        () => api.post('/change-password', mixedPayload),
        () => api.post('/update-password', mixedPayload),

        () => api.post('/change-password', camelPayload),
        () => api.post('/user/password', camelPayload),
      ]);
    })(),
};

// Dashboard endpoints
export const dashboard = {
  getStats: () => api.get('/dashboard/stats'),
  getEnrollmentTrends: () => api.get('/dashboard/enrollment-trends'),
  getCourseDistribution: () => api.get('/dashboard/course-distribution'),
  getAttendancePatterns: () => api.get('/dashboard/attendance-patterns'),
  getDepartmentStats: () => api.get('/dashboard/department-stats'),
  getSchoolDays: () => api.get('/dashboard/school-days'),
  getGenderDemographics: () => api.get('/dashboard/gender-demographics'),
  getCourseAnalytics: () => api.get('/dashboard/course-analytics'),
};

// Student endpoints
export const students = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  getDemographics: () => api.get('/students/demographics'),
};

// Course endpoints
export const courses = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  getDepartments: () => api.get('/departments'),
};

// Chart Data endpoints
export const charts = {
  getEnrollmentTrends: () => api.get('/charts/enrollment-trends'),
  getCourseDistribution: () => api.get('/charts/course-distribution'),
  getAttendancePatterns: () => api.get('/charts/attendance-patterns'),
  getStats: () => api.get('/charts/stats'),
  getDepartmentStats: () => api.get('/charts/department-stats'),
  getRecentActivities: () => api.get('/charts/recent-activities'),
};

export default api;