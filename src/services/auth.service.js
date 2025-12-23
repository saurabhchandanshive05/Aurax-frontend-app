import apiClient from './api.service';

export const authService = {
  /**
   * Initiate Instagram OAuth login
   */
  async initiateLogin() {
    try {
      const response = await apiClient.get('/auth/instagram/login');
      if (response.data.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error('Failed to initiate login:', error);
      throw error;
    }
  },

  /**
   * Check session status
   */
  async checkSession() {
    try {
      const response = await apiClient.get('/auth/session');
      return response.data;
    } catch (error) {
      console.error('Failed to check session:', error);
      return { authenticated: false };
    }
  },

  /**
   * Get user profile
   */
  async getProfile() {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw error;
    }
  },

  /**
   * Get Instagram stats
   */
  async getInstagramStats() {
    try {
      const response = await apiClient.get('/user/instagram/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to get Instagram stats:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  }
};
