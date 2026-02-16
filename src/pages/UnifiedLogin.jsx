import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import RoleSelectionModal from "../components/RoleSelectionModal";
import styles from "./BrandLogin.module.css";

const UnifiedLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const navigate = useNavigate();

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
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/api/auth/login`,
        {
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }
      );

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store token
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Check if user is an existing verified creator
        if (user.roles?.includes('creator') && user.creatorVerified) {
          // Existing creator - go directly to dashboard
          navigate("/dashboard");
        } else {
          // New user or unverified - show role selection
          setShowRoleSelection(true);
        }
      }
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

  const handleRoleModalClose = () => {
    setShowRoleSelection(false);
    // If user skips role selection, go to dashboard
    navigate("/dashboard");
  };

  return (
    <>
      <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.loginHeader}>
              <h1>Welcome to AURAX</h1>
              <p>Sign in to your account</p>
            </div>

            {loginError && (
              <div className={styles.errorAlert}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  className={errors.email ? styles.inputError : ""}
                  placeholder="your@email.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <span className={styles.errorText}>{errors.email}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  className={errors.password ? styles.inputError : ""}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {errors.password && (
                  <span className={styles.errorText}>{errors.password}</span>
                )}
              </div>

              <div className={styles.formOptions}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className={styles.loginFooter}>
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className={styles.signupLink}>
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {showRoleSelection && (
        <RoleSelectionModal onClose={handleRoleModalClose} />
      )}
    </>
  );
};

export default UnifiedLogin;
