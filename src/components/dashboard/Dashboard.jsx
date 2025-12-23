import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import './Dashboard.css';

const Dashboard = () => {
  const { user, authenticated, loading: authLoading, logout, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !authenticated) {
      navigate('/');
    }
  }, [authenticated, authLoading, navigate]);

  useEffect(() => {
    if (authenticated) {
      loadUserData();
    }
  }, [authenticated]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileData, statsData] = await Promise.all([
        authService.getProfile(),
        authService.getInstagramStats()
      ]);

      setProfile(profileData);
      setStats(statsData.stats);
    } catch (err) {
      console.error('Failed to load user data:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleRefresh = () => {
    loadUserData();
  };

  if (authLoading || loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>⚠️ {error}</h2>
        <button onClick={handleRefresh} className="btn-retry">Try Again</button>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    );
  }

  const instagramProfile = profile?.instagramProfile;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Instagram Dashboard</h1>
          <div className="header-actions">
            <button onClick={handleRefresh} className="btn-refresh">
              🔄 Refresh
            </button>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* User Info Card */}
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
                <p className="profile-id">ID: {user?.facebookId}</p>
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
                  <div className="stat-value">{instagramProfile.followersCount?.toLocaleString() || 0}</div>
                  <div className="stat-label">Followers</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{instagramProfile.followsCount?.toLocaleString() || 0}</div>
                  <div className="stat-label">Following</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{instagramProfile.mediaCount?.toLocaleString() || 0}</div>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
