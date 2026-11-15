import { getApiUrl as getBaseApiUrl } from '../utils/getApiUrl';
const getApiUrl = () => {
  const isProd = process.env.REACT_APP_ENV === 'production';
  const prodUrl = process.env.REACT_APP_API_BASE_URL;
  
  // Ensure URL ends with /api
  return isProd ? prodUrl : `${getBaseApiUrl()}/api`;
};

export const API_CONFIG = {
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
    // Remove custom headers that cause CORS issues
  },
  credentials: 'include' // Enable cookies if needed
};