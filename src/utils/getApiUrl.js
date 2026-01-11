/**
 * API URL Utility
 * Centralized API URL management for production safety
 * Dynamically determines backend URL based on current hostname
 */

export const getApiUrl = () => {
  // In production, use environment variable
  if (process.env.NODE_ENV === 'production') {
    const apiUrl = process.env.REACT_APP_API_URL;
    
    if (!apiUrl) {
      console.error('❌ REACT_APP_API_URL environment variable is not set');
      throw new Error(
        'API URL not configured. Please set REACT_APP_API_URL in your environment variables.'
      );
    }
    
    return apiUrl.replace(/\/$/, '');
  }

  // Development mode: Auto-detect based on current hostname
  const currentHostname = window.location.hostname;
  
  // If accessing via local network IP (e.g., from mobile)
  const localNetworkPattern = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)\d+\.\d+$/;
  if (localNetworkPattern.test(currentHostname)) {
    const backendUrl = `http://${currentHostname}:5002`;
    console.log('📱 Mobile access detected - Using backend:', backendUrl);
    return backendUrl;
  }

  // Default to localhost for local development
  const defaultUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002';
  console.log('🖥️  Local access - Using backend:', defaultUrl);
  return defaultUrl.replace(/\/$/, '');
};

/**
 * Get full API endpoint URL
 * @param {string} endpoint - API endpoint path (with or without leading slash)
 * @returns {string} Full URL
 */
export const getApiEndpoint = (endpoint) => {
  const baseUrl = getApiUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

/**
 * Validate API URL configuration
 * @returns {boolean} True if configured correctly
 */
export const isApiUrlConfigured = () => {
  try {
    getApiUrl();
    return true;
  } catch {
    return false;
  }
};

/**
 * Get API URL for Instagram OAuth redirect
 * @returns {string} OAuth callback URL
 */
export const getInstagramCallbackUrl = () => {
  return `${getApiUrl()}/api/auth/instagram/callback`;
};

export default { getApiUrl, getApiEndpoint, isApiUrlConfigured, getInstagramCallbackUrl };
