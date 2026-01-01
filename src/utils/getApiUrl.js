/**
 * API URL Utility
 * Centralized API URL management for production safety
 * Throws error if REACT_APP_API_URL is not configured
 */

export const getApiUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  
  if (!apiUrl) {
    console.error('❌ REACT_APP_API_URL environment variable is not set');
    throw new Error(
      'API URL not configured. Please set REACT_APP_API_URL in your environment variables.'
    );
  }

  // Remove trailing slash if present
  return apiUrl.replace(/\/$/, '');
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
