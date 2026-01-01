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

  if (isLoading) {
    console.log('⏳ Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!currentUser) {
    console.log('❌ No current user - redirecting to home');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (role && currentUser.role !== role) {
    console.log(`❌ Role mismatch - user is ${currentUser.role}, required ${role}`);
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    console.log(`❌ Role not in allowed list - user is ${currentUser.role}, allowed ${roles}`);
    return <Navigate to="/" replace />;
  }

  // Check if minimal profile is required (for dashboard)
  if (requireMinimalProfile && currentUser.role === 'creator' && !currentUser.minimalProfileCompleted) {
    console.log('❌ Minimal profile not completed - redirecting to welcome');
    console.log('Current user state:', {
      id: currentUser.id,
      role: currentUser.role,
      minimalProfileCompleted: currentUser.minimalProfileCompleted,
      fullName: currentUser.fullName
    });
    return <Navigate to="/creator/welcome" replace />;
  }

  console.log('✅ Access granted!');
  return children;
};

export default ProtectedRoute;
