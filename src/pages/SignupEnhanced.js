import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../utils/apiClient";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "brand",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Set role from URL parameter if provided
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && (roleParam === "brand" || roleParam === "creator")) {
      setForm((prev) => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const validate = () => {
    const v = {};
    if (!form.username.trim()) v.username = "Username is required";

    // Email validation
    const email = form.email.trim().toLowerCase();
    if (!email) v.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      v.email = "Email is invalid";

    // Phone validation
    const phone = form.phone.trim();
    if (!phone) v.phone = "Phone number is required";
    else if (!/^[+]?[\d\s\-()]{10,15}$/.test(phone))
      v.phone = "Phone number is invalid";

    // Password validation
    if (!form.password.trim()) v.password = "Password is required";
    else if (form.password.trim().length < 8) v.password = "Min 8 characters";

    setErrors(v);
    return Object.keys(v).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password.trim(),
        role: form.role,
      };

      // Register user and send verification email
      const resp = await apiClient.register(payload);

      if (resp?.success) {
        setVerificationSent(true);
        setSuccessMessage(
          "🎉 Registration initiated! We've sent a verification code to your email. Please check your inbox and enter the code below."
        );
      }
    } catch (err) {
      const isDup = err?.status === 409;
      const isBad = err?.status === 400;
      setSubmitError(
        isDup
          ? "Email or phone already in use"
          : isBad
          ? "Please fix the highlighted errors"
          : "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle email verification
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setSubmitError("Please enter the verification code");
      return;
    }

    setIsVerifying(true);
    setSubmitError("");

    try {
      const resp = await apiClient.verifyEmail({
        email: form.email.trim().toLowerCase(),
        code: verificationCode.trim(),
      });

      if (resp?.success && resp?.token) {
        setSuccessMessage(
          "✅ Email verified successfully! Redirecting to dashboard..."
        );

        // Auto-login after successful verification
        setTimeout(() => {
          const redirect = login(resp.token);
          navigate(redirect);
        }, 2000);
      }
    } catch (err) {
      setSubmitError(
        err?.status === 400
          ? "Invalid or expired verification code"
          : "Verification failed. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(20,20,40,0.6)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
          {verificationSent ? "Verify Email" : "Create your account"}
        </h1>
        <p style={{ opacity: 0.8, marginBottom: 16 }}>
          {verificationSent
            ? "Enter the verification code sent to your email"
            : "Sign up to get instant access."}
        </p>

        {submitError && (
          <div
            style={{
              background: "#2b1a1a",
              color: "#ffb3b3",
              padding: 10,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            {submitError}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              background: "#1a2b1a",
              color: "#b3ffb3",
              padding: 15,
              borderRadius: 8,
              marginBottom: 12,
              textAlign: "center",
              border: "1px solid #4caf50",
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Show verification form after registration */}
        {verificationSent ? (
          <form onSubmit={handleVerifyEmail}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>📧</div>
              <p style={{ opacity: 0.8, fontSize: 14 }}>
                We sent a 6-digit code to <strong>{form.email}</strong>
              </p>
            </div>

            <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength="6"
              style={{
                width: "100%",
                marginTop: 6,
                marginBottom: 14,
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.25)",
                color: "#fff",
                textAlign: "center",
                fontSize: 18,
                letterSpacing: 2,
              }}
              placeholder="000000"
              autoComplete="one-time-code"
            />

            <button
              type="submit"
              disabled={isVerifying}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                background: isVerifying
                  ? "#26324a"
                  : "linear-gradient(90deg,#2563eb,#22d3ee)",
                color: "#fff",
                border: 0,
                cursor: isVerifying ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {isVerifying ? "Verifying..." : "Verify Email"}
            </button>

            <div style={{ marginTop: 14, textAlign: "center" }}>
              <button
                type="button"
                onClick={() => {
                  setVerificationSent(false);
                  setVerificationCode("");
                  setSuccessMessage("");
                  setSubmitError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#60a5fa",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: 14,
                }}
              >
                ← Back to registration
              </button>
            </div>
          </form>
        ) : (
          /* Original registration form */
          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>
              Username
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              style={{
                width: "100%",
                marginTop: 6,
                marginBottom: 10,
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.25)",
                color: "#fff",
              }}
              placeholder="Your name"
            />
            {errors.username && (
              <div
                style={{
                  color: "#ff9f9f",
                  fontSize: 12,
                  marginTop: -6,
                  marginBottom: 8,
                }}
              >
                {errors.username}
              </div>
            )}

            <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              style={{
                width: "100%",
                marginTop: 6,
                marginBottom: 10,
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.25)",
                color: "#fff",
              }}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && (
              <div
                style={{
                  color: "#ff9f9f",
                  fontSize: 12,
                  marginTop: -6,
                  marginBottom: 8,
                }}
              >
                {errors.email}
              </div>
            )}

            <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>
              Phone Number
            </label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              style={{
                width: "100%",
                marginTop: 6,
                marginBottom: 10,
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.25)",
                color: "#fff",
              }}
              placeholder="+1 (555) 123-4567"
              autoComplete="tel"
            />
            {errors.phone && (
              <div
                style={{
                  color: "#ff9f9f",
                  fontSize: 12,
                  marginTop: -6,
                  marginBottom: 8,
                }}
              >
                {errors.phone}
              </div>
            )}

            <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              style={{
                width: "100%",
                marginTop: 6,
                marginBottom: 10,
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.25)",
                color: "#fff",
              }}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            {errors.password && (
              <div
                style={{
                  color: "#ff9f9f",
                  fontSize: 12,
                  marginTop: -6,
                  marginBottom: 8,
                }}
              >
                {errors.password}
              </div>
            )}

            <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>
              Role
            </label>
            <div style={{ display: "flex", gap: 12, margin: "6px 0 14px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  name="role"
                  value="brand"
                  checked={form.role === "brand"}
                  onChange={handleChange}
                />
                Brand
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  name="role"
                  value="creator"
                  checked={form.role === "creator"}
                  onChange={handleChange}
                />
                Creator
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                background: submitting
                  ? "#26324a"
                  : "linear-gradient(90deg,#2563eb,#22d3ee)",
                color: "#fff",
                border: 0,
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}

        <div style={{ marginTop: 14, fontSize: 14, opacity: 0.9 }}>
          Already have an account?{" "}
          <Link to="/brand/login" style={{ color: "#60a5fa" }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
