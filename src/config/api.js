// API Configuration
export const API_CONFIG = {
  // Base URL for API requests
  baseURL: process.env.REACT_APP_API_URL || (
    process.env.NODE_ENV === 'production'
      ? 'https://influencer-backend-etq5.onrender.com'
      : 'http://localhost:5002'
  ),

  // Default headers
  headers: {
    'Content-Type': 'application/json',
    'X-Copy-Environment': 'true',
    'X-Database': 'influencer_copy'
  },

  // Timeout in milliseconds
  timeout: 10000
};

// API client with configuration
export const apiClient = {
  // Helper method to make requests with the correct configuration
  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const headers = {
      ...API_CONFIG.headers,
      ...options.headers
    };

    const config = {
      ...options,
      headers,
      credentials: 'include' // For CORS with credentials
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`
        }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // Authentication methods
  auth: {
    async login(email, password) {
      return apiClient.request('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    },

    async register(userData) {
      return apiClient.request('/api/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    },

    async getProfile() {
      return apiClient.request('/api/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    }
  },

  // Creators methods
  creators: {
    async list(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      return apiClient.request(`/api/creators${queryString ? `?${queryString}` : ''}`);
    }
  },

  // Brands methods
  brands: {
    async list() {
      return apiClient.request('/api/brands');
    }
  },

  // Contact form submission
  async contact(formData) {
    return apiClient.request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  }
};
