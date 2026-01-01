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
  
  // Check if current path matches any standalone route pattern
  const isStandalone = standaloneRoutes.some(pattern => 
    pattern.test(location.pathname)
  );
  
  return {
    isStandalone,
    showNavbar: !isStandalone,
    showFooter: !isStandalone
  };
};

export default ConditionalLayout;
