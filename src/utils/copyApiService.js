// Safe Copy Environment API Service
// All operations target the copy database and backend

import { apiClient, handleAPIError } from "./apiClient";
import { copyLogger } from "./copyLogger";

// Influencer endpoints (targeting influencer_copy database)
export const influencerAPI = {
  // GET /influencers - List all influencers from copy database
  async getInfluencers(filters = {}) {
    try {
      copyLogger.log('GET_INFLUENCERS_INITIATED', { filters });
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const endpoint = `/influencers${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(endpoint);
      
      copyLogger.logDatabaseOperation('READ', 'influencers', filters, response);
      return response;
    } catch (error) {
      copyLogger.logDatabaseOperation('READ', 'influencers', filters, null, error);
      handleAPIError(error);
      throw error;
    }
  },

  // GET /influencers/:id - Get specific influencer from copy database
  async getInfluencerById(id) {
    try {
      copyLogger.log('GET_INFLUENCER_BY_ID_INITIATED', { id });
      
      const response = await apiClient.get(`/influencers/${id}`);
      
      copyLogger.logDatabaseOperation('READ', 'influencers', { id }, response);
      return response;
    } catch (error) {
      copyLogger.logDatabaseOperation('READ', 'influencers', { id }, null, error);
      handleAPIError(error);
      throw error;
    }
  },

  // POST /influencers - Create new influencer in copy database
  async createInfluencer(influencerData) {
    try {
      copyLogger.log('CREATE_INFLUENCER_INITIATED', { 
        name: influencerData.name,
        platform: influencerData.platform 
      });
      
      const response = await apiClient.post('/influencers', influencerData);
      
      copyLogger.logDatabaseOperation('CREATE', 'influencers', influencerData, response);
      copyLogger.logUserAction('INFLUENCER_CREATED', null, { 
        influencerId: response.id,
        name: influencerData.name 
      });
      
      return response;
    } catch (error) {
      copyLogger.logDatabaseOperation('CREATE', 'influencers', influencerData, null, error);
      handleAPIError(error);
      throw error;
    }
  },

  // PUT /influencers/:id - Update influencer in copy database
  async updateInfluencer(id, updateData) {
    try {
      copyLogger.log('UPDATE_INFLUENCER_INITIATED', { id, updateFields: Object.keys(updateData) });
      
      const response = await apiClient.put(`/influencers/${id}`, updateData);
      
      copyLogger.logDatabaseOperation('UPDATE', 'influencers', { id, ...updateData }, response);
      copyLogger.logUserAction('INFLUENCER_UPDATED', null, { influencerId: id });
      
      return response;
    } catch (error) {
      copyLogger.logDatabaseOperation('UPDATE', 'influencers', { id, ...updateData }, null, error);
      handleAPIError(error);
      throw error;
    }
  }
};

// Posts endpoints (targeting influencer_copy database)
export const postsAPI = {
  // POST /posts - Create new post in copy database
  async createPost(postData) {
    try {
      copyLogger.log('CREATE_POST_INITIATED', { 
        influencerId: postData.influencerId,
        platform: postData.platform 
      });
      
      const response = await apiClient.post('/posts', postData);
      
      copyLogger.logDatabaseOperation('CREATE', 'posts', postData, response);
      copyLogger.logUserAction('POST_CREATED', null, { 
        postId: response.id,
        influencerId: postData.influencerId 
      });
      
      return response;
    } catch (error) {
      copyLogger.logDatabaseOperation('CREATE', 'posts', postData, null, error);
      handleAPIError(error);
      throw error;
    }
  },

  // PUT /posts/:id - Update post in copy database
  async updatePost(id, updateData) {
    try {
      copyLogger.log('UPDATE_POST_INITIATED', { id, updateFields: Object.keys(updateData) });
      
      const response = await apiClient.put(`/posts/${id}`, updateData);
      
      copyLogger.logDatabaseOperation('UPDATE', 'posts', { id, ...updateData }, response);
      copyLogger.logUserAction('POST_UPDATED', null, { postId: id });
      
      return response;
    } catch (error) {
      copyLogger.logDatabaseOperation('UPDATE', 'posts', { id, ...updateData }, null, error);
      handleAPIError(error);
      throw error;
    }
  },

  // GET /posts - Get posts from copy database
  async getPosts(filters = {}) {
    try {
      copyLogger.log('GET_POSTS_INITIATED', { filters });
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const endpoint = `/posts${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(endpoint);
      
      copyLogger.logDatabaseOperation('READ', 'posts', filters, response);
      return response;
    } catch (error) {
      copyLogger.logDatabaseOperation('READ', 'posts', filters, null, error);
      handleAPIError(error);
      throw error;
    }
  }
};

// Analytics endpoints (targeting influencer_copy database)
export const analyticsAPI = {
  // POST /analytics - Submit analytics data to copy database
  async submitAnalytics(analyticsData) {
    try {
      copyLogger.log('SUBMIT_ANALYTICS_INITIATED', { 
        type: analyticsData.type,
        period: analyticsData.period 
      });
      
      const response = await apiClient.post('/analytics', analyticsData);
      
      copyLogger.logDatabaseOperation('CREATE', 'analytics', analyticsData, response);
      copyLogger.logUserAction('ANALYTICS_SUBMITTED', null, { 
        type: analyticsData.type 
      });
      
      return response;
    } catch (error) {
      copyLogger.logDatabaseOperation('CREATE', 'analytics', analyticsData, null, error);
      handleAPIError(error);
      throw error;
    }
  },

  // GET /analytics - Retrieve analytics from copy database
  async getAnalytics(filters = {}) {
    try {
      copyLogger.log('GET_ANALYTICS_INITIATED', { filters });
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const endpoint = `/analytics${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(endpoint);
      
      copyLogger.logDatabaseOperation('READ', 'analytics', filters, response);
      return response;
    } catch (error) {
      copyLogger.logDatabaseOperation('READ', 'analytics', filters, null, error);
      handleAPIError(error);
      throw error;
    }
  }
};

// Test connection to copy backend
export const testCopyConnection = async () => {
  try {
    copyLogger.log('CONNECTION_TEST_INITIATED', { backend: 'https://backend-copy.onrender.com' });
    
    const response = await apiClient.get('/test');
    
    copyLogger.log('CONNECTION_TEST_SUCCESS', { 
      status: response.status,
      message: response.message,
      database: 'influencer_copy'
    });
    
    return {
      status: 'success',
      message: 'Connected to copy backend successfully',
      backend: 'https://backend-copy.onrender.com',
      database: 'influencer_copy',
      environment: 'copy'
    };
  } catch (error) {
    copyLogger.log('CONNECTION_TEST_FAILED', { 
      error: error.message,
      backend: 'https://backend-copy.onrender.com'
    });
    
    return {
      status: 'error',
      message: `Connection to copy backend failed: ${error.message}`,
      backend: 'https://backend-copy.onrender.com',
      environment: 'copy'
    };
  }
};

// Export all APIs as a single object for convenience
export const copyAPI = {
  influencers: influencerAPI,
  posts: postsAPI,
  analytics: analyticsAPI,
  test: testCopyConnection,
  logger: copyLogger
};

export default copyAPI;
