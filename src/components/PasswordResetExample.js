/**
 * Password Reset Implementation Example
 * 
 * This file demonstrates how to integrate the PasswordReset component
 * into your React application.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordReset from '../components/PasswordReset';

/**
 * Example 1: Standalone Password Reset Page
 */
function PasswordResetPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    console.log('Password reset successful!');
    // Redirect to login page
    navigate('/login');
  };

  const handleClose = () => {
    console.log('Password reset cancelled');
    // Go back to previous page or login
    navigate('/login');
  };

  return (
    <PasswordReset 
      onSuccess={handleSuccess}
      onClose={handleClose}
    />
  );
}

/**
 * Example 2: Modal/Dialog Usage
 */
function LoginPageWithResetModal() {
  const [showResetModal, setShowResetModal] = React.useState(false);

  return (
    <div>
      {/* Your login form */}
      <div className="login-form">
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button>Login</button>
        
        <button 
          onClick={() => setShowResetModal(true)}
          className="forgot-password-link"
        >
          Forgot Password?
        </button>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="modal-overlay">
          <PasswordReset
            onSuccess={() => {
              setShowResetModal(false);
              alert('Password reset! Please login with your new password.');
            }}
            onClose={() => setShowResetModal(false)}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Example 3: Direct OTP Verification Usage
 */
import OTPVerification from '../components/OTPVerification';

function RegistrationPage() {
  const [step, setStep] = React.useState(1); // 1: form, 2: OTP
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleRegister = async (formData) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setEmail(formData.email);
        setStep(2); // Move to OTP verification
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          type: 'registration',
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Registration successful!');
        // Redirect to dashboard or login
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      setError('Failed to resend code');
    }
  };

  return (
    <div>
      {step === 1 ? (
        <div>
          {/* Registration form */}
          <h2>Create Account</h2>
          {/* Form fields... */}
          <button onClick={handleRegister}>Register</button>
        </div>
      ) : (
        <div>
          <h2>Verify Your Email</h2>
          <OTPVerification
            email={email}
            onVerify={handleVerifyOTP}
            onResend={handleResendOTP}
            purpose="registration"
            loading={loading}
            error={error}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Example 4: Testing OTP Flow (Development Mode)
 */
async function testOTPFlow() {
  console.log('Starting OTP test...');

  // Step 1: Register user
  const registerResponse = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Test1234',
    }),
  });

  const registerData = await registerResponse.json();
  console.log('Registration response:', registerData);

  // In development mode, OTP is in the response
  const otp = registerData.otp;
  console.log('OTP received:', otp);

  // Step 2: Verify OTP
  const verifyResponse = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      otp: otp,
      type: 'registration',
    }),
  });

  const verifyData = await verifyResponse.json();
  console.log('Verification response:', verifyData);

  // Step 3: Test password reset
  const resetResponse = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
    }),
  });

  const resetData = await resetResponse.json();
  console.log('Password reset response:', resetData);
  console.log('Reset OTP:', resetData.otp);

  // Step 4: Reset password
  const newPasswordResponse = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      otp: resetData.otp,
      newPassword: 'NewPass1234',
    }),
  });

  const newPasswordData = await newPasswordResponse.json();
  console.log('Password reset complete:', newPasswordData);
}

/**
 * Example 5: Custom Styling
 */
function CustomStyledPasswordReset() {
  return (
    <div className="custom-container">
      <style>{`
        /* Override default styles */
        .password-reset-container {
          background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);
        }

        .password-reset-step {
          max-width: 600px;
          border-radius: 20px;
        }

        .submit-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        /* Add your custom styles */
        .custom-container {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>
      
      <PasswordReset
        onSuccess={() => window.location.href = '/dashboard'}
        onClose={() => window.history.back()}
      />
    </div>
  );
}

/**
 * Example 6: API Error Handling
 */
function PasswordResetWithErrorHandling() {
  const [apiError, setApiError] = React.useState('');
  const navigate = useNavigate();

  const handleSuccess = async () => {
    try {
      // Log successful password reset
      await fetch('/api/analytics/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'password_reset_success',
          timestamp: new Date().toISOString(),
        }),
      });

      navigate('/login?message=password_reset_success');
    } catch (err) {
      console.error('Analytics logging failed:', err);
      // Still navigate even if logging fails
      navigate('/login');
    }
  };

  const handleError = (error) => {
    console.error('Password reset error:', error);
    setApiError(error.message);

    // Track error in analytics
    fetch('/api/analytics/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'password_reset_error',
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  };

  return (
    <div>
      {apiError && (
        <div className="global-error-banner">
          {apiError}
        </div>
      )}
      <PasswordReset
        onSuccess={handleSuccess}
        onClose={() => navigate('/')}
      />
    </div>
  );
}

export {
  PasswordResetPage,
  LoginPageWithResetModal,
  RegistrationPage,
  testOTPFlow,
  CustomStyledPasswordReset,
  PasswordResetWithErrorHandling,
};
