import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../utils/apiClient";
import styles from "./CreatorLogin.module.css";

const CreatorLoginEnhanced = () => {
  const [identifier, setIdentifier] = useState(""); // Can be email or phone
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const newErrors = {};

    if (!identifier) {
      newErrors.identifier = "Email or phone number is required";
    } else {
      // Check if it's email or phone format
      const isEmail = /\S+@\S+\.\S+/.test(identifier);
      const isPhone = /^[+]?[\d\s\-()]{10,15}$/.test(identifier);

      if (!isEmail && !isPhone) {
        newErrors.identifier = "Enter a valid email or phone number";
      }
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setLoginError("");
    setNeedsVerification(false);

    try {
      const sanitized = {
        identifier: identifier.trim(),
        password: password.trim(),
      };

      const resp = await apiClient.login(sanitized);

      if (resp?.success && resp?.token) {
        const redirectPath = login(resp.token);
        navigate(redirectPath);
      }
    } catch (error) {
      console.error("Login failed:", error);

      if (error?.needsVerification) {
        setNeedsVerification(true);
        setLoginError(
          "Please verify your email before logging in. Check your inbox for the verification code."
        );
      } else {
        setLoginError(
          error?.status === 401
            ? "Invalid email/phone or password"
            : "Login failed. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const email = identifier.includes("@") ? identifier : "";
      if (!email) {
        setLoginError("Please enter your email address to resend verification");
        return;
      }

      await apiClient.resendVerification({ email });
      setLoginError("");
      alert("Verification code sent! Check your email.");
    } catch (error) {
      setLoginError("Failed to resend verification code");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1>Welcome Back</h1>
          <p>Sign in to access your creator dashboard</p>
        </div>

        {loginError && (
          <div
            className={`${styles.alert} ${
              needsVerification ? styles.alertWarning : styles.alertError
            }`}
          >
            {loginError}
            {needsVerification && (
              <button
                onClick={handleResendVerification}
                className={styles.resendButton}
              >
                Resend Code
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email or Phone Number</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={`${styles.input} ${
                errors.identifier ? styles.inputError : ""
              }`}
              placeholder="Enter email or phone number"
              autoComplete="username"
            />
            {errors.identifier && (
              <div className={styles.errorMessage}>{errors.identifier}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.input} ${
                errors.password ? styles.inputError : ""
              }`}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && (
              <div className={styles.errorMessage}>{errors.password}</div>
            )}
          </div>

          <div className={styles.formRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={styles.checkbox}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`${styles.submitButton} ${
              isSubmitting ? styles.buttonLoading : ""
            }`}
          >
            {isSubmitting ? (
              <span className={styles.loader}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <div className={styles.footer}>
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className={styles.signupLink}>
              Sign up
            </Link>
          </p>
        </div>

        {/* Instagram Integration Preview */}
        <div className={styles.instagramPreview}>
          <div className={styles.instagramIcon}>📱</div>
          <p>
            After login, connect your Instagram to unlock advanced analytics and
            content insights!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreatorLoginEnhanced;
