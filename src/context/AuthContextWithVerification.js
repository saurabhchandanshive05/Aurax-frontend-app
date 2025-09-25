// Updated AuthContext with email verification support
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("http://localhost:5002/api/auth/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token might be invalid, clear it
        logout();
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch("http://localhost:5002/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        const authToken = data.token;
        setToken(authToken);
        setUser(data.user);
        localStorage.setItem("authToken", authToken);

        return {
          success: true,
          user: data.user,
          requiresVerification: data.requiresVerification,
        };
      } else {
        return {
          success: false,
          message: data.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch("http://localhost:5002/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          user: data.user,
          requiresVerification: data.requiresVerification,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message,
          errors: data.errors,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUserProfile();
    }
  };

  const resendVerificationEmail = async (email) => {
    try {
      const response = await fetch(
        "http://localhost:5002/api/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to resend verification email",
      };
    }
  };

  // Helper functions for verification status
  const isVerified = () => user?.isVerified === true;
  const requiresVerification = () => user && !user.isVerified;

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    resendVerificationEmail,
    isVerified,
    requiresVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
