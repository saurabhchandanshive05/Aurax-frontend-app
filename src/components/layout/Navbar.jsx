import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  // Memoize toggle function for performance
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle body overflow when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  // Close menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Active link helper
  const isActive = useCallback(
    (path) => {
      return location.pathname === path;
    },
    [location]
  );

  // Navigation items
  const navItems = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/brands", label: "For Brands" },
    { path: "/creators", label: "For Creators" },
  ];

  const featureItems = [
    { path: "/ai-marketing", label: "AI Marketing" },
    { path: "/ugc-automation", label: "UGC Automation" },
    { path: "/creator-crm", label: "Creator CRM" },
    { path: "/influencer-discovery", label: "Influencer Discovery" },
  ];

  return (
    <>
      <motion.nav
        className={`navbar ${scrolled ? "scrolled" : ""}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Optimized Background Effects */}
        <div className="navbar-background-effects">
          <div className="navbar-gradient-overlay"></div>
        </div>
        <div className="nav-container">
          {/* AURAX Logo */}
          <Link to="/" className="logo">
            <motion.div
              className="logo-container"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="aurax-logo aurax-logo-pulse"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                onMouseEnter={(e) => {
                  // Add streak animation on hover
                  const streakEl = document.createElement("div");
                  streakEl.className = "aurax-nav-streak";
                  e.target.appendChild(streakEl);
                  setTimeout(() => streakEl.remove(), 600);
                }}
              >
                AURAX
              </motion.span>
              <div className="logo-glow" />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                onHoverStart={() => setHoveredItem(item.path)}
                onHoverEnd={() => setHoveredItem(null)}
              >
                <Link
                  to={item.path}
                  className={`aurax-nav-link ${
                    isActive(item.path) ? "active" : ""
                  }`}
                  onClick={(e) => {
                    // Add streak animation on click
                    const navContainer = e.target.closest(".nav-links");
                    if (navContainer) {
                      const streakEl = document.createElement("div");
                      streakEl.className = "aurax-nav-streak";
                      navContainer.appendChild(streakEl);
                      setTimeout(() => streakEl.remove(), 600);
                    }
                  }}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}

            {/* Features Dropdown */}
            <motion.div
              className="nav-dropdown"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover="hover"
            >
              <motion.span
                className={`aurax-nav-link ${
                  location.pathname.startsWith("/features") ||
                  featureItems.some((item) => location.pathname === item.path)
                    ? "active"
                    : ""
                }`}
              >
                Features
                <motion.svg
                  className="dropdown-arrow"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                  variants={{
                    hover: { rotate: 180 },
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <path d="M2 4l4 4 4-4H2z" />
                </motion.svg>
                <motion.div
                  className="nav-link-underline"
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: featureItems.some(
                      (item) => location.pathname === item.path
                    )
                      ? 1
                      : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              </motion.span>

              <motion.div
                className="dropdown-content"
                variants={{
                  hover: {
                    opacity: 1,
                    y: 0,
                    visibility: "visible",
                    transition: {
                      duration: 0.3,
                      staggerChildren: 0.05,
                      delayChildren: 0.1,
                    },
                  },
                }}
                initial={{
                  opacity: 0,
                  y: 10,
                  visibility: "hidden",
                }}
              >
                {featureItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    variants={{
                      hover: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.3 },
                      },
                    }}
                    initial={{ opacity: 0, x: -10 }}
                  >
                    <Link to={item.path} className="dropdown-link">
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Auth Actions */}
            {!isAuthenticated ? (
              <motion.div
                className="auth-actions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/brand/login" className="aurax-button-brand">
                    <span>Brand Login</span>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/creator/login" className="aurax-button-creator">
                    <span>Creator Login</span>
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                className="user-actions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="user-info">
                  <motion.div
                    className="user-badge"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {user?.name?.charAt(0) || "U"}
                  </motion.div>
                  <div>
                    <div className="user-name">{user?.name}</div>
                    <div className="user-type">{user?.role}</div>
                  </div>
                </div>
                <motion.button
                  className="logout-btn"
                  onClick={logout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Creative Morphing Hamburger Menu */}
          <motion.button
            className={`hamburger-creative ${isMenuOpen ? "menu-open" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle mobile menu"
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            initial={{ opacity: 0, rotate: -180, scale: 0 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
          >
            {/* Morphing Background Circle */}
            <motion.div
              className="hamburger-bg"
              animate={{
                scale: isMenuOpen ? 1.5 : 1,
                rotate: isMenuOpen ? 360 : 0,
                background: isMenuOpen
                  ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />

            {/* Creative Morphing Lines */}
            <div className="hamburger-lines">
              <motion.span
                className="line line-1"
                animate={
                  isMenuOpen
                    ? {
                        rotate: 45,
                        y: 8,
                        scaleX: 1.2,
                        backgroundColor: "#ffffff",
                      }
                    : {
                        rotate: 0,
                        y: 0,
                        scaleX: 1,
                        backgroundColor: "#ffffff",
                      }
                }
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
              <motion.span
                className="line line-2"
                animate={
                  isMenuOpen
                    ? {
                        opacity: 0,
                        scaleX: 0,
                        rotate: 180,
                      }
                    : {
                        opacity: 1,
                        scaleX: 1,
                        rotate: 0,
                      }
                }
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
              <motion.span
                className="line line-3"
                animate={
                  isMenuOpen
                    ? {
                        rotate: -45,
                        y: -8,
                        scaleX: 1.2,
                        backgroundColor: "#ffffff",
                      }
                    : {
                        rotate: 0,
                        y: 0,
                        scaleX: 1,
                        backgroundColor: "#ffffff",
                      }
                }
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>

            {/* Pulse Ring Effect */}
            <motion.div
              className="hamburger-pulse"
              animate={
                isMenuOpen
                  ? {
                      scale: [1, 2, 1],
                      opacity: [0.8, 0, 0.8],
                    }
                  : {
                      scale: 1,
                      opacity: 0,
                    }
              }
              transition={{
                duration: 1.5,
                repeat: isMenuOpen ? Infinity : 0,
                ease: "easeInOut",
              }}
            />

            {/* Sparkle Effects */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={`hamburger-sparkle sparkle-${i + 1}`}
                animate={
                  isMenuOpen
                    ? {
                        scale: [0, 1, 0],
                        rotate: [0, 360],
                        opacity: [0, 1, 0],
                      }
                    : {
                        scale: 0,
                        opacity: 0,
                      }
                }
                transition={{
                  duration: 1,
                  delay: i * 0.2,
                  repeat: isMenuOpen ? Infinity : 0,
                  repeatDelay: 1,
                }}
              />
            ))}
          </motion.button>
        </div>

        {/* Premium Accent Line */}
        <motion.div
          className="nav-accent-line"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        />
      </motion.nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={toggleMenu}
            />

            {/* Mobile Drawer - Optimized */}
            <motion.div
              className="mobile-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "tween",
                ease: "easeInOut",
                duration: 0.3,
              }}
            >
              {/* Simplified Background Effects */}
              <div className="mobile-drawer-background">
                <div className="bg-gradient-1"></div>
                <div className="bg-gradient-2"></div>
              </div>
              <div className="mobile-content">
                {/* Mobile Header */}
                <motion.div
                  className="mobile-header"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <span className="mobile-title">Navigation</span>
                  <motion.button
                    className="mobile-close"
                    onClick={toggleMenu}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.button>
                </motion.div>

                {/* Mobile Auth Actions - moved above nav links */}
                {!isAuthenticated ? (
                  <motion.div
                    className="mobile-auth-actions"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/brand/login"
                        className="aurax-button-brand"
                        onClick={toggleMenu}
                      >
                        <span>Brand Login</span>
                      </Link>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/creator/login"
                        className="aurax-button-creator"
                        onClick={toggleMenu}
                      >
                        <span>Creator Login</span>
                      </Link>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="mobile-user-actions"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <div className="mobile-user-info">
                      <motion.div
                        className="user-badge"
                        whileTap={{ scale: 0.9 }}
                      >
                        {user?.name?.charAt(0) || "U"}
                      </motion.div>
                      <div>
                        <div className="user-name">{user?.name}</div>
                        <div className="user-type">{user?.role}</div>
                      </div>
                    </div>
                    <motion.button
                      className="mobile-logout-btn"
                      onClick={() => {
                        logout();
                        toggleMenu();
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Logout
                    </motion.button>
                  </motion.div>
                )}

                {/* Mobile Navigation Links */}
                <motion.div
                  className="mobile-nav-links"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                >
                  {navItems.map((item, index) => {
                    const getIcon = (path) => {
                      switch (path) {
                        case "/":
                          return (
                            <svg
                              className="mobile-nav-icon"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                            </svg>
                          );
                        case "/about":
                          return (
                            <svg
                              className="mobile-nav-icon"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                            </svg>
                          );
                        case "/brands":
                          return (
                            <svg
                              className="mobile-nav-icon"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
                            </svg>
                          );
                        case "/creators":
                          return (
                            <svg
                              className="mobile-nav-icon"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.996 3.996 0 0 0 16.06 6c-.8 0-1.54.37-2.01.97l-.91 1.11c-.33.4-.26 1.01.15 1.34.41.33 1.01.26 1.34-.15L15.5 8.5l1.46 4.37L12 15.5V22h-2v-6.5L7.5 13 5 16v6H3v-6.36c0-.8.31-1.56.87-2.13l3.58-3.58a1.499 1.499 0 0 1 2.12 0L12 12.36V9.5l-.87-.87A1.499 1.499 0 0 1 12 7.5c.4 0 .78.16 1.06.44l2.44 2.44L16 18v4h4z" />
                            </svg>
                          );
                        default:
                          return null;
                      }
                    };

                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index + 0.4 }}
                      >
                        <Link
                          to={item.path}
                          className={`mobile-nav-link ${
                            isActive(item.path) ? "active" : ""
                          }`}
                          onClick={toggleMenu}
                        >
                          <div className="mobile-nav-content">
                            {getIcon(item.path)}
                            <span className="mobile-nav-text">
                              {item.label}
                            </span>
                          </div>
                          {isActive(item.path) && (
                            <motion.div
                              className="mobile-active-indicator"
                              layoutId="mobileActiveIndicator"
                            />
                          )}
                          <motion.div
                            className="mobile-nav-arrow"
                            initial={{ x: -10, opacity: 0 }}
                            animate={
                              isActive(item.path)
                                ? { x: 0, opacity: 1 }
                                : { x: -10, opacity: 0 }
                            }
                            transition={{ duration: 0.3 }}
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                            </svg>
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Mobile Features Section */}
                  <motion.div
                    className="mobile-features-section"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    style={{ marginBottom: 0 }} // Remove extra margin below features
                  >
                    <div className="mobile-section-title">Features</div>
                    {featureItems.map((item, index) => (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index + 1.3 }}
                      >
                        <Link
                          to={item.path}
                          className="mobile-feature-link"
                          onClick={toggleMenu}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
