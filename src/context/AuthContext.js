import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getApiEndpoint } from "../utils/getApiUrl";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!hasChecked) {
      // Clear any stale redirects from previous sessions
      const savedRedirect = localStorage.getItem('redirectAfterLogin');
      if (savedRedirect) {

        localStorage.removeItem('redirectAfterLogin');
      }
      
      checkAuthStatus();
    }
  }, [hasChecked]);

  const checkAuthStatus = async () => {

    const token = localStorage.getItem("token") || localStorage.getItem("authToken");

    if (token) {
      try {
        // Fetch full user data from API
        const response = await fetch(getApiEndpoint('/api/me'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const responseData = await response.json();

          // Handle nested user object (API returns {success: true, user: {...}})
          const userData = responseData.user || responseData;
          
          const user = {
            id: userData.id || userData._id,
            email: userData.email,
            role: userData.role,
            roles: userData.roles || [], // Multi-role support
            name: userData.username || userData.fullName,
            minimalProfileCompleted: userData.minimalProfileCompleted || false,
            fullName: userData.fullName,
            creatorType: userData.creatorType,
            instagramUsername: userData.instagramUsername,
            // Include onboarding/review status fields
            reviewStatus: userData.reviewStatus,
            isApproved: userData.isApproved,
            onboardingStep: userData.onboardingStep
          };

          setCurrentUser(user);
        } else {
          // Token invalid, decode from JWT as fallback
          const decoded = jwtDecode(token);

          const user = {
            id: decoded.id || decoded._id || decoded.sub,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name || decoded.username,
            minimalProfileCompleted: false
          };
          
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        // Try JWT decode as last resort
        try {
          const decoded = jwtDecode(token);
          const user = {
            id: decoded.id || decoded._id || decoded.sub,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name || decoded.username,
            minimalProfileCompleted: false
          };
          setCurrentUser(user);
        } catch (decodeError) {
          localStorage.removeItem("token");
          localStorage.removeItem("authToken");
          setCurrentUser(null);
        }
      }
    } else {

      setCurrentUser(null);
    }
    setIsLoading(false);
    setHasChecked(true);
  };

  const login = async (token) => {

    // Check if there's a saved redirect URL (from public creator page)
    const savedRedirect = localStorage.getItem('redirectAfterLogin');

    // Store under new key for consistency
    localStorage.setItem("token", token);
    
    try {
      // Fetch full user data from API FIRST before setting user
      const response = await fetch(getApiEndpoint('/api/me'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const responseData = await response.json();

        // Handle nested user object (API returns {success: true, user: {...}})
        const userData = responseData.user || responseData;
        
        const user = {
          id: userData.id || userData._id,
          email: userData.email,
          role: userData.role,
          roles: userData.roles || [], // Multi-role support
          name: userData.username || userData.fullName,
          minimalProfileCompleted: userData.minimalProfileCompleted || false,
          fullName: userData.fullName,
          creatorType: userData.creatorType,
          instagramUsername: userData.instagramUsername,
          // Include onboarding/review status fields
          reviewStatus: userData.reviewStatus,
          isApproved: userData.isApproved,
          onboardingStep: userData.onboardingStep
        };

        setCurrentUser(user);

        // If there's a saved redirect, use it and clear it
        if (savedRedirect) {

          localStorage.removeItem('redirectAfterLogin');
          return savedRedirect;
        }

        // Determine redirect based on roles (prioritize admin)
        const hasAdminRole = user.roles.includes('admin') || user.role === 'admin';
        const hasCreatorRole = user.roles.includes('creator') || user.role === 'creator';
        const hasBrandRole = user.role === 'brand';

        // Admin users go to admin dashboard (even if they're also creators)
        if (hasAdminRole) {

          return "/admin/brand-intelligence";
        }
        
        // For creators, check onboarding status from userData (already fetched)
        if (hasCreatorRole) {
          const { reviewStatus, isApproved } = userData;

          // Redirect based on onboarding state
          if (reviewStatus === 'approved' && isApproved) {

            return "/creator/dashboard";
          } else if (reviewStatus === 'pending') {

            return "/creator/under-review";
          } else if (reviewStatus === 'rejected') {

            return "/creator/rejected";
          } else {
            // reviewStatus is null/undefined or 'not_submitted'

            return "/creator/welcome";
          }
        }
        
        // Brand users go to brand dashboard
        if (hasBrandRole) {

          return "/brand/dashboard";
        }
        
        // Fallback

        return "/";
      } else {
        // Fallback to JWT decode if API fails
        const decoded = jwtDecode(token);

        const user = {
          id: decoded.id || decoded._id || decoded.sub,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name || decoded.username,
          minimalProfileCompleted: false
        };
        
        setCurrentUser(user);
        
        // Check for saved redirect even in fallback
        if (savedRedirect) {
          localStorage.removeItem('redirectAfterLogin');
          return savedRedirect;
        }
        
        const redirectPath = decoded.role === "creator"
          ? "/creator/welcome"
          : "/brand/dashboard";
        
        return redirectPath;
      }
    } catch (error) {
      console.error('❌ Error during login:', error);
      
      // Check for saved redirect even in error case
      if (savedRedirect) {
        localStorage.removeItem('redirectAfterLogin');
        return savedRedirect;
      }
      
      return "/";
    }
  };

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authToken");
    setCurrentUser(null);
    setHasChecked(false); // Reset to allow re-checking on next login

    // Force full page reload to homepage to clear all state
    window.location.replace('/');
  };

  const refreshUser = async () => {

    await checkAuthStatus();
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
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
