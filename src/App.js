import React, { useEffect, Suspense, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { initStorage } from "./utils/localStorage.js";
import { getApiEndpoint } from "./utils/getApiUrl";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useStandaloneRoute } from "./components/layout/ConditionalLayout";
import AppShell, { FocusShell } from "./components/layout/AppShell";
import { MotionConfig } from "framer-motion";
import { shellFor, isFocusRoute } from "./components/layout/appNav";
import GlobalLoadingScreen from "./components/GlobalLoadingScreen";

// Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import CustomCursor from "./components/CustomCursor";
import CursorSpotlight from "./components/CursorSpotlight";
import ErrorBoundary from "./components/ErrorBoundary";
import HomePage from "./pages/HomePage";

// Lazy components
// /creators lists real, approved creators (the previous CreatorDirectory page advertised tools that
// do not exist; it is kept in the repo, unrouted, pending the legacy-page review)
const CreatorDiscovery = React.lazy(() => import("./pages/CreatorDiscovery"));
// Retired legacy pages (CampaignManager, Analytics, AdminPanel, AddTalent, CreatorProfile,
// CreatorDashboard, CreatorOnboarding, MinimalWelcome) are no longer routed; see src/pages/LEGACY.md.
const BrandDashboard = React.lazy(() => import("./pages/BrandDashboard"));
const CreatorDashboardNew = React.lazy(() => import("./pages/CreatorDashboardNew"));
const PublicPageSetup = React.lazy(() => import("./pages/PublicPageSetup"));
const BrandLogin = React.lazy(() => import("./pages/BrandLogin"));
const CreatorLogin = React.lazy(() => import("./pages/CreatorLogin"));
const ComingSoonPage = React.lazy(() => import("./pages/ComingSoonPage"));
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const BrandsPage = React.lazy(() => import("./pages/BrandsPage"));
const CareersPage = React.lazy(() => import("./pages/CareersPage"));
const ContactPage = React.lazy(() => import("./pages/ContactPage"));
const BrandCollaborations = React.lazy(() =>
  import("./components/BrandCollaborations")
);
const AIMarketing = React.lazy(() => import("./pages/AIMarketing"));
const UGCAutomation = React.lazy(() => import("./pages/UGCAutomation"));
const CreatorCRM = React.lazy(() => import("./pages/CreatorCRM"));
const TrendForecasting = React.lazy(() => import("./pages/TrendForecasting"));
const InfluencerDiscovery = React.lazy(() =>
  import("./pages/InfluencerDiscovery")
);
const DataDrivenGrowth = React.lazy(() => import("./pages/DataDrivenGrowth"));
const Signup = React.lazy(() => import("./pages/Signup"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const Support = React.lazy(() => import("./pages/Support"));
const Help = React.lazy(() => import("./pages/Help"));
const PublicCreatorPage = React.lazy(() => import("./pages/PublicCreatorPage"));
const LiveCampaigns = React.lazy(() => import("./pages/public/LiveCampaignsMobile"));
const CampaignDetail = React.lazy(() => import("./pages/public/CampaignDetail"));
const InquiryForm = React.lazy(() => import("./components/InquiryFormMobile"));
const LoginRedirect = React.lazy(() => import("./pages/LoginRedirect"));
const ConnectSocials = React.lazy(() => import("./pages/ConnectSocials"));

// Creator Onboarding Flow
const WelcomeScreen = React.lazy(() => import("./pages/creator/WelcomeScreen"));
const ProfileSetup = React.lazy(() => import("./pages/creator/ProfileSetup"));
const UnderReview = React.lazy(() => import("./pages/creator/UnderReview"));

// Admin Components
const CampaignCurator = React.lazy(() => import("./pages/admin/CampaignCurator"));
const BrandIntelligence = React.lazy(() => import("./pages/admin/BrandIntelligence"));
const InstagramInfluencerProfiles = React.lazy(() => import("./pages/admin/InstagramInfluencerProfiles"));
const CreatorDatabase = React.lazy(() => import("./pages/admin/CreatorDatabase"));
const AdminCreatorProfile = React.lazy(() => import("./pages/admin/CreatorProfile"));
const CreatorReview = React.lazy(() => import("./pages/admin/CreatorReview"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Mobile navigation component
function MobileNavMenu() {
  const location = useLocation();

  // Only show on mobile and specific routes
  if (window.innerWidth > 767) return null;
  if (
    location.pathname.startsWith("/brand/dashboard") ||
    location.pathname.startsWith("/creator/dashboard")
  )
    return null;

  return null; // Disabled to prevent footer overlap

  /* Commented out mobile navigation - causing footer overlap
  return (
    <nav
      className="mobile-menu"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <Link to="/" className={location.pathname === "/" ? "text-red-500" : ""}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span>Home</span>
      </Link>
      <Link
        to="/creators"
        className={
          location.pathname.startsWith("/creators") ? "text-red-500" : ""
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span>Creators</span>
      </Link>
      <Link
        to="/campaigns"
        className={
          location.pathname.startsWith("/campaigns") ? "text-red-500" : ""
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
          />
        </svg>
        <span>Campaigns</span>
      </Link>
      <Link
        to="/analytics"
        className={
          location.pathname.startsWith("/analytics") ? "text-red-500" : ""
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span>Analytics</span>
      </Link>
    </nav>
  );
  */
}

// Sends each signed-in role (or a guest) to its own page; used for retired legacy URLs
function RoleRedirect({ admin = "/", brand = "/", creator = "/", guest = "/" }) {
  const { currentUser } = useAuth();
  const roles = [currentUser?.role, ...(currentUser?.roles || [])];
  const to = !currentUser
    ? guest
    : roles.includes("admin")
    ? admin
    : roles.includes("brand")
    ? brand
    : roles.includes("creator")
    ? creator
    : guest;
  return <Navigate to={to} replace />;
}

// Layout wrapper component that checks for standalone routes
function AppLayout({ children }) {
  const { showNavbar, showFooter } = useStandaloneRoute();
  const { pathname } = useLocation();
  const area = shellFor(pathname);

  // Signed-in product areas get the app shell instead of the marketing chrome.
  if (area) return <AppShell area={area}>{children}</AppShell>;
  if (isFocusRoute(pathname)) return <FocusShell>{children}</FocusShell>;

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
      {showFooter && <Footer />}
    </>
  );
}

// Auth gate component - prevents any rendering until auth is fully resolved
function AuthGate({ children }) {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <GlobalLoadingScreen message="Verifying authentication..." />;
  }
  
  return children;
}

const IS_DEV = process.env.NODE_ENV !== "production";

function App() {
  const [backendStatus, setBackendStatus] = useState({
    status: "checking",
    message: "Checking backend connection...",
  });
  // Development shows the backend diagnostic; production only speaks up if the API is slow or down
  const [showStatus, setShowStatus] = useState(IS_DEV);

  useEffect(() => {
    initStorage();

    // Clear browser navigation cache on app load to prevent route persistence
    if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD) {
      // Clear any stale navigation state
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    let timeoutId;
    let slowId;
    let cancelled = false;
    let connected = false;
    const startedAt = Date.now();
    // The API host sleeps when idle and can take up to a minute to wake: keep retrying for a
    // while before reporting a failure
    const RETRY_WINDOW_MS = 75000;
    const WAKING = "Connecting to AURAX… this can take up to a minute after a quiet period.";

    const checkBackendConnection = async () => {
      try {
        const response = await fetch(getApiEndpoint("/api/test"));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (cancelled) return;
        connected = true;
        setBackendStatus({
          status: "connected",
          message: IS_DEV ? data.message || "Backend connected successfully" : "Connected",
        });
        if (IS_DEV) timeoutId = setTimeout(() => setShowStatus(false), 5000);
        else setShowStatus(false);
      } catch (error) {
        if (cancelled) return;
        if (Date.now() - startedAt < RETRY_WINDOW_MS) {
          setBackendStatus({
            status: "checking",
            message: IS_DEV ? `Connection failed: ${error.message}. Retrying…` : WAKING,
          });
          setShowStatus(true);
          timeoutId = setTimeout(checkBackendConnection, 5000);
          return;
        }
        setBackendStatus({
          status: "error",
          message: IS_DEV
            ? `Connection failed: ${error.message}`
            : "We can't reach AURAX right now. Please try again in a moment.",
        });
        setShowStatus(true);
      }
    };

    // Production: say something only if the first answer is slow (a sleeping server holds the
    // request open rather than failing)
    if (!IS_DEV) {
      slowId = setTimeout(() => {
        if (!connected && !cancelled) {
          setBackendStatus({ status: "checking", message: WAKING });
          setShowStatus(true);
        }
      }, 4000);
    }

    checkBackendConnection();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      clearTimeout(slowId);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AuthGate>
            <div className="ax-app">
              <CustomCursor />
              <CursorSpotlight />

              {/* Backend status banner */}
              {showStatus && (
                <div
                  className={`ax-status ${
                    backendStatus.status === "connected"
                      ? "ax-status--ok"
                      : backendStatus.status === "error"
                      ? "ax-status--error"
                      : "ax-status--checking"
                  }`}
                  role="status"
                >
                  {backendStatus.message}
              </div>
            )}

            <AppLayout>
              <main className="main-content">
                <ErrorBoundary>
                  <Suspense
                    fallback={
                      <div className="ax-loader" role="status">
                        <div className="ax-ring ax-loader__ring" aria-hidden="true"></div>
                        <span className="ax-sr-only">Loading page</span>
                      </div>
                    }
                  >
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/brands" element={<BrandsPage />} />
                    <Route path="/creators" element={<CreatorDiscovery />} />
                    <Route path="/creators/:id" element={<Navigate to="/creators" replace />} />
                    
                    {/* Public LIVE Campaign Board */}
                    <Route path="/live/campaigns" element={<LiveCampaigns />} />
                    <Route path="/live/campaigns/:id" element={<CampaignDetail />} />
                    
                    {/* Inquiry Form - Gated actions verification */}
                    <Route path="/inquiry/form" element={<InquiryForm />} />
                    
                    {/* Public Creator Page - Fan-facing monetization page */}
                    <Route path="/creator/:slug" element={<PublicCreatorPage />} />
                    {/* Legacy pages that only kept data in the browser: send visitors to the real feature.
                        The page files are kept in the repo (see src/pages/LEGACY.md). */}
                    <Route path="/campaigns" element={<Navigate to="/live/campaigns" replace />} />
                    <Route path="/analytics" element={<RoleRedirect admin="/admin/brand-intelligence" brand="/brand/dashboard" creator="/creator/dashboard" guest="/live/campaigns" />} />
                    <Route path="/careers" element={<CareersPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    
                    {/* Canonical public login entry point - forwards to creator login */}
                    <Route path="/login" element={<LoginRedirect />} />
                    
                    {/* Legacy login routes for backward compatibility */}
                    <Route path="/brand/login" element={<BrandLogin />} />
                    <Route path="/creator/login" element={<CreatorLogin />} />
                    
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                    <Route path="/support" element={<Support />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/coming-soon" element={<ComingSoonPage />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/brand/signup" element={<Signup />} />
                    <Route path="/creator/signup" element={<Signup />} />

                    {/* Social Connection Route */}
                    <Route path="/connect-socials" element={<ConnectSocials />} />
                    
                    {/* Creator Onboarding Flow - Protected for creators only */}
                    <Route 
                      path="/creator/welcome" 
                      element={
                        <ProtectedRoute role="creator">
                          <WelcomeScreen />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/creator/profile-setup" 
                      element={
                        <ProtectedRoute role="creator">
                          <ProfileSetup />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/creator/under-review" 
                      element={
                        <ProtectedRoute role="creator">
                          <UnderReview />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Creator Dashboard - Main dashboard after Instagram OAuth */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute role="creator" requireMinimalProfile={true}>
                          <CreatorDashboardNew />
                        </ProtectedRoute>
                      }
                    />

                    {/* Specialization Routes */}
                    <Route path="/ai-marketing" element={<AIMarketing />} />
                    <Route path="/ugc-automation" element={<UGCAutomation />} />
                    <Route path="/creator-crm" element={<CreatorCRM />} />
                    <Route
                      path="/trend-forecasting"
                      element={<TrendForecasting />}
                    />
                    <Route
                      path="/influencer-discovery"
                      element={<InfluencerDiscovery />}
                    />
                    <Route
                      path="/data-driven-growth"
                      element={<DataDrivenGrowth />}
                    />
                    <Route
                      path="/brand-collaborations"
                      element={
                        <>
                          {/* The section's own heading is an h2 (it also appears on the homepage). */}
                          <h1 className="ax-sr-only">Brand collaborations</h1>
                          <BrandCollaborations />
                        </>
                      }
                    />

                    {/* Protected Routes */}
                    <Route
                      path="/brand/dashboard"
                      element={
                        <ProtectedRoute role="brand">
                          <BrandDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/creator/public-page-setup"
                      element={
                        <ProtectedRoute role="creator" requireMinimalProfile={true}>
                          <PublicPageSetup />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/creator/welcome-old" element={<Navigate to="/creator/welcome" replace />} />
                    <Route
                      path="/creator/dashboard"
                      element={
                        <ProtectedRoute role="creator" requireMinimalProfile={true}>
                          <CreatorDashboardNew />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/creator/dashboard-old" element={<Navigate to="/creator/dashboard" replace />} />
                    <Route
                      path="/add-talent"
                      element={
                        <ProtectedRoute roles={["brand", "admin"]}>
                          <RoleRedirect admin="/admin/brand-intelligence/creators" brand="/brand/dashboard" />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute role="admin">
                          <Navigate to="/admin/brand-intelligence" replace />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/campaigns"
                      element={
                        <ProtectedRoute role="admin">
                          <CampaignCurator />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/brand-intelligence"
                      element={
                        <ProtectedRoute role="admin">
                          <BrandIntelligence />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/influencers"
                      element={
                        <ProtectedRoute role="admin">
                          <InstagramInfluencerProfiles />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/creators"
                      element={
                        <ProtectedRoute role="admin">
                          <CreatorReview />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/brand-intelligence/creators"
                      element={
                        <ProtectedRoute role="admin">
                          <CreatorDatabase />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/brand-intelligence/creators/:id"
                      element={
                        <ProtectedRoute role="admin">
                          <AdminCreatorProfile />
                        </ProtectedRoute>
                      }
                    />

                    {/* Redirects */}
                    <Route
                      path="/brand"
                      element={<Navigate to="/brands" replace />}
                    />
                    <Route
                      path="/creator"
                      element={<Navigate to="/creators" replace />}
                    />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>
            </AppLayout>

            {/* Live Notifications removed as requested */}

            {/* Mobile navigation */}
            <MobileNavMenu />

            {/* Recheck backend button */}
            {backendStatus.status === "error" && (!showStatus || !IS_DEV) && (
              <button
                className="ax-btn ax-btn--danger ax-recheck"
                onClick={() => {
                  setShowStatus(true);
                  // Reload the page to re-run backend connection check
                  window.location.reload();
                }}
                aria-label={IS_DEV ? "Recheck backend connection" : "Try connecting again"}
              >
                {IS_DEV ? "Recheck Backend" : "Try again"}
              </button>
            )}
          </div>
          </AuthGate>
        </Router>
      </AuthProvider>
    </ThemeProvider>
    </MotionConfig>
  );
}

export default App;
