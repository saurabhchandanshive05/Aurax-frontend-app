import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../utils/apiClient";
import styles from "./CreatorLogin_new.module.css";

const CreatorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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
        {/* AURAX Logo */}
        <div className={styles.logoSection}>
          <div className={styles.logoContainer}>
            <img
              src="https://res.cloudinary.com/dzvtsnpr6/image/upload/v1756973830/Copilot_20250904_134350_fyxhey.webp"
              alt="AURAX Logo"
              className={styles.logoImage}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <div className={styles.logoFallback} style={{ display: "none" }}>
              A
            </div>
          </div>
          <h2 className={styles.brandText}>AURAX</h2>
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
              <p className={styles.securityNote}>Your data stays secure</p>
            </div>
            <Link to="/forgot-password" className={styles.forgotPassword}>
              Forgot password?
            </Link>
          </div>

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

        <div className={styles.signupLink}>
          Need help?{" "}
          <Link to="/help" className={styles.signupText}>
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreatorLogin;
