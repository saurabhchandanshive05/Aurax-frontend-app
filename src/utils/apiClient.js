// Centralized API Client with Error Handling and Authentication
import { copyLogger } from "./copyLogger";
import { getApiUrl } from './getApiUrl';

// Single source of truth for the backend URL (REACT_APP_API_URL in production)
const BASE_URL = `${getApiUrl()}/api`;

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
      
      // Check content type before parsing
      const contentType = response.headers.get("content-type");
      const isJSON = contentType && contentType.includes("application/json");
      
      let responseData;
      if (isJSON) {
        try {
          responseData = await response.json();
        } catch (jsonError) {
          console.error("Failed to parse JSON response:", jsonError);
          responseData = { 
            message: "Invalid JSON response from server",
            status: response.status 
          };
        }
      } else {
        // If not JSON, get text response (likely HTML error page)
        const textResponse = await response.text();
        console.error("Non-JSON response received:", textResponse.substring(0, 200));
        responseData = { 
          message: `Server returned ${response.status} error. Please check if the API endpoint is correct.`,
          status: response.status,
          htmlError: true
        };
      }

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

  // Enhanced Authentication Methods with OTP Support
  async register(userData) {
    copyLogger.info("Registering new user", {
      email: userData.email,
      role: userData.role,
    });

    try {
      const response = await this.request("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      copyLogger.info("Registration initiated", { email: userData.email });
      return response;
    } catch (error) {
      copyLogger.error("Registration failed", error);
      throw error;
    }
  },

  async verifyEmail(verificationData) {
    copyLogger.info("Verifying email", { email: verificationData.email });

    try {
      const response = await this.request("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify(verificationData),
      });

      copyLogger.info("Email verification successful", {
        email: verificationData.email,
      });
      return response;
    } catch (error) {
      copyLogger.error("Email verification failed", error);
      throw error;
    }
  },

  async login(credentials) {
    copyLogger.info("Attempting login", {
      email: credentials.email || credentials.emailOrPhone,
      method: credentials.loginMethod || "password",
    });

    // Client-side validation
    const email = credentials.emailOrPhone || credentials.email;
    const password = credentials.password;

    if (!email || !password) {
      const missingFields = [];
      if (!email) missingFields.push("email");
      if (!password) missingFields.push("password");
      throw new APIError(
        `Missing required fields: ${missingFields.join(", ")}`,
        400
      );
    }

    try {
      const loginData = {
        // Support both email and emailOrPhone fields for backend compatibility
        emailOrPhone: credentials.emailOrPhone || credentials.email,
        email: credentials.email || credentials.emailOrPhone, // Fallback for backend
        password: credentials.password, // Always include password field
        loginMethod: credentials.loginMethod,
        ...(credentials.otp && { otp: credentials.otp }),
      };

      const response = await this.request("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginData),
      });

      if (response.success && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        copyLogger.info("Login successful", {
          userId: response.user.id,
          role: response.user.role,
          method: response.loginMethod,
        });
      }

      return response;
    } catch (error) {
      copyLogger.error("Login failed", error);
      throw error;
    }
  },

  async resendVerification(data) {
    copyLogger.info("Resending verification code", { email: data.email });

    try {
      // Ensure type parameter is included (backend requires it)
      const requestData = {
        email: data.email,
        type: data.type || "email", // Default to email if not specified
      };

      const response = await this.request("/resend-verification", {
        method: "POST",
        body: JSON.stringify(requestData),
      });

      copyLogger.info("Verification code resent", { email: data.email });
      return response;
    } catch (error) {
      copyLogger.error("Resend verification failed", error);
      throw error;
    }
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

// Export apiClient as default export
export default apiClient;
