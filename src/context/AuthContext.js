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
        console.log('🧹 Clearing stale redirect on app init:', savedRedirect);
        localStorage.removeItem('redirectAfterLogin');
      }
      
      checkAuthStatus();
    }
  }, [hasChecked]);

  const checkAuthStatus = async () => {
    console.log('🔍 Checking auth status...');
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    console.log('🔑 Token found:', !!token);
    
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
          console.log('✅ Fetched response from API:', responseData);
          
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
          
          console.log('✅ Setting current user with full data:', user);
          setCurrentUser(user);
        } else {
          // Token invalid, decode from JWT as fallback
          const decoded = jwtDecode(token);
          console.log('⚠️ API fetch failed, using JWT decode:', decoded);
          
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
      console.log('❌ No token found');
      setCurrentUser(null);
    }
    setIsLoading(false);
    setHasChecked(true);
  };

  const login = async (token) => {
    console.log('🔐 AuthContext login called with token:', token);
    
    // Check if there's a saved redirect URL (from public creator page)
    const savedRedirect = localStorage.getItem('redirectAfterLogin');
    console.log('🔍 Saved redirect URL:', savedRedirect);
    
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
        console.log('✅ Fetched full response during login:', responseData);
        
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
        
        console.log('👤 Setting current user with complete data:', user);
        setCurrentUser(user);

        // If there's a saved redirect, use it and clear it
        if (savedRedirect) {
          console.log('🔀 Using saved redirect:', savedRedirect);
          localStorage.removeItem('redirectAfterLogin');
          return savedRedirect;
        }

        // Determine redirect based on roles (prioritize admin)
        const hasAdminRole = user.roles.includes('admin') || user.role === 'admin';
        const hasCreatorRole = user.roles.includes('creator') || user.role === 'creator';
        const hasBrandRole = user.role === 'brand';
        
        console.log('📊 User roles:', { hasAdminRole, hasCreatorRole, hasBrandRole, role: user.role, roles: user.roles });
        
        // Admin users go to admin dashboard (even if they're also creators)
        if (hasAdminRole) {
          console.log('🔀 Redirecting to admin dashboard (admin role detected)');
          return "/admin/campaigns";
        }
        
        // For creators, check onboarding status from userData (already fetched)
        if (hasCreatorRole) {
          const { reviewStatus, isApproved } = userData;
          
          console.log('📊 Creator onboarding status:', { reviewStatus, isApproved });
          
          // Redirect based on onboarding state
          if (reviewStatus === 'approved' && isApproved) {
            console.log('🔀 Redirecting to dashboard (approved)');
            return "/creator/dashboard";
          } else if (reviewStatus === 'pending') {
            console.log('🔀 Redirecting to under review (pending)');
            return "/creator/under-review";
          } else if (reviewStatus === 'rejected') {
            console.log('🔀 Redirecting to rejected screen');
            return "/creator/rejected";
          } else {
            // reviewStatus is null/undefined or 'not_submitted'
            console.log('🔀 Redirecting to welcome (not submitted)');
            return "/creator/welcome";
          }
        }
        
        // Brand users go to brand dashboard
        if (hasBrandRole) {
          console.log('🔀 Redirecting to brand dashboard');
          return "/brand/dashboard";
        }
        
        // Fallback
        console.log('🔀 Redirecting to home (no specific role matched)');
        return "/";
      } else {
        // Fallback to JWT decode if API fails
        const decoded = jwtDecode(token);
        console.log('⚠️ API fetch failed during login, using JWT decode:', decoded);
        
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
    console.log('🚪 Logging out...');
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authToken");
    setCurrentUser(null);
    setHasChecked(false); // Reset to allow re-checking on next login
    console.log('✅ Logged out successfully');
    // Force full page reload to homepage to clear all state
    window.location.replace('/');
  };

  const refreshUser = async () => {
    console.log('🔄 Refreshing user data...');
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
