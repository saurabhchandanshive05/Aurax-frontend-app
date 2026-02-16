import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './InstagramDashboard.css';

const InstagramDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002';

  useEffect(() => {
    // Check if coming back from OAuth
    const authStatus = searchParams.get('auth');
    const token = searchParams.get('token');
    
    if (authStatus === 'success' && token) {
      // Store JWT token in localStorage
      localStorage.setItem('auth_token', token);
      
      // Remove token from URL for security
      const newUrl = window.location.pathname + '?auth=success';
      window.history.replaceState({}, '', newUrl);
      
      // Load profile
      loadProfile();
    } else if (authStatus === 'success') {
      // Token already stored, just load profile
      loadProfile();
    } else {
      // Check if already authenticated
      loadProfile();
    }
  }, [searchParams]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the new OAuth system's profile endpoint
      const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
        withCredentials: true // Important for cookies
      });

      if (response.data.success) {
        setProfile(response.data);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      
      if (err.response?.status === 401) {
        // Not authenticated - redirect to connect page
        navigate('/connect-socials');
      } else {
        setError('Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
        withCredentials: true
      });
      // Clear token from localStorage
      localStorage.removeItem('auth_token');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      // Clear token anyway
      localStorage.removeItem('auth_token');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="instagram-dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="instagram-dashboard-container">
        <div className="error-message">
          <h2>⚠️ {error}</h2>
          <button onClick={() => loadProfile()} className="btn-retry">
            Try Again
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="instagram-dashboard-container">
        <div className="no-profile">
          <h2>No profile found</h2>
          <button onClick={() => navigate('/connect-socials')} className="btn-primary">
            Connect Instagram
          </button>
        </div>
      </div>
    );
  }

  const { user, instagramProfile } = profile;

  return (
    <div className="instagram-dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Instagram Dashboard</h1>
          <div className="header-actions">
            <button onClick={() => loadProfile()} className="btn-refresh">
              🔄 Refresh
            </button>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* User Profile Card */}
        <div className="card user-card">
          <div className="card-header">
            <h2>User Profile</h2>
          </div>
          <div className="card-body">
            <div className="profile-info">
              {user?.picture && (
                <img src={user.picture} alt={user.name} className="profile-avatar" />
              )}
              <div className="profile-details">
                <h3>{user?.name}</h3>
                <p className="profile-email">{user?.email || 'No email provided'}</p>
                <p className="profile-id">Facebook ID: {user?.facebookId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instagram Profile Card */}
        {instagramProfile ? (
          <div className="card instagram-card">
            <div className="card-header">
              <h2>Instagram Business Account</h2>
              {instagramProfile.isTokenExpiring && (
                <span className="token-warning">⚠️ Token expiring soon</span>
              )}
            </div>
            <div className="card-body">
              <div className="instagram-profile">
                {instagramProfile.profilePictureUrl && (
                  <img 
                    src={instagramProfile.profilePictureUrl} 
                    alt={instagramProfile.username} 
                    className="instagram-avatar"
                  />
                )}
                <div className="instagram-details">
                  <h3>@{instagramProfile.username}</h3>
                  {instagramProfile.name && (
                    <p className="instagram-name">{instagramProfile.name}</p>
                  )}
                  {instagramProfile.biography && (
                    <p className="instagram-bio">{instagramProfile.biography}</p>
                  )}
                  {instagramProfile.website && (
                    <a 
                      href={instagramProfile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="instagram-website"
                    >
                      🔗 {instagramProfile.website}
                    </a>
                  )}
                  {instagramProfile.facebookPageName && (
                    <p className="facebook-page">
                      📄 Linked to: {instagramProfile.facebookPageName}
                    </p>
                  )}
                </div>
              </div>

              {/* Instagram Stats */}
              <div className="instagram-stats">
                <div className="stat-item">
                  <div className="stat-value">
                    {instagramProfile.followersCount?.toLocaleString() || 0}
                  </div>
                  <div className="stat-label">Followers</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {instagramProfile.followsCount?.toLocaleString() || 0}
                  </div>
                  <div className="stat-label">Following</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {instagramProfile.mediaCount?.toLocaleString() || 0}
                  </div>
                  <div className="stat-label">Posts</div>
                </div>
              </div>

              <div className="token-info">
                <p className="token-expires">
                  Token expires: {new Date(instagramProfile.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card no-instagram">
            <div className="card-body">
              <h3>No Instagram Account Connected</h3>
              <p>Please reconnect to link your Instagram Business Account</p>
              <button onClick={() => navigate('/connect-socials')} className="btn-primary">
                Connect Instagram
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramDashboard;
