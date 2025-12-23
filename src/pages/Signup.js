import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../utils/apiClient";

// Add CSS animations
const animationStyles = `
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }
  
  @keyframes bounceIn {
    0% { opacity: 0; transform: scale(0.3); }
    50% { opacity: 1; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  @keyframes slideInUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`;

// Inject styles if not already present
if (!document.getElementById("signup-animations")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "signup-animations";
  styleSheet.textContent = animationStyles;
  document.head.appendChild(styleSheet);
}

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    username: "",
    email: "",
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
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState(null);
  // Remove unused variable to fix eslint warning
  // const [showLoginPrompt, setShowLoginPrompt] = useState(false);

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

  // Handle email verification
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setSubmitError("Please enter the verification code");
      return;
    }

    setIsVerifying(true);
    setSubmitError("");
    setSuccessMessage(""); // Clear any previous success messages

    try {
      const resp = await apiClient.verifyEmail({
        email: form.email.trim().toLowerCase(),
        code: verificationCode.trim(),
      });

      if (resp?.success) {
        // ENHANCED: Clear any previous errors and show success immediately
        setSubmitError("");
        setSuccessMessage("🎉 Email verified successfully! Welcome to Aurax!");

        // Show success screen after successful verification
        setShowSuccessScreen(true);
        setVerificationSent(false); // Hide verification screen

        // ENHANCED: Show temporary success message before redirect
        setTimeout(() => {
          setSuccessMessage("✅ Account verified! Preparing your dashboard...");
        }, 1500);

        // Auto-redirect after 4 seconds (increased for better UX)
        setAutoRedirectCountdown(4);
        const redirectTimer = setInterval(() => {
          setAutoRedirectCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(redirectTimer);
              setSuccessMessage("🚀 Redirecting to setup your profile...");

              // Handle login and redirect
              if (resp?.token) {
                login(resp.token);
                // Always redirect creators to onboarding after signup
                const redirect = form.role === "creator" 
                  ? "/creator/welcome" 
                  : "/brand/dashboard";
                navigate(redirect);
              } else {
                // Fallback if no token - go to login page
                navigate(
                  form.role === "creator" ? "/creator/login" : "/brand/login"
                );
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (resp?.success && !resp?.token) {
        // ENHANCED: Handle success without token (some verification responses)
        setSubmitError("");
        setSuccessMessage("🎉 Email verified successfully!");
        setShowSuccessScreen(true);
        setVerificationSent(false);

        // Show manual navigation option
        setTimeout(() => {
          setSuccessMessage(
            "✅ Verification complete! You can now sign in to your account."
          );
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

  // Resend verification code
  const handleResendVerification = async () => {
    try {
      setSubmitError("");
      const resp = await apiClient.resendVerification({
        email: form.email.trim().toLowerCase(),
      });

      if (resp?.success) {
        setSuccessMessage("✅ New verification code sent to your email!");
      }
    } catch (err) {
      setSubmitError(
        err?.error || "Failed to resend verification code. Please try again."
      );
    }
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
        password: form.password.trim(),
        role: form.role,
      };

      // Register user
      const resp = await apiClient.register(payload);

      if (resp?.success) {
        if (resp.token) {
          // Direct login if token provided (skip email verification)
          setShowSuccessScreen(true);
          setSuccessMessage("🎉 Registration successful! Welcome to Aurax!");
          // Auto-redirect after 3 seconds
          setAutoRedirectCountdown(3);
          const redirectTimer = setInterval(() => {
            setAutoRedirectCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(redirectTimer);
                login(resp.token);
                // Always redirect creators to onboarding after signup
                const redirect = form.role === "creator" 
                  ? "/creator/welcome" 
                  : "/brand/dashboard";
                navigate(redirect);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          // Email verification required - Show verification screen, NOT success screen yet
          setVerificationSent(true);
          setShowSuccessScreen(false); // Don't show success screen until verification is complete
          setSuccessMessage(""); // Clear any previous messages
        }
      }
    } catch (err) {
      const isDup = err?.status === 409;
      const isBad = err?.status === 400;
      setSubmitError(
        isDup
          ? "This email is already registered. Try signing in instead or use a different email."
          : isBad
          ? "Please fix the highlighted errors and try again."
          : "Registration failed. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Email Verification Screen Component
  const EmailVerificationScreen = () => (
    <div
      style={{
        textAlign: "center",
        padding: "40px 20px",
        background:
          "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)",
        borderRadius: 20,
        border: "2px solid rgba(59, 130, 246, 0.3)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Email Icon */}
      <div
        style={{
          width: 80,
          height: 80,
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 25px",
          fontSize: 40,
          boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
          animation: "pulse 2s ease-in-out infinite",
        }}
      >
        📧
      </div>

      {/* Verification Title */}
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#3b82f6",
          marginBottom: 15,
          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        Check Your Email
      </h1>

      <p
        style={{
          fontSize: 16,
          opacity: 0.9,
          marginBottom: 30,
          lineHeight: 1.6,
          color: "#dbeafe",
        }}
      >
        We've sent a 6-digit verification code to:
        <br />
        <strong style={{ color: "#60a5fa" }}>{form.email}</strong>
        <br />
        Enter the code below to complete your registration.
      </p>

      {/* Verification Form */}
      <form onSubmit={handleVerifyEmail} style={{ marginBottom: 30 }}>
        {submitError && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.2)",
              color: "#fca5a5",
              padding: 15,
              borderRadius: 8,
              marginBottom: 20,
              border: "1px solid rgba(239, 68, 68, 0.4)",
            }}
          >
            {submitError}
          </div>
        )}

        <div style={{ marginBottom: 25 }}>
          <label
            style={{
              display: "block",
              fontSize: 14,
              color: "#d1d5db",
              marginBottom: 10,
              fontWeight: 600,
            }}
          >
            Verification Code
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            style={{
              width: "200px",
              padding: "15px 20px",
              fontSize: 20,
              textAlign: "center",
              letterSpacing: "0.1em",
              borderRadius: 10,
              border: "2px solid rgba(59, 130, 246, 0.3)",
              background: "rgba(0, 0, 0, 0.4)",
              color: "#fff",
              fontWeight: 600,
              transition: "all 0.3s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3b82f6";
              e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(59, 130, 246, 0.3)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <button
            type="submit"
            disabled={isVerifying || !verificationCode.trim()}
            style={{
              padding: "15px 30px",
              background: isVerifying
                ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                : !verificationCode.trim()
                ? "rgba(107, 114, 128, 0.5)"
                : showSuccessScreen
                ? "linear-gradient(135deg, #10b981 0%, #22c55e 100%)"
                : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              cursor:
                isVerifying || !verificationCode.trim()
                  ? "not-allowed"
                  : "pointer",
              transition: "all 0.3s ease",
              boxShadow: isVerifying
                ? "0 4px 15px rgba(245, 158, 11, 0.4)"
                : showSuccessScreen
                ? "0 4px 15px rgba(34, 197, 94, 0.4)"
                : "0 4px 15px rgba(59, 130, 246, 0.4)",
              opacity:
                successMessage && successMessage.includes("verified") ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
              if (!isVerifying && verificationCode.trim()) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.5)";
              }
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.4)";
            }}
          >
            {showSuccessScreen
              ? "🎉 Verification Complete!"
              : isVerifying
              ? "⏳ Verifying Code..."
              : successMessage && successMessage.includes("verified")
              ? "✅ Verified Successfully!"
              : "🚀 Verify Email Code"}
          </button>

          <button
            type="button"
            onClick={handleResendVerification}
            style={{
              padding: "12px 20px",
              background: "transparent",
              color: "#60a5fa",
              border: "2px solid rgba(96, 165, 250, 0.4)",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(96, 165, 250, 0.1)";
              e.target.style.borderColor = "rgba(96, 165, 250, 0.6)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "transparent";
              e.target.style.borderColor = "rgba(96, 165, 250, 0.4)";
            }}
          >
            📨 Resend Code
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div
        style={{
          fontSize: 13,
          opacity: 0.7,
          padding: 15,
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: 8,
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        📧 <strong>Can't find the email?</strong>
        <br />
        • Check your spam or junk folder
        <br />
        • Make sure you entered the correct email address
        <br />• The code will expire in 10 minutes
      </div>
    </div>
  );

  // Success Screen Component
  const SuccessScreen = () => (
    <div
      style={{
        textAlign: "center",
        padding: "40px 20px",
        background:
          "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)",
        borderRadius: 20,
        border: "2px solid rgba(34, 197, 94, 0.3)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Success Animation Background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 70%)",
          animation: "pulse 2s ease-in-out infinite",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Success Icon */}
        <div
          style={{
            width: 80,
            height: 80,
            background: "linear-gradient(135deg, #10b981, #22c55e)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 25px",
            fontSize: 40,
            boxShadow: "0 10px 30px rgba(34, 197, 94, 0.4)",
            animation: "bounceIn 0.6s ease-out",
          }}
        >
          ✅
        </div>

        {/* Success Message */}
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#22c55e",
            marginBottom: 15,
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          Account Created Successfully!
        </h1>

        <p
          style={{
            fontSize: 16,
            opacity: 0.9,
            marginBottom: 30,
            lineHeight: 1.6,
            color: "#d1fae5",
          }}
        >
          {verificationSent
            ? "Your account has been created! Check your email for a verification code, or sign in now to get started."
            : "Welcome to Aurax! Your account is ready to use."}
        </p>

        {/* Auto-redirect countdown */}
        {autoRedirectCountdown && (
          <div
            style={{
              background: "rgba(59, 130, 246, 0.2)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              borderRadius: 10,
              padding: 15,
              marginBottom: 25,
              fontSize: 14,
              color: "#93c5fd",
            }}
          >
            🚀 Automatically redirecting to your dashboard in{" "}
            {autoRedirectCountdown} seconds...
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {/* Primary CTA - Sign In Now */}
          <Link
            to={form.role === "creator" ? "/creator/login" : "/brand/login"}
            style={{
              display: "inline-block",
              padding: "15px 30px",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#fff",
              textDecoration: "none",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 8px 25px rgba(37, 99, 235, 0.5)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(37, 99, 235, 0.4)";
            }}
          >
            🚀 Sign In Now - Start Creating!
          </Link>

          {/* Secondary CTA - Skip Verification (if needed) */}
          {verificationSent && (
            <div
              style={{
                padding: 20,
                background: "rgba(0, 0, 0, 0.2)",
                borderRadius: 10,
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 15 }}>
                Want to explore your account before verifying your email?
              </p>
              <button
                onClick={() => {
                  setSuccessMessage("Taking you to the login page...");
                  setTimeout(() => {
                    navigate(
                      form.role === "creator"
                        ? "/creator/login"
                        : "/brand/login"
                    );
                  }, 1000);
                }}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  background: "transparent",
                  color: "#60a5fa",
                  border: "2px solid rgba(96, 165, 250, 0.4)",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "rgba(96, 165, 250, 0.1)";
                  e.target.style.borderColor = "rgba(96, 165, 250, 0.6)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.borderColor = "rgba(96, 165, 250, 0.4)";
                }}
              >
                💡 Continue Without Email Verification
              </button>

              <div
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  marginTop: 12,
                  padding: 10,
                  background: "rgba(251, 191, 36, 0.1)",
                  border: "1px solid rgba(251, 191, 36, 0.3)",
                  borderRadius: 6,
                  color: "#fbbf24",
                }}
              >
                ✉️ Don't forget to verify your email later for full account
                access and security
              </div>
            </div>
          )}

          {/* Help Text */}
          <div
            style={{
              fontSize: 13,
              opacity: 0.7,
              marginTop: 15,
              padding: 15,
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: 8,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            🎉 <strong>Next Steps:</strong>
            <br />
            • Complete your profile setup
            <br />• Explore{" "}
            {form.role === "creator"
              ? "collaboration opportunities"
              : "creator partnerships"}
            <br />•{" "}
            {verificationSent
              ? "Verify your email when convenient"
              : "Start your first project"}
          </div>
        </div>
      </div>
    </div>
  );

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
          maxWidth: showSuccessScreen || verificationSent ? 500 : 420,
          background: "rgba(20,20,40,0.6)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: showSuccessScreen || verificationSent ? 0 : 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          transition: "all 0.5s ease",
        }}
      >
        {/* Show Success Screen OR Email Verification Screen OR Registration Form */}
        {showSuccessScreen ? (
          <SuccessScreen />
        ) : verificationSent ? (
          <EmailVerificationScreen />
        ) : (
          <>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
              {verificationSent ? "Check Your Email" : "Create your account"}
            </h1>
            <p style={{ opacity: 0.8, marginBottom: 16 }}>
              {verificationSent
                ? "Complete your registration by entering the verification code below"
                : "Join Aurax and connect with top creators and brands"}
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
                  background: verificationSent ? "#1a2b1a" : "#1a2b1a",
                  color: "#b3ffb3",
                  padding: 20,
                  borderRadius: 12,
                  marginBottom: 15,
                  textAlign: "center",
                  border: "2px solid #4caf50",
                  boxShadow: "0 4px 12px rgba(76, 175, 80, 0.2)",
                }}
              >
                <div
                  style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}
                >
                  {successMessage}
                </div>

                {verificationSent && (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      padding: 15,
                      borderRadius: 8,
                      marginTop: 15,
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    <div style={{ marginBottom: 15 }}>
                      <strong>✅ Account created successfully!</strong>
                      <br />
                      <span style={{ opacity: 0.9 }}>
                        Check your email for a verification code, or sign in now
                        to access your account.
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <Link
                        to={
                          form.role === "creator"
                            ? "/creator/login"
                            : "/brand/login"
                        }
                        style={{
                          display: "inline-block",
                          padding: "12px 24px",
                          background:
                            "linear-gradient(90deg, #2563eb, #1d4ed8)",
                          color: "#fff",
                          textDecoration: "none",
                          borderRadius: 8,
                          fontWeight: 600,
                          fontSize: 14,
                          transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow =
                            "0 4px 12px rgba(37, 99, 235, 0.4)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        🚀 Sign In Now →
                      </Link>

                      <button
                        onClick={() => {
                          setSuccessMessage("Redirecting to login page...");
                          setTimeout(() => {
                            navigate(
                              form.role === "creator"
                                ? "/creator/login"
                                : "/brand/login"
                            );
                          }, 1000);
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 16px",
                          background: "transparent",
                          color: "#60a5fa",
                          border: "1px solid rgba(96, 165, 250, 0.4)",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 500,
                          transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = "rgba(96, 165, 250, 0.1)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = "transparent";
                        }}
                      >
                        💡 Skip verification for now - Take me to login
                      </button>

                      <div
                        style={{
                          fontSize: 12,
                          opacity: 0.7,
                          marginTop: 8,
                          borderTop: "1px solid rgba(255,255,255,0.1)",
                          paddingTop: 8,
                        }}
                      >
                        ✉️ Don't forget to verify your email later for full
                        account access
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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
                <label
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="brand"
                    checked={form.role === "brand"}
                    onChange={handleChange}
                  />
                  Brand
                </label>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
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

            {verificationSent && (
              <form onSubmit={handleVerifyEmail} style={{ marginTop: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    opacity: 0.8,
                    marginBottom: 8,
                  }}
                >
                  Verification Code
                </label>
                <input
                  name="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.25)",
                    color: "#fff",
                    marginBottom: 10,
                  }}
                  placeholder="Enter the code sent to your email"
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
                      : "linear-gradient(90deg,#4caf50,#8bc34a)",
                    color: "#fff",
                    border: 0,
                    cursor: isVerifying ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  {isVerifying ? "Verifying…" : "Verify email"}
                </button>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    background: "transparent",
                    color: "#60a5fa",
                    border: "1px solid rgba(96,165,250,0.3)",
                    cursor: "pointer",
                    fontSize: 14,
                    marginBottom: 10,
                  }}
                >
                  Didn't receive the code? Resend
                </button>

                {/* Skip Verification removed for production security */}
              </form>
            )}

            {verificationSent && (
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                <p style={{ marginBottom: 8 }}>
                  Didn't receive the code?{" "}
                  <button
                    onClick={handleResendVerification}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#60a5fa",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: 14,
                    }}
                  >
                    Resend verification code
                  </button>
                </p>
                <p style={{ opacity: 0.8, marginBottom: 8 }}>
                  Please check your spam folder if you don't see the email.
                </p>
                <p style={{ opacity: 0.6, fontSize: 12, marginBottom: 15 }}>
                  📧 Email sent to: {form.email}
                  <br />
                  🔧 If emails aren't working, your backend may need email
                  configuration
                  <br />
                  💡 Check backend console for email sending logs
                </p>

                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    paddingTop: 15,
                    marginTop: 15,
                  }}
                >
                  <p style={{ opacity: 0.8, marginBottom: 10, fontSize: 13 }}>
                    Having trouble with verification?
                  </p>
                  <Link
                    to={
                      form.role === "creator"
                        ? "/creator/login"
                        : "/brand/login"
                    }
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      background: "transparent",
                      color: "#60a5fa",
                      textDecoration: "none",
                      border: "1px solid rgba(96,165,250,0.3)",
                      borderRadius: 6,
                      fontSize: 13,
                      transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "rgba(96,165,250,0.1)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "transparent";
                    }}
                  >
                    Sign in to existing account instead →
                  </Link>
                </div>
              </div>
            )}

            <div
              style={{
                marginTop: 20,
                fontSize: 14,
                opacity: 0.9,
                textAlign: "center",
                padding: "15px 0",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Already have an account?{" "}
              <Link
                to={form.role === "creator" ? "/creator/login" : "/brand/login"}
                style={{
                  color: "#60a5fa",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Sign in here
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;
