import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../utils/apiClient";
import styles from "./BrandLogin.module.css";

const BrandLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setLoginError("");

    try {
      const sanitized = {
        email: (email || "").trim().toLowerCase(),
        password: (password || "").trim(),
      };
      const resp = await apiClient.login(sanitized);
      
      // Validate that user has brand role
      const userRole = resp.user?.role;
      const userRoles = resp.user?.roles || [];
      const isBrand = userRole === 'brand' || userRoles.includes('brand');
      
      if (!isBrand) {
        setLoginError("Access denied. This portal is for brands only. Please use the appropriate login portal.");
        return;
      }
      
      const redirectPath = login(resp.token);
      navigate(redirectPath);
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message;
      
      if (errorMessage === "Invalid credentials") {
        setLoginError("Invalid email or password. Please try again.");
      } else if (errorMessage) {
        setLoginError(errorMessage);
      } else {
        setLoginError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        {/* AURAX Logo - Top Center */}
        <div className={styles.logoSection}>
          <div className={styles.auraxLogoContainer}>
            <img
              src="https://res.cloudinary.com/dzvtsnpr6/image/upload/v1756973830/Copilot_20250904_134350_fyxhey.webp"
              alt="AURAX Logo"
              className={styles.auraxLogo}
              loading="eager"
              onError={(e) =>
                console.error("Logo failed to load:", e.target.src)
              }
            />
          </div>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>Welcome back!</h1>
          <p className={styles.subtitle}>
            Let's get you signed in to your Brand Portal
          </p>
        </div>

        {loginError && <div className={styles.errorAlert}>{loginError}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.inputField}
              placeholder="Enter your email"
            />
            {errors.email && <p className={styles.errorText}>{errors.email}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.inputLabel}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputField}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className={styles.errorText}>{errors.password}</p>
            )}
          </div>

          <div className={styles.optionsContainer}>
            <div className={styles.rememberMe}>
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={styles.checkbox}
              />
              <label htmlFor="remember" className={styles.rememberLabel}>
                Keep me signed in
              </label>
              <p className={styles.privacyNote}>
                We'll remember you on this device for 30 days
              </p>
            </div>
            <Link to="/forgot-password" className={styles.forgotPassword}>
              Forgot password?
            </Link>
          </div>

          {/* Progressive disclosure for advanced options */}
          <div className={styles.advancedToggle}>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={styles.advancedButton}
            >
              {showAdvanced ? "Hide" : "Show"} advanced options
              <svg
                className={`${styles.toggleIcon} ${
                  showAdvanced ? styles.rotated : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m19 9-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {showAdvanced && (
            <div className={styles.advancedOptions}>
              <div className={styles.inputGroup}>
                <label htmlFor="loginMode" className={styles.inputLabel}>
                  Security Level
                </label>
                <select
                  id="loginMode"
                  className={styles.selectField}
                  defaultValue="standard"
                >
                  <option value="standard">Standard Security</option>
                  <option value="enhanced">Enhanced Security</option>
                  <option value="enterprise">Enterprise Mode</option>
                </select>
              </div>

              <div className={styles.checkboxGroup}>
                <input
                  id="notifications"
                  type="checkbox"
                  className={styles.checkbox}
                  defaultChecked={true}
                />
                <label htmlFor="notifications" className={styles.checkboxLabel}>
                  Send login notifications to my email
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <>
                <svg
                  className={styles.spinner}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    opacity="0.25"
                  />
                  <path
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    opacity="0.75"
                  />
                </svg>
                Signing you in...
              </>
            ) : (
              "Sign in to your account"
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <div className={styles.signupLink}>
            New to our platform?{" "}
            <Link to="/signup?role=brand" className={styles.signupText}>
              Create your brand account
            </Link>
          </div>

          <div className={styles.supportSection}>
            <p className={styles.supportText}>
              Need help?{" "}
              <Link to="/support" className={styles.supportLink}>
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandLogin;
