// Centralized API Client with Error Handling and Authentication
import { copyLogger } from "./copyLogger";

const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://influencer-backend-etq5.onrender.com/api'
  : (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002/api');

class APIError extends Error {
  constructor(message, status, details = {}) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.details = details;
  }
}

export const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = localStorage.getItem("token");

    const defaultHeaders = {
      "Content-Type": "application/json",
      "X-Copy-Environment": "true",
      "X-Database": "influencer_copy",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config = {
      method: "GET",
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      // Verify we're in copy environment before making API calls
      copyLogger.verifyCopyEnvironment();

      // Log the API call attempt
      copyLogger.log("API_CALL_INITIATED", {
        endpoint,
        method: config.method,
        url,
        headers: { ...config.headers, Authorization: "[REDACTED]" },
      });

      const response = await fetch(url, config);
      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        copyLogger.logAPICall(
          endpoint,
          config.method,
          { status: response.status, data: responseData },
          new Error(responseData.message || "API Error")
        );

        throw new APIError(
          responseData.message || "An unexpected error occurred",
          response.status,
          responseData
        );
      }

      // Log successful API call
      copyLogger.logAPICall(endpoint, config.method, {
        status: response.status,
        data: responseData,
      });

      return responseData;
    } catch (error) {
      if (error instanceof APIError) {
        copyLogger.logAPICall(endpoint, config.method, null, error);
        throw error;
      }

      const networkError = new APIError(
        error.message || "Network error",
        error.status || 500,
        { originalError: error }
      );

      copyLogger.logAPICall(endpoint, config.method, null, networkError);
      throw networkError;
    }
  },

  // Authentication Methods
  async register(userData) {
    const response = await this.request("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    // Auto-login on successful signup if token is returned
    if (response && response.token) {
      localStorage.setItem("token", response.token);
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
    }

    return response;
  },

  async login(credentials) {
    const response = await this.request("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Store token and user info
    if (response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Existing methods: get, post, etc.
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "DELETE",
    });
  },
};

// Global error handler
export const handleAPIError = (error) => {
  if (error instanceof APIError) {
    console.error(`API Error (${error.status}):`, error.message, error.details);

    // Centralized error handling logic
    switch (error.status) {
      case 400:
        // Bad request - validation error
        break;
      case 401:
        // Unauthorized - redirect to brand login
        apiClient.logout();
        window.location.href = "/brand/login";
        break;
      case 403:
        // Forbidden - show access denied
        break;
      case 404:
        // Not found
        break;
      case 500:
        // Server error
        break;
      default:
      // Generic error
    }
  } else {
    console.error("Unexpected error:", error);
  }
};
