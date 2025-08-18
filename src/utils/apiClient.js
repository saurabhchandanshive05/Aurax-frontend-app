// Centralized API Client with Error Handling and Authentication

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5003/api";

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
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config = {
      method: "GET",
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new APIError(
          errorBody.message || "An unexpected error occurred",
          response.status,
          errorBody
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;

      throw new APIError(
        error.message || "Network error",
        error.status || 500,
        { originalError: error }
      );
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
