import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './ConnectSocials.css';

const ConnectSocials = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, connecting, analyzing, complete, error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';

  useEffect(() => {
    checkUserStatus();
    
    // Check URL params for status
    const urlStatus = searchParams.get('status');
    const urlError = searchParams.get('error');
    const platform = searchParams.get('platform');

    if (urlError) {
      setError(getErrorMessage(urlError));
      setStatus('error');
    } else if (urlStatus === 'analyzing' && platform === 'instagram') {
      setStatus('analyzing');
      startPolling();
    }
  }, [searchParams]);

  const getErrorMessage = (errorCode) => {
    const messages = {
      'facebook_auth_failed': 'Failed to connect with Facebook. Please try again.',
      'no_token': 'Authentication failed. Please try again.',
      'token_exchange_failed': 'Failed to exchange authentication token. Please try again.',
      'no_pages_found': 'No Facebook pages found. Please make sure you have a Facebook page connected to your account.',
      'no_instagram_account': 'No Instagram Business Account found. Please connect an Instagram Business Account to your Facebook page.',
      'profile_fetch_failed': 'Failed to fetch Instagram profile. Please try again.',
      'processing_failed': 'Failed to process Instagram connection. Please try again.',
    };
    return messages[errorCode] || 'An unexpected error occurred. Please try again.';
  };

  const checkUserStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUser(response.data.user);

        // If already connected, redirect to dashboard
        if (response.data.user.profilesConnected) {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const startPolling = () => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/analysis/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const { status: analysisStatus, progress: analysisProgress, analysis } = response.data;

          if (analysisStatus === 'completed') {
            setStatus('complete');
            setAnalysisData(analysis);
            setProgress(100);
            clearInterval(interval);
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          } else if (analysisStatus === 'analyzing') {
            setProgress(analysisProgress || 0);
          } else if (analysisStatus === 'failed') {
            setStatus('error');
            setError('Analysis failed. Please try again.');
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000); // Poll every 2 seconds

    setPollingInterval(interval);
    
    // Clear interval on unmount
    return () => clearInterval(interval);
  };

  const handleConnectInstagram = async () => {
    setStatus('connecting');
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in first');
        setStatus('error');
        return;
      }
      
      console.log('🔐 Connecting Instagram with token...');
      
      // Redirect to backend Instagram OAuth route with token as query parameter
      // Backend will redirect to Meta OAuth page
      window.location.href = `${API_BASE_URL}/api/auth/instagram/login?token=${token}`;
    } catch (err) {
      console.error('Instagram connect error:', err);
      setError('Failed to initiate Instagram connection. Please try again.');
      setStatus('error');
    }
  };

  const handleUseDemoData = async () => {
    try {
      setStatus('connecting');
      setError(null);

      // TODO: Implement demo data endpoint
      // For now, just show a message
      alert('Demo data feature coming soon!');
      setStatus('idle');
    } catch (err) {
      setError('Failed to load demo data');
      setStatus('error');
    }
  };

  const handleRetry = () => {
    setError(null);
    setStatus('idle');
    setProgress(0);
    
    // Clear error from URL
    navigate('/connect-socials', { replace: true });
  };

  if (!user) {
    return (
      <div className="connect-socials-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="connect-socials-container">
      <div className="connect-socials-card">
        <div className="connect-socials-header">
          <h1>Welcome to AuraxAI, {user.username}!</h1>
          <p className="subtitle">Let's connect your Instagram account to get started</p>
        </div>

        <div className="connect-socials-content">
          {status === 'idle' && !error && (
            <>
              <div className="info-section">
                <div className="info-icon">📊</div>
                <h2>Why connect Instagram?</h2>
                <ul className="benefits-list">
                  <li>
                    <span className="check-icon">✓</span>
                    Get detailed analytics on your engagement rate
                  </li>
                  <li>
                    <span className="check-icon">✓</span>
                    Discover your best posting times
                  </li>
                  <li>
                    <span className="check-icon">✓</span>
                    Track your reach and growth
                  </li>
                  <li>
                    <span className="check-icon">✓</span>
                    Understand your audience better
                  </li>
                </ul>
              </div>

              <div className="action-section">
                <button 
                  className="btn-primary btn-large"
                  onClick={handleConnectInstagram}
                >
                  <span className="btn-icon">📱</span>
                  Connect Instagram Account
                </button>

                <div className="divider">
                  <span>or</span>
                </div>

                <button 
                  className="btn-secondary btn-large"
                  onClick={handleUseDemoData}
                >
                  <span className="btn-icon">🎭</span>
                  Use Demo Data (Coming Soon)
                </button>

                <p className="security-note">
                  <span className="lock-icon">🔒</span>
                  Your data is secure. We only request read permissions.
                </p>
              </div>
            </>
          )}

          {status === 'connecting' && (
            <div className="status-section">
              <div className="loading-animation">
                <div className="spinner"></div>
              </div>
              <h2>Connecting to Facebook...</h2>
              <p>Please complete the authentication in the popup window</p>
            </div>
          )}

          {status === 'analyzing' && (
            <div className="status-section">
              <div className="progress-container">
                <div className="progress-circle">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" className="progress-bg" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      className="progress-fill"
                      style={{
                        strokeDashoffset: `${283 - (283 * progress) / 100}`
                      }}
                    />
                  </svg>
                  <div className="progress-text">{progress}%</div>
                </div>
              </div>
              <h2>Analyzing Your Instagram Account</h2>
              <p>This may take a minute. We're fetching your metrics and insights...</p>
              
              <div className="analysis-steps">
                <div className={`step ${progress >= 40 ? 'complete' : 'active'}`}>
                  <span className="step-icon">{progress >= 40 ? '✓' : '⏳'}</span>
                  Fetching your posts
                </div>
                <div className={`step ${progress >= 70 ? 'complete' : progress >= 40 ? 'active' : ''}`}>
                  <span className="step-icon">{progress >= 70 ? '✓' : progress >= 40 ? '⏳' : '○'}</span>
                  Analyzing engagement
                </div>
                <div className={`step ${progress >= 90 ? 'complete' : progress >= 70 ? 'active' : ''}`}>
                  <span className="step-icon">{progress >= 90 ? '✓' : progress >= 70 ? '⏳' : '○'}</span>
                  Generating insights
                </div>
                <div className={`step ${progress === 100 ? 'complete' : progress >= 90 ? 'active' : ''}`}>
                  <span className="step-icon">{progress === 100 ? '✓' : progress >= 90 ? '⏳' : '○'}</span>
                  Finalizing report
                </div>
              </div>
            </div>
          )}

          {status === 'complete' && analysisData && (
            <div className="status-section success">
              <div className="success-icon">🎉</div>
              <h2>Analysis Complete!</h2>
              <p>Your Instagram account has been successfully connected and analyzed.</p>

              <div className="quick-stats">
                <div className="stat-card">
                  <div className="stat-label">Engagement Rate</div>
                  <div className="stat-value">{analysisData.engagementRate}%</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Avg. Reach</div>
                  <div className="stat-value">{analysisData.averageReach?.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Posting Frequency</div>
                  <div className="stat-value">{analysisData.postingFrequency}</div>
                </div>
              </div>

              <p className="redirect-message">Redirecting to dashboard...</p>
            </div>
          )}

          {status === 'error' && error && (
            <div className="status-section error">
              <div className="error-icon">⚠️</div>
              <h2>Connection Failed</h2>
              <p className="error-message">{error}</p>
              
              <button 
                className="btn-primary btn-large"
                onClick={handleRetry}
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className="connect-socials-footer">
          <p>Need help? <a href="/support">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
};

export default ConnectSocials;
