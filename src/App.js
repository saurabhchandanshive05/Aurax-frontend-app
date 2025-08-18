import React, { useEffect, Suspense, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from "react-router-dom";
import { initStorage } from "./utils/localStorage.js";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import BackToTop from "./components/BackToTop";
import CustomCursor from "./components/CustomCursor";
import ErrorBoundary from "./components/ErrorBoundary";
import HomePage from "./pages/HomePage";

// Lazy components
const CreatorDirectory = React.lazy(() => import("./pages/CreatorDirectory"));
const CreatorProfile = React.lazy(() => import("./pages/CreatorProfile"));
const CampaignManager = React.lazy(() => import("./pages/CampaignManager"));
const BrandDashboard = React.lazy(() => import("./pages/BrandDashboard"));
const CreatorDashboard = React.lazy(() => import("./pages/CreatorDashboard"));
const AddTalent = React.lazy(() => import("./pages/AddTalent"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));
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
const CopyEnvironmentTest = React.lazy(() =>
  import("./pages/CopyEnvironmentTest")
);
const TestImageLoad = React.lazy(() => import("./pages/TestImageLoad"));
const ComprehensiveTest = React.lazy(() => import("./pages/ComprehensiveTest"));
const QuickAPITest = React.lazy(() => import("./pages/QuickAPITest"));
const BackendStatus = React.lazy(() => import("./pages/BackendStatus"));
const DeploymentGuide = React.lazy(() => import("./pages/DeploymentGuide"));
const CopyDashboard = React.lazy(() => import("./pages/CopyDashboard"));
const CopyEnvironmentStatus = React.lazy(() => import("./pages/CopyEnvironmentStatus"));
const DirectDatabaseTest = React.lazy(() => import("./pages/DirectDatabaseTest"));
const BackendFix = React.lazy(() => import("./pages/BackendFix"));
const LoginTestReady = React.lazy(() => import("./pages/LoginTestReady"));

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

function App() {
  const [backendStatus, setBackendStatus] = useState({
    status: "checking",
    message: "Checking backend connection...",
  });
  const [showStatus, setShowStatus] = useState(true);

  useEffect(() => {
    initStorage();

    let timeoutId;

    const checkBackendConnection = async () => {
      try {
        const response = await fetch("/api/test");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBackendStatus({
          status: "connected",
          message: data.message || "Backend connected successfully",
        });

        timeoutId = setTimeout(() => setShowStatus(false), 5000);
      } catch (error) {
        setBackendStatus({
          status: "error",
          message: `Connection failed: ${error.message}`,
        });
      }
    };

    checkBackendConnection();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen font-sans bg-[#0d0d1f] text-white overflow-x-hidden">
            <CustomCursor />

            {/* Backend status banner */}
            {showStatus && (
              <div
                className={`status-banner ${
                  backendStatus.status === "connected"
                    ? "bg-green-600"
                    : backendStatus.status === "error"
                    ? "bg-red-600"
                    : "bg-yellow-600"
                }`}
                role="status"
                aria-live="polite"
              >
                <span>{backendStatus.message}</span>
                <button
                  onClick={() => setShowStatus(false)}
                  aria-label="Dismiss status message"
                >
                  Dismiss
                </button>
              </div>
            )}

            <Navbar />

            <main className="main-content">
              <ErrorBoundary>
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center min-h-screen">
                      <div className="loading-spinner rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  }
                >
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/brands" element={<BrandsPage />} />
                    <Route path="/creators" element={<CreatorDirectory />} />
                    <Route path="/creators/:id" element={<CreatorProfile />} />
                    <Route path="/campaigns" element={<CampaignManager />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/careers" element={<CareersPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/brand/login" element={<BrandLogin />} />
                    <Route path="/creator/login" element={<CreatorLogin />} />
                    <Route path="/coming-soon" element={<ComingSoonPage />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Copy Environment Test Route */}
                    <Route
                      path="/copy-test"
                      element={<CopyEnvironmentTest />}
                    />

                    {/* Image Load Test Route */}
                    <Route path="/test-images" element={<TestImageLoad />} />

                    {/* Comprehensive Test Route */}
                    <Route path="/comprehensive-test" element={<ComprehensiveTest />} />

                    {/* Quick API Test Route */}
                    <Route path="/quick-api-test" element={<QuickAPITest />} />

                    {/* Backend Status Route */}
                    <Route path="/backend-status" element={<BackendStatus />} />

                    {/* Deployment Guide Route */}
                    <Route path="/deployment-guide" element={<DeploymentGuide />} />

                    {/* Copy Dashboard Route */}
                    <Route path="/copy-dashboard" element={<CopyDashboard />} />
              <Route path="/copy-status" element={<CopyEnvironmentStatus />} />
              <Route path="/direct-db-test" element={<DirectDatabaseTest />} />
              <Route path="/backend-fix" element={<BackendFix />} />
              <Route path="/login-test" element={<LoginTestReady />} />

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
                      element={<BrandCollaborations />}
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
                      path="/creator/dashboard"
                      element={
                        <ProtectedRoute role="creator">
                          <CreatorDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/add-talent"
                      element={
                        <ProtectedRoute roles={["brand", "admin"]}>
                          <AddTalent />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute role="admin">
                          <AdminPanel />
                        </ProtectedRoute>
                      }
                    />

                    {/* Redirects */}
                    <Route
                      path="/brand"
                      element={<Navigate to="/brand/dashboard" replace />}
                    />
                    <Route
                      path="/brand/*"
                      element={<Navigate to="/brand/dashboard" replace />}
                    />
                    <Route
                      path="/creator"
                      element={<Navigate to="/coming-soon" replace />}
                    />
                    <Route
                      path="/creator/*"
                      element={<Navigate to="/coming-soon" replace />}
                    />
                    {/** creator/login now has a real page above */}

                    {/* 404 */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>

            <Footer />
            <BackToTop />

            {/* Live Notifications removed as requested */}

            {/* Mobile navigation */}
            <MobileNavMenu />

            {/* Recheck backend button */}
            {!showStatus && backendStatus.status === "error" && (
              <button
                className="fixed bottom-16 right-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-700 z-50"
                onClick={() => {
                  setShowStatus(true);
                  // Reload the page to re-run backend connection check
                  window.location.reload();
                }}
                aria-label="Recheck backend connection"
              >
                Recheck Backend
              </button>
            )}
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
