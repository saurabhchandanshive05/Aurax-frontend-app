// Email verification page component
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      const response = await fetch(
        `http://localhost:5002/api/auth/verify-email?token=${verificationToken}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message);

        // Refresh user data in auth context
        if (refreshUser) {
          await refreshUser();
        }

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.message);
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to verify email. Please try again.");
    }
  };

  const handleResendVerification = async () => {
    const email = prompt("Please enter your email address:");
    if (!email) return;

    setIsResending(true);

    try {
      const response = await fetch(
        "http://localhost:5002/api/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      alert(
        data.success ? "Verification email sent!" : `Error: ${data.message}`
      );
    } catch (error) {
      alert("Failed to send verification email. Please try again.");
    }

    setIsResending(false);
  };

  const getStatusIcon = () => {
    switch (status) {
      case "verifying":
        return (
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
        );
      case "success":
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {getStatusIcon()}

            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              {status === "verifying" && "Verifying Your Email"}
              {status === "success" && "🎉 Email Verified Successfully!"}
              {status === "error" && "❌ Verification Failed"}
            </h2>

            <p className={`mt-4 text-sm ${getStatusColor()}`}>{message}</p>

            {status === "success" && (
              <div className="mt-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-green-800">
                    🎯 What's Next?
                  </h3>
                  <ul className="mt-2 text-sm text-green-700 text-left">
                    <li>✅ Your account is now fully verified</li>
                    <li>✅ You have access to all Aurax features</li>
                    <li>
                      ✅ You'll be redirected to your dashboard in 3 seconds
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Go to Dashboard Now →
                </button>
              </div>
            )}

            {status === "error" && (
              <div className="mt-6 space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-red-800">
                    🔧 Troubleshooting
                  </h3>
                  <ul className="mt-2 text-sm text-red-700 text-left">
                    <li>
                      • Verification link may have expired (24 hour limit)
                    </li>
                    <li>• Link may have been used already</li>
                    <li>• Try requesting a new verification email</li>
                  </ul>
                </div>

                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
                >
                  {isResending ? "Sending..." : "📧 Resend Verification Email"}
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  ← Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
