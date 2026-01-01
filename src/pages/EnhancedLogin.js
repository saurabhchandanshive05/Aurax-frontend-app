import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import apiClient from "../utils/apiClient";
import styles from "./Login.module.css";

function EnhancedLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, currentUser, isAuthenticated, isLoading } = useAuth();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loginMethod, setLoginMethod] = useState("password"); // 'password', 'otp'
  const [rememberMe, setRememberMe] = useState(false);

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [errors, setErrors] = useState({});

  // Get role from URL params (brand/creator)
  const role = searchParams.get("role") || "brand";
  const isCreatorLogin = role === "creator";

  // Redirect if already logged in
  useEffect(() => {
    // Don't redirect if currently submitting a login
    if (isSubmitting) {
      console.log('⏸️ Login in progress, skipping redirect check');
      return;
    }
    
    console.log('🔐 Login page check - isAuthenticated:', isAuthenticated, 'currentUser:', currentUser, 'isLoading:', isLoading);
    
    // Don't redirect while still loading
    if (isLoading) {
      console.log('⏳ Still loading auth state...');
      return;
    }
    
    if (isAuthenticated && currentUser) {
      const redirectPath = currentUser.role === "creator"
        ? "/creator/welcome"
        : "/brand/dashboard";
      console.log('✅ Already logged in - redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    } else {
      console.log('❌ Not logged in - showing login page');
    }
  }, [isAuthenticated, currentUser, navigate, isLoading, isSubmitting]);

  // Clear messages when switching methods
  useEffect(() => {
    setLoginError("");
    setSuccessMessage("");
    setErrors({});
  }, [loginMethod]);

  // Countdown timer for OTP expiration
  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    if (otpExpiresAt && countdown > 0) {
      const timer = setTimeout(() => {
        const remaining = Math.max(
          0,
          Math.floor((new Date(otpExpiresAt) - new Date()) / 1000)
        );
        setCountdown(remaining);
        if (remaining === 0) {
          setOtpSent(false);
          setOtpExpiresAt(null);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, otpExpiresAt]);

  // Format countdown display
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Please enter a valid email";

    if (loginMethod === "password") {
      if (!password.trim()) newErrors.password = "Password is required";
      else if (password.length < 8)
        newErrors.password = "Password must be at least 8 characters";
    }

    if (loginMethod === "otp") {
      if (!otp.trim()) newErrors.otp = "OTP is required";
      else if (otp.length !== 6) newErrors.otp = "OTP must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Request OTP for login
  const handleRequestOTP = async () => {
    if (!email.trim()) {
      setErrors({ email: "Email is required to send OTP" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Please enter a valid email" });
      return;
    }

    setIsRequestingOTP(true);
    setLoginError("");

    try {
      const response = await apiClient.request("/auth/request-login-otp", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (response.success) {
        setOtpSent(true);
        setOtpExpiresAt(response.expiresAt);
        setCountdown(
          Math.floor((new Date(response.expiresAt) - new Date()) / 1000)
        );
        setSuccessMessage(
          "Login code sent to your email! Please check your inbox."
        );

        // Show development OTP in dev mode
        if (response.developmentOTP) {
          setSuccessMessage(
            `Login code sent! DEV OTP: ${response.developmentOTP}`
          );
        }
      }
    } catch (error) {
      console.error("Request OTP error:", error);
      setLoginError(
        error.response?.data?.message ||
          "Failed to send login code. Please try again."
      );
    } finally {
      setIsRequestingOTP(false);
    }
  };

  // Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setLoginError("");

    try {
      const loginData = {
        email: email.trim().toLowerCase(),
        loginMethod,
        ...(loginMethod === "password"
          ? { password: password.trim() }
          : { otp: otp.trim() }),
      };

      const response = await apiClient.request("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginData),
      });

      if (response.success && response.token) {
        console.log('✅ Login successful! Response:', response);
        console.log('👤 User:', response.user);
        console.log('🔑 Token:', response.token);
        
        // Store token using the login function from AuthContext
        const redirectPath = login(response.token);
        console.log('🔀 Redirect path:', redirectPath);
        
        // Show success message briefly
        setSuccessMessage(
          `Login successful! Welcome back, ${response.user.username}`
        );
        
        // Small delay to ensure state updates propagate
        setTimeout(() => {
          console.log('🚀 Navigating to:', redirectPath);
          navigate(redirectPath, { replace: true });
        }, 100);
      } else {
        console.error('❌ Login failed - no token in response:', response);
        setLoginError('Login failed. Please try again.');
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle specific error cases
      if (error.status === 423) {
        setLoginError(
          error.response?.data?.message || "Account temporarily locked"
        );
      } else if (error.status === 403) {
        setLoginError("Please verify your email before logging in");
      } else {
        setLoginError(
          error.response?.data?.message ||
            "Login failed. Please check your credentials."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        {/* Header */}
        <div className={styles.logoSection}>
          <motion.div
            className={styles.logo}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <div className={styles.logoIcon}></div>
            <span className={styles.logoText}>AURAX</span>
          </motion.div>
          <h1 className={styles.title}>
            {isCreatorLogin ? "🎨 Creator Login" : "🏢 Brand Login"}
          </h1>
          <p className={styles.subtitle}>
            {isCreatorLogin
              ? "Access your creator dashboard and opportunities"
              : "Manage your brand campaigns and partnerships"}
          </p>
        </div>

        {/* Login Method Toggle */}
        <div className={styles.methodToggle}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${
              loginMethod === "password" ? styles.active : ""
            }`}
            onClick={() => setLoginMethod("password")}
          >
            🔐 Password
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${
              loginMethod === "otp" ? styles.active : ""
            }`}
            onClick={() => setLoginMethod("otp")}
          >
            📧 Email Code
          </button>
        </div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {loginError && (
            <motion.div
              className={styles.errorMessage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {loginError}
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              className={styles.successMessage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {/* Email Field */}
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${styles.inputField} ${
                errors.email ? styles.error : ""
              }`}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
            {errors.email && <p className={styles.errorText}>{errors.email}</p>}
          </div>

          {/* Password or OTP Field */}
          <AnimatePresence mode="wait">
            {loginMethod === "password" ? (
              <motion.div
                key="password"
                className={styles.inputGroup}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="password" className={styles.inputLabel}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${styles.inputField} ${
                    errors.password ? styles.error : ""
                  }`}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <p className={styles.errorText}>{errors.password}</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                className={styles.inputGroup}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.otpHeader}>
                  <label htmlFor="otp" className={styles.inputLabel}>
                    Login Code (OTP)
                  </label>
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleRequestOTP}
                      disabled={isRequestingOTP || !email.trim()}
                      className={styles.otpRequestBtn}
                    >
                      {isRequestingOTP ? "Sending..." : "Send Code"}
                    </button>
                  ) : (
                    <span className={styles.otpTimer}>
                      Expires in {formatCountdown(countdown)}
                    </span>
                  )}
                </div>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className={`${styles.inputField} ${styles.otpField} ${
                    errors.otp ? styles.error : ""
                  }`}
                  placeholder="Enter 6-digit code"
                  disabled={isSubmitting || !otpSent}
                  maxLength={6}
                />
                {errors.otp && <p className={styles.errorText}>{errors.otp}</p>}

                {otpSent && countdown === 0 && (
                  <button
                    type="button"
                    onClick={handleRequestOTP}
                    disabled={isRequestingOTP}
                    className={styles.resendBtn}
                  >
                    {isRequestingOTP ? "Sending..." : "Resend Code"}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Additional Options */}
          {loginMethod === "password" && (
            <div className={styles.optionsContainer}>
              <div className={styles.rememberMe}>
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkbox}
                />
                <label htmlFor="remember" className={styles.checkboxLabel}>
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className={styles.forgotPassword}>
                Forgot Password?
              </Link>
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            className={`${styles.submitButton} ${
              isCreatorLogin ? styles.creator : styles.brand
            }`}
            disabled={isSubmitting || (loginMethod === "otp" && !otpSent)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <span className={styles.spinner}></span>
            ) : (
              `Sign In ${loginMethod === "otp" ? "with Code" : "with Password"}`
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <p>
            Don't have an account?{" "}
            <Link
              to={`/signup?role=${role}`}
              className={`${styles.signupLink} ${
                isCreatorLogin ? styles.creator : styles.brand
              }`}
            >
              Sign up here
            </Link>
          </p>

          {/* Switch Role */}
          <div className={styles.switchRole}>
            <span>Looking for </span>
            <Link
              to={`/login?role=${isCreatorLogin ? "brand" : "creator"}`}
              className={`${styles.roleSwitch} ${
                !isCreatorLogin ? styles.creator : styles.brand
              }`}
            >
              {isCreatorLogin ? "Brand Login" : "Creator Login"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedLogin;
