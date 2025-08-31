const getApiUrl = () => {
  const isProd = process.env.REACT_APP_ENV === 'production';
  const prodUrl = process.env.REACT_APP_API_BASE_URL;
  const devUrl = 'http://localhost:5002/api';
  
  // Ensure URL ends with /api
  return isProd ? prodUrl : devUrl;
};

export const API_CONFIG = {
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
    // Remove custom headers that cause CORS issues
  },
  credentials: 'include' // Enable cookies if needed
};