import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Canonical public login entry point
 * Forwards to /creator/login while preserving all query parameters
 */
const LoginRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Preserve all query parameters and forward to creator login
    navigate(`/creator/login${location.search}`, { replace: true });
  }, [navigate, location.search]);

  return null; // No UI needed, just redirect
};

export default LoginRedirect;
