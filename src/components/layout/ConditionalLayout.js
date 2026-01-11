import { useLocation } from 'react-router-dom';

/**
 * Layout wrapper to conditionally show/hide Navbar and Footer
 * Used to create standalone pages like creator public pages
 */
const ConditionalLayout = ({ children, showNavbar = true, showFooter = true }) => {
  return (
    <>
      {children}
    </>
  );
};

/**
 * Hook to determine if current route should have header/footer
 */
export const useStandaloneRoute = () => {
  const location = useLocation();
  
  // Routes that should be standalone (no header/footer)
  const standaloneRoutes = [
    /^\/creator\/[^/]+$/,  // /creator/:slug pattern (but not /creator/login, /creator/dashboard)
  ];
  
  // Routes that should NEVER be standalone (always show header/footer)
  const alwaysShowHeaderFooter = [
    /^\/creator\/login$/,
    /^\/creator\/signup$/,
    /^\/creator\/dashboard/,
    /^\/creator\/welcome$/,
    /^\/creator\/profile-setup$/,
    /^\/creator\/under-review$/,
  ];
  
  // Check if route should always show header/footer
  const shouldAlwaysShow = alwaysShowHeaderFooter.some(pattern => 
    pattern.test(location.pathname)
  );
  
  // Check if current path matches any standalone route pattern
  const isStandalone = !shouldAlwaysShow && standaloneRoutes.some(pattern => 
    pattern.test(location.pathname)
  );
  
  return {
    isStandalone,
    showNavbar: !isStandalone,
    showFooter: !isStandalone
  };
};

export default ConditionalLayout;
