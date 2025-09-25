import React, { useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../utils/apiClient";
import styles from "./ForgotPassword.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError("Email address is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      // Simulate API call for password reset
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setEmailSent(true);
      setMessage(
        "Password reset instructions have been sent to your email address. Please check your inbox and follow the instructions to reset your password."
      );
    } catch (err) {
      setError(
        "Failed to send reset email. Please try again or contact support."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage("Reset email sent again. Please check your inbox.");
    } catch (err) {
      setError("Failed to resend email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className={styles.forgotContainer}>
        <div className={styles.forgotCard}>
          <div className={styles.header}>
            <div className={styles.iconContainer}>
              <svg
                className={styles.successIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className={styles.title}>Check Your Email</h1>
            <p className={styles.subtitle}>
              We've sent password reset instructions to:
            </p>
            <p className={styles.emailAddress}>{email}</p>
          </div>

          {message && <div className={styles.successAlert}>{message}</div>}
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className={styles.actionButtons}>
            <button
              onClick={handleResendEmail}
              disabled={isSubmitting}
              className={styles.resendButton}
            >
              {isSubmitting ? "Sending..." : "Resend Email"}
            </button>

            <Link to="/brand/login" className={styles.backButton}>
              Back to Login
            </Link>
          </div>

          <div className={styles.helpSection}>
            <p className={styles.helpText}>
              Didn't receive the email? Check your spam folder or{" "}
              <Link to="/support" className={styles.supportLink}>
                contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.forgotContainer}>
      <div className={styles.forgotCard}>
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <svg
              className={styles.lockIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className={styles.title}>Forgot Your Password?</h1>
          <p className={styles.subtitle}>
            No worries! Enter your email address and we'll send you a link to
            reset your password.
          </p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

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
              placeholder="Enter your email address"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <>
                <svg className={styles.spinner} viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    opacity="0.25"
                  />
                  <path
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    opacity="0.75"
                  />
                </svg>
                Sending Reset Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <Link to="/brand/login" className={styles.backToLogin}>
            ← Back to Login
          </Link>

          <div className={styles.supportSection}>
            <p className={styles.supportText}>
              Need help?{" "}
              <Link to="/support" className={styles.supportLink}>
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
