import React, { useState, useEffect, useRef } from 'react';
import './OTPVerification.css';

/**
 * Reusable OTP Verification Component
 * 
 * Features:
 * - 6-digit OTP input with auto-focus
 * - Resend countdown timer (60 seconds)
 * - Auto-submit on complete
 * - Error handling and validation
 * 
 * Props:
 * - email: User's email address
 * - onVerify: Callback function when OTP is verified (receives otp code)
 * - onResend: Callback function to resend OTP
 * - purpose: 'registration' | 'login' | 'password-reset'
 * - loading: Boolean for loading state
 * - error: Error message to display
 */
const OTPVerification = ({ 
  email, 
  onVerify, 
  onResend, 
  purpose = 'registration',
  loading = false,
  error = null 
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are filled
    if (index === 5 && value) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        onVerify(fullOtp);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);
        
        // Focus last filled input or submit
        const lastIndex = Math.min(digits.length, 5);
        inputRefs.current[lastIndex]?.focus();
        
        if (digits.length === 6) {
          onVerify(digits.join(''));
        }
      });
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(60);
    setOtp(['', '', '', '', '', '']);
    
    if (onResend) {
      await onResend();
    }
    
    // Focus first input after resend
    inputRefs.current[0]?.focus();
  };

  const purposeText = {
    registration: 'registration',
    login: 'login',
    'password-reset': 'password reset'
  };

  return (
    <div className="otp-verification-container">
      <div className="otp-header">
        <div className="otp-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7V12C2 17.55 6.84 22.74 12 24C17.16 22.74 22 17.55 22 12V7L12 2Z" 
                  fill="url(#gradient)" stroke="none"/>
            <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" 
                  strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="gradient" x1="2" y1="2" x2="22" y2="24">
                <stop offset="0%" stopColor="#667eea"/>
                <stop offset="100%" stopColor="#764ba2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2>Verify Your Email</h2>
        <p className="otp-description">
          We've sent a 6-digit verification code to <strong>{email}</strong> for {purposeText[purpose]}.
          Please enter it below to continue.
        </p>
      </div>

      <div className="otp-inputs">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`otp-input ${error ? 'error' : ''} ${digit ? 'filled' : ''}`}
            disabled={loading}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {error && (
        <div className="otp-error">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 12H7V7h2v5zm0-6H7V4h2v2z"/>
          </svg>
          {error}
        </div>
      )}

      <div className="otp-actions">
        <button
          onClick={handleResend}
          disabled={!canResend || loading}
          className="resend-button"
        >
          {canResend ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0v3L4 0 8 0zM8 16V13l4 3H8z"/>
                <path d="M1.5 8A6.5 6.5 0 018 1.5V0a8 8 0 00-8 8h1.5zM8 14.5a6.5 6.5 0 01-6.5-6.5H0a8 8 0 008 8v-1.5z"/>
              </svg>
              Resend Code
            </>
          ) : (
            `Resend in ${resendTimer}s`
          )}
        </button>
      </div>

      <div className="otp-help">
        <p>Didn't receive the code?</p>
        <ul>
          <li>Check your spam/junk folder</li>
          <li>Make sure {email} is correct</li>
          <li>Wait for the timer to resend</li>
        </ul>
      </div>

      {loading && (
        <div className="otp-loading-overlay">
          <div className="spinner"></div>
          <p>Verifying...</p>
        </div>
      )}
    </div>
  );
};

export default OTPVerification;
