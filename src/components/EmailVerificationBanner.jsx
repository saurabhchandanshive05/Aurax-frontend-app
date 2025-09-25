// React component for Email Verification Integration
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Your auth context

const EmailVerificationBanner = () => {
  const { user, token } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");

  // Show banner only if user is logged in but not verified
  if (!user || user.isVerified) return null;

  const handleResendVerification = async () => {
    setIsResending(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5002/api/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("✅ Verification email sent! Please check your inbox.");
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage("❌ Failed to send verification email. Please try again.");
    }

    setIsResending(false);
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            📧 Email Verification Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Please verify your email address to access all features. Check
              your inbox for the verification link.
            </p>
            {message && <p className="mt-2 font-medium">{message}</p>}
          </div>
          <div className="mt-3">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="bg-yellow-400 hover:bg-yellow-500 text-yellow-800 font-medium py-2 px-4 rounded text-sm disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend Verification Email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
