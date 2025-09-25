import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../utils/apiClient";
import instagramAPI from "../utils/instagramAPI";
import styles from "./CreatorLogin.module.css";

const CreatorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Instagram test states
  const [instagramTestLoading, setInstagramTestLoading] = useState(false);
  const [instagramTestResult, setInstagramTestResult] = useState(null);

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
        emailOrPhone: (email || "").trim().toLowerCase(),
        password: (password || "").trim(),
      };
      const resp = await apiClient.login(sanitized);

      if (resp?.success && resp?.token) {
        const redirectPath = login(resp.token);
        navigate(redirectPath);
      } else {
        throw new Error(resp?.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginError(
        err?.error || err?.message || "Login failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instagram authentication test
  const handleInstagramTest = async () => {
    setInstagramTestLoading(true);
    setInstagramTestResult(null);

    try {
      const result = await instagramAPI.quickAuthTest();
      setInstagramTestResult(result);
    } catch (error) {
      setInstagramTestResult({
        success: false,
        error: error.message,
        message: "Test failed",
      });
    } finally {
      setInstagramTestLoading(false);
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
              onLoad={() => console.log("AURAX logo loaded")}
              onError={(e) =>
                console.error("Logo failed to load:", e.target.src)
              }
            />
          </div>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>Welcome back, Creator!</h1>
          <p className={styles.subtitle}>
            Let's get started on your next masterpiece
          </p>
        </div>

        {loginError && <div className={styles.errorAlert}>{loginError}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>
              Email
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
                Remember me
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
                  Login Mode
                </label>
                <select
                  id="loginMode"
                  className={styles.selectField}
                  defaultValue="standard"
                >
                  <option value="standard">Standard</option>
                  <option value="secure">High Security</option>
                </select>
              </div>

              <div className={styles.checkboxGroup}>
                <input
                  id="keepSession"
                  type="checkbox"
                  className={styles.checkbox}
                  defaultChecked={true}
                />
                <label htmlFor="keepSession" className={styles.checkboxLabel}>
                  Keep session active across browser tabs
                </label>
              </div>

              {/* Instagram API Test Section */}
              <div className={styles.instagramTestSection}>
                <div className={styles.testHeader}>
                  <label className={styles.inputLabel}>
                    Instagram API Connection Test
                  </label>
                  <p className={styles.testDescription}>
                    Test your Instagram Business account connection before
                    logging in
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleInstagramTest}
                  disabled={instagramTestLoading}
                  className={styles.testButton}
                >
                  {instagramTestLoading && (
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
                  )}
                  <svg
                    className={styles.instagramIcon}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  {instagramTestLoading
                    ? "Testing..."
                    : "Test Instagram Connection"}
                </button>

                {/* Instagram test results */}
                {instagramTestResult && (
                  <div
                    className={`${styles.testResult} ${
                      instagramTestResult.success
                        ? styles.testSuccess
                        : styles.testError
                    }`}
                  >
                    <div className={styles.testStatus}>
                      {instagramTestResult.success ? (
                        <>
                          <svg
                            className={styles.statusIcon}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                          <span>Instagram Connection Successful!</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className={styles.statusIcon}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Instagram Connection Failed</span>
                        </>
                      )}
                    </div>

                    {instagramTestResult.success &&
                      instagramTestResult.data && (
                        <div className={styles.testDetails}>
                          <p>
                            <strong>Username:</strong> @
                            {instagramTestResult.data.username}
                          </p>
                          <p>
                            <strong>Account Type:</strong>{" "}
                            {instagramTestResult.data.account_type}
                          </p>
                          <p>
                            <strong>Account ID:</strong>{" "}
                            {instagramTestResult.data.id}
                          </p>
                        </div>
                      )}

                    {!instagramTestResult.success && (
                      <div className={styles.testErrorDetails}>
                        <p>
                          <strong>Error:</strong> {instagramTestResult.error}
                        </p>
                        <div className={styles.troubleshooting}>
                          <strong>Quick fixes:</strong>
                          <ul>
                            <li>
                              Ensure your Instagram account is set to
                              Business/Creator
                            </li>
                            <li>
                              Check your access token is valid and not expired
                            </li>
                            <li>
                              Verify your account is linked to a Facebook Page
                            </li>
                          </ul>
                          <p className={styles.setupGuideLink}>
                            Need help?{" "}
                            <Link to="/help/instagram-setup">
                              View setup guide →
                            </Link>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting && (
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
            )}
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className={styles.footerLinks}>
          <div className={styles.signupLink}>
            Don't have an account?{" "}
            <Link to="/signup?role=creator" className={styles.signupText}>
              Sign up here
            </Link>
          </div>

          <div className={styles.helpLinks}>
            <Link to="/help" className={styles.helpLink}>
              Need help?
            </Link>
            {" • "}
            <Link to="/support" className={styles.helpLink}>
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorLogin;
