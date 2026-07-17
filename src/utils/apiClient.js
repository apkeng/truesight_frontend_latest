import { auth } from '../firebase/firebase-config';
import Cookies from 'js-cookie';

// Backend API base URL
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

/**
 * Get Firebase ID token for authentication
 * Tries to get from Firebase Client SDK first, falls back to stored cookie
 */
const getIdToken = async () => {
  // First, try to get token from cookie (source of truth for our custom login logic)
  const tokenFromCookie = Cookies.get('authToken');
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  // Fallback: Get token from Firebase Client SDK
  const user = auth.currentUser;
  if (user) {
    try {
      return await user.getIdToken();
    } catch (error) {
      console.warn('Failed to get token from Firebase Client SDK:', error);
    }
  }
  
  throw new Error('User not authenticated');
};

/**
 * Make API request with automatic token injection
 */
const apiRequest = async (endpoint, options = {}) => {
  // Remove trailing slash from base URL and leading slash from endpoint to avoid double slashes
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;
  
  // Get auth token (optional if skipAuth is true)
  let token;
  const skipAuth = options.skipAuth || false;
  
  if (!skipAuth) {
    try {
      token = await getIdToken();
    } catch (error) {
      throw new Error('Authentication required. Please log in again.');
    }
  } else {
    try {
      token = await getIdToken();
    } catch (error) {
      // If skipAuth is true and token fetch fails, continue without token
      token = null;
    }
  }

  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add authorization header only if token is available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge options
  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Parse JSON response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle non-OK responses
    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        // Clear auth cookies
        Cookies.remove('authToken');
        Cookies.remove('uid');
        Cookies.remove('sessionId');
        Cookies.remove('isAuthenticated');
        
        // Redirect to login if we're not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          if (navigateFunction) {
            navigateFunction('/login');
          } else {
            window.location.href = '/login';
          }
        }
        
        throw new Error('Session expired. Please log in again.');
      }
      
      const error = new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and ensure the backend server is running.');
    }
    throw error;
  }
};

/**
 * API Client methods
 */
const apiClient = {
  /**
   * GET request
   */
  get: async (endpoint, options = {}) => {
    return apiRequest(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  /**
   * GET request without authentication (public)
   */
  getPublic: async (endpoint, options = {}) => {
    return apiRequest(endpoint, {
      ...options,
      method: 'GET',
      skipAuth: true,
    });
  },

  /**
   * POST request
   */
  post: async (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * POST request without authentication (public)
   */
  postPublic: async (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
  },

  /**
   * PUT request
   */
  put: async (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE request
   */
  delete: async (endpoint, options = {}) => {
    return apiRequest(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },

  /**
   * PATCH request
   */
  patch: async (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

let navigateFunction = null;

export const setNavigateFunction = (navigate) => {
  navigateFunction = navigate;
};

export default apiClient;
