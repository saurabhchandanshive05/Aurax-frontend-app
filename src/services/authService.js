import { API_CONFIG } from '../config/apiConfig';
import { getApiUrl } from '../utils/getApiUrl';

const login = async (credentials) => {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/login`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.headers,
        Authorization: credentials.token || ''
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export { login };

const path = require('path');

module.exports = {
  devServer: {
    historyApiFallback: true,
    hot: true,
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.REACT_APP_API_URL || getApiUrl(),
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  }
};