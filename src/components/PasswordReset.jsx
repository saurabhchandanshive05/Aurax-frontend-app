import React, { useState } from 'react';
import axios from 'axios';
import OTPVerification from './OTPVerification';
import './PasswordReset.css';

/**
 * Password Reset Component
 * 
 * Two-step password reset flow:
 * 1. Enter email → Receive OTP
 * 2. Verify OTP + Enter new password
 * 
 * Features:
 * - Email validation
 * - OTP verification
 * - Password strength indicator
 * - Error handling
 * - Success feedback
 */
const PasswordReset = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002';

  // Password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strengths = [
      { score: 0, label: 'Very Weak', color: '#f56565' },
      { score: 1, label: 'Weak', color: '#ed8936' },
      { score: 2, label: 'Fair', color: '#ecc94b' },
      { score: 3, label: 'Good', color: '#48bb78' },
      { score: 4, label: 'Strong', color: '#38a169' },
      { score: 5, label: 'Very Strong', color: '#25855a' },
    ];

    return strengths[score];
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${apiBaseUrl}/api/auth/forgot-password`, {
        email: email.trim().toLowerCase(),
      });

      if (response.data.success) {
        setStep(2);
        // Show development OTP if available
        if (response.data.otp) {
          console.log('🔐 Development OTP:', response.data.otp);
        }
      } else {
        setError(response.data.message || 'Failed to send reset code');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to send reset code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification from OTPVerification component
  const handleVerifyOTP = (verifiedOtp) => {
    setOtp(verifiedOtp);
    // OTP is verified, user can now enter new password
    // The actual reset will happen on form submit
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError('');
    
    try {
      const response = await axios.post(`${apiBaseUrl}/api/auth/forgot-password`, {
        email: email.trim().toLowerCase(),
      });

      if (response.data.otp) {
        console.log('🔐 Development OTP (resent):', response.data.otp);
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend code. Please try again.');
    }
  };

  // Step 2: Reset password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${apiBaseUrl}/api/auth/reset-password`, {
        email: email.trim().toLowerCase(),
        otp,
        newPassword,
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="password-reset-container">
        <div className="success-message">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#48bb78"/>
              <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" 
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Password Reset Successful!</h2>
          <p>Your password has been successfully reset. You can now log in with your new password.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="password-reset-container">
      {step === 1 ? (
        <div className="password-reset-step">
          <div className="reset-header">
            <div className="reset-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C10.89 2 10 2.89 10 4V4.17C7.17 5.08 5 7.76 5 11C5 14.87 7.13 18 12 18C16.87 18 19 14.87 19 11C19 7.76 16.83 5.08 14 4.17V4C14 2.89 13.11 2 12 2M12 6C14.76 6 17 8.24 17 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11C7 8.24 9.24 6 12 6M11 8V12.41L14.29 10.59L15 12L11 14.41V8H11Z" 
                      fill="url(#gradient)"/>
                <defs>
                  <linearGradient id="gradient" x1="5" y1="2" x2="19" y2="18">
                    <stop offset="0%" stopColor="#667eea"/>
                    <stop offset="100%" stopColor="#764ba2"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2>Reset Your Password</h2>
            <p>Enter your email address and we'll send you a verification code to reset your password.</p>
          </div>

          <form onSubmit={handleSendOTP} className="reset-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="email-input"
              />
            </div>

            {error && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 12H7V7h2v5zm0-6H7V4h2v2z"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Sending Code...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  Send Verification Code
                </>
              )}
            </button>
          </form>

          {onClose && (
            <button onClick={onClose} className="back-button">
              ← Back to Login
            </button>
          )}
        </div>
      ) : (
        <div className="password-reset-step">
          <OTPVerification
            email={email}
            onVerify={handleVerifyOTP}
            onResend={handleResendOTP}
            purpose="password-reset"
            loading={loading}
            error={error}
          />

          <form onSubmit={handleResetPassword} className="new-password-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={8}
                disabled={loading}
                className="password-input"
              />
              {newPassword && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{ 
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: passwordStrength.color 
                      }}
                    ></div>
                  </div>
                  <span style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={loading}
                className="password-input"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !otp || otp.length !== 6} 
              className="submit-button"
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Resetting Password...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                  </svg>
                  Reset Password
                </>
              )}
            </button>
          </form>

          <button onClick={() => setStep(1)} className="back-button">
            ← Use Different Email
          </button>
        </div>
      )}
    </div>
  );
};

export default PasswordReset;
