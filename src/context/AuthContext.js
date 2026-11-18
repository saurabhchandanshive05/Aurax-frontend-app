import React, { createContext, useState, useContext, useEffect } from "react";
import { getApiEndpoint } from "../utils/getApiUrl";

const AuthContext = createContext();

const clearStoredTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("authToken");
};

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
          // Never trust a decoded JWT; only the server can validate it
          if (response.status === 401 || response.status === 403) {
            clearStoredTokens();
          }
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setCurrentUser(null);
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
        // Session could not be verified by the server - do not trust the JWT
        clearStoredTokens();
        setCurrentUser(null);
        return "/";
      }
    } catch (error) {
      console.error('❌ Error during login:', error);
      clearStoredTokens();
      setCurrentUser(null);
      return "/";
    }
  };

  const logout = async () => {
    // Tell the server this session has ended so the token stops working everywhere it may have been
    // copied. Only this session's token is ended; other devices stay signed in. Never blocks sign-out:
    // if the request fails or takes more than 3 seconds, sign-out continues locally as before.
    const token = localStorage.getItem("token") || sessionStorage.getItem("token") || localStorage.getItem("authToken");
    if (token) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      try {
        await fetch(getApiEndpoint("/api/auth/logout"), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
          signal: controller.signal,
        });
      } catch {
        // offline or server unreachable: still sign out locally
      } finally {
        clearTimeout(timer);
      }
    }

    clearStoredTokens();
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
