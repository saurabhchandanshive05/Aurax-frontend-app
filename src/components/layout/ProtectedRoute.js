import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, role, roles, requireMinimalProfile = false }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();
  // Auth is still loading - AuthGate handles the loading screen globally
  // Don't redirect, just wait
  if (isLoading) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role (support both single role and roles array)
  if (role) {
    const hasRole = currentUser.role === role || currentUser.roles?.includes(role);
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  if (roles) {
    const hasAnyRole = roles.includes(currentUser.role) || roles.some(r => currentUser.roles?.includes(r));
    if (!hasAnyRole) {
      return <Navigate to="/" replace />;
    }
  }

  // Check if minimal profile is required (for dashboard)
  if (requireMinimalProfile && currentUser.role === 'creator') {
    // Approved creators can access dashboard even if minimalProfileCompleted is false
    const isApproved = currentUser.reviewStatus === 'approved' && currentUser.isApproved;
    
    if (!isApproved && !currentUser.minimalProfileCompleted) {
      return <Navigate to="/creator/welcome" replace />;
    }
  }
  return children;
};

export default ProtectedRoute;
