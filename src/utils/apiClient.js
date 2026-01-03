// Centralized API Client with Error Handling and Authentication
import { copyLogger } from "./copyLogger";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://influencer-backend-7.onrender.com/api"
    : process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : undefined;

if (!BASE_URL) {
  throw new Error('REACT_APP_API_URL environment variable is required');
}

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

  async verifyRegistration(verificationData) {
    copyLogger.info("Verifying registration OTP", {
      email: verificationData.email,
    });

    try {
      const response = await this.request("/auth/verify-registration", {
        method: "POST",
        body: JSON.stringify(verificationData),
      });

      copyLogger.info("Registration verification successful", {
        email: verificationData.email,
      });
      return response;
    } catch (error) {
      copyLogger.error("Registration verification failed", error);
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

  async requestLoginOTP(email) {
    copyLogger.info("Requesting login OTP", { email });

    try {
      const response = await this.request("/auth/request-login-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      copyLogger.info("Login OTP requested", { email });
      return response;
    } catch (error) {
      copyLogger.error("Login OTP request failed", error);
      throw error;
    }
  },

  async resendRegistrationOTP(email) {
    copyLogger.info("Resending registration OTP", { email });

    try {
      const response = await this.request("/auth/resend-registration-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      copyLogger.info("Registration OTP resent", { email });
      return response;
    } catch (error) {
      copyLogger.error("Resend registration OTP failed", error);
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

  async getProfile() {
    copyLogger.info("Fetching user profile");

    try {
      const response = await this.request("/auth/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      copyLogger.info("Profile fetched successfully");
      return response;
    } catch (error) {
      copyLogger.error("Profile fetch failed", error);
      throw error;
    }
  },

  async updateLoginPreferences(preferences) {
    copyLogger.info("Updating login preferences", preferences);

    try {
      const response = await this.request("/auth/login-preferences", {
        method: "PUT",
        body: JSON.stringify(preferences),
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      copyLogger.info("Login preferences updated");
      return response;
    } catch (error) {
      copyLogger.error("Update login preferences failed", error);
      throw error;
    }
  },

  async resendVerificationOTP(data) {
    copyLogger.info("Resending verification OTP", { email: data.email });

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
      copyLogger.error("Failed to resend verification", error);
      throw error;
    }
  },

  // Instagram OAuth Methods
  async getInstagramOAuthURL() {
    copyLogger.info("Getting Instagram OAuth URL");

    try {
      const response = await this.request("/instagram/oauth/url", {
        method: "GET",
      });

      copyLogger.info("Instagram OAuth URL generated");
      return response;
    } catch (error) {
      copyLogger.error("Failed to get Instagram OAuth URL", error);
      throw error;
    }
  },

  async exchangeInstagramCode(data) {
    copyLogger.info("Exchanging Instagram OAuth code for token");

    try {
      const response = await this.request("/instagram/oauth/callback", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.success && response.instagram?.access_token) {
        localStorage.setItem(
          "instagram_access_token",
          response.instagram.access_token
        );
        copyLogger.info("Instagram OAuth successful", {
          username: response.instagram.profile?.username,
        });
      }

      return response;
    } catch (error) {
      copyLogger.error("Instagram OAuth failed", error);
      throw error;
    }
  },

  async validateInstagramToken(accessToken) {
    copyLogger.info("Validating Instagram access token");

    try {
      const response = await this.request("/instagram/oauth/validate", {
        method: "POST",
        body: JSON.stringify({ accessToken }),
      });

      copyLogger.info("Instagram token validation completed", {
        valid: response.valid,
      });
      return response;
    } catch (error) {
      copyLogger.error("Instagram token validation failed", error);
      throw error;
    }
  },

  async getInstagramConnectionStatus() {
    copyLogger.info("Getting Instagram connection status");

    try {
      const response = await this.request("/instagram/connection-status", {
        method: "GET",
      });

      copyLogger.info("Instagram connection status retrieved");
      return response;
    } catch (error) {
      copyLogger.error("Failed to get Instagram connection status", error);
      throw error;
    }
  },

  async disconnectInstagram() {
    copyLogger.info("Disconnecting Instagram account");

    try {
      const response = await this.request("/instagram/disconnect", {
        method: "POST",
      });

      if (response.success) {
        localStorage.removeItem("instagram_access_token");
        copyLogger.info("Instagram account disconnected");
      }

      return response;
    } catch (error) {
      copyLogger.error("Failed to disconnect Instagram", error);
      throw error;
    }
  },

  async getInstagramProfile(accessToken) {
    copyLogger.info("Getting Instagram profile data");

    try {
      const response = await this.request(
        `/instagram/profile?accessToken=${accessToken}`,
        {
          method: "GET",
        }
      );

      copyLogger.info("Instagram profile data retrieved");
      return response;
    } catch (error) {
      copyLogger.error("Failed to get Instagram profile", error);
      throw error;
    }
  },

  async logout() {
    copyLogger.info("Logging out user");

    try {
      // Clear all stored tokens
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("instagram_access_token");

      copyLogger.info("User logged out successfully");
      return { success: true };
    } catch (error) {
      copyLogger.error("Logout failed", error);
      throw error;
    }
  },

  async getUserProfile() {
    copyLogger.info("Getting user profile");

    try {
      const response = await this.request("/auth/profile", {
        method: "GET",
      });

      copyLogger.info("User profile retrieved");
      return response;
    } catch (error) {
      copyLogger.error("Failed to get user profile", error);
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

// Export apiClient as default export
export default apiClient;
