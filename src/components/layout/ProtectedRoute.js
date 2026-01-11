import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, role, roles, requireMinimalProfile = false }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute check:', {
    currentUser,
    isLoading,
    requiredRole: role,
    requiredRoles: roles,
    requireMinimalProfile,
    minimalProfileCompleted: currentUser?.minimalProfileCompleted,
    currentPath: location.pathname
  });

  // Auth is still loading - AuthGate handles the loading screen globally
  // Don't redirect, just wait
  if (isLoading) {
    console.log('⏳ Still loading in ProtectedRoute - waiting for AuthGate...');
    return null;
  }

  if (!currentUser) {
    console.log('❌ No current user - redirecting to home');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role (support both single role and roles array)
  if (role) {
    const hasRole = currentUser.role === role || currentUser.roles?.includes(role);
    if (!hasRole) {
      console.log(`❌ Role mismatch - user is ${currentUser.role} with roles ${currentUser.roles}, required ${role}`);
      return <Navigate to="/" replace />;
    }
  }

  if (roles) {
    const hasAnyRole = roles.includes(currentUser.role) || roles.some(r => currentUser.roles?.includes(r));
    if (!hasAnyRole) {
      console.log(`❌ Role not in allowed list - user is ${currentUser.role} with roles ${currentUser.roles}, allowed ${roles}`);
      return <Navigate to="/" replace />;
    }
  }

  // Check if minimal profile is required (for dashboard)
  if (requireMinimalProfile && currentUser.role === 'creator') {
    // Approved creators can access dashboard even if minimalProfileCompleted is false
    const isApproved = currentUser.reviewStatus === 'approved' && currentUser.isApproved;
    
    if (!isApproved && !currentUser.minimalProfileCompleted) {
      console.log('❌ Minimal profile not completed - redirecting to welcome');
      console.log('Current user state:', {
        id: currentUser.id,
        role: currentUser.role,
        reviewStatus: currentUser.reviewStatus,
        isApproved: currentUser.isApproved,
        minimalProfileCompleted: currentUser.minimalProfileCompleted,
        fullName: currentUser.fullName
      });
      return <Navigate to="/creator/welcome" replace />;
    }
  }

  console.log('✅ Access granted!');
  return children;
};

export default ProtectedRoute;
