import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    // Align with apiClient token key
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser({
          id: decoded.id || decoded.sub,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name,
        });
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
      }
    }
    setIsLoading(false);
  };

  const login = (token) => {
    // Store under new key for consistency
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setCurrentUser({
      id: decoded.id || decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    });

    return decoded.role === "creator"
      ? "/creator/dashboard"
      : "/brand/dashboard";
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated: !!currentUser,
        user: currentUser,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
