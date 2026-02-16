import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/apiClient';
import { getApiEndpoint } from '../utils/getApiUrl';
import './CreatorDashboardNew.css';

const CreatorDashboardNew = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [creatorData, setCreatorData] = useState(null);
  const [stats, setStats] = useState({
    totalFollowers: 0,
    totalEarnings: 0,
    activeSubscriptions: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);
  const [instagramProfile, setInstagramProfile] = useState(null);
  const [loadingInstagramData, setLoadingInstagramData] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Check for Instagram connection success
    const urlParams = new URLSearchParams(window.location.search);
    const instagramStatus = urlParams.get('instagram');
    const successMsg = urlParams.get('success');
    const errorMsg = urlParams.get('error');
    
    if (instagramStatus === 'connected' && successMsg) {
      alert(decodeURIComponent(successMsg));
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh data to show Instagram connection with slight delay
      setTimeout(() => {
        fetchDashboardData();
        setIsConnectingInstagram(false); // Reset connecting state after successful OAuth
      }, 500);
    } else if (errorMsg) {
      alert('Instagram Error: ' + decodeURIComponent(errorMsg));
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsConnectingInstagram(false); // Reset on error too
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.request('/me');
      
      if (response) {
        const userData = response.user || response;
        setCreatorData(userData);
        
        // Debug Instagram connection status
        // If Instagram is connected, fetch fresh profile data from Graph API
        if (userData.instagram?.connected || userData.instagramConnected) {
          fetchInstagramProfile();
        }
        
        // Mock stats for now - will be real from backend later
        setStats({
          totalFollowers: userData.totalFollowers || 0,
          totalEarnings: userData.totalEarnings || 0,
          activeSubscriptions: userData.totalSubscribers || 0,
          pendingOrders: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstagramProfile = async () => {
    try {
      setLoadingInstagramData(true);
      // Get the access token from the database
      const response = await apiClient.request('/instagram/profile', {
        method: 'GET',
      });
      
      if (response.success) {
        setInstagramProfile(response);
        // Update stats with Instagram followers
        setStats(prev => ({
          ...prev,
          totalFollowers: response.profile?.followers_count || prev.totalFollowers
        }));
      }
    } catch (error) {
      console.error('❌ Failed to fetch Instagram profile:', error);
    } finally {
      setLoadingInstagramData(false);
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      // Clear all authentication tokens
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('authToken');
      
      // Call the logout function from AuthContext
      logout();
      
      // Show success message
      // Redirect to home
      navigate('/', { replace: true });
    }
  };

  const renderOverview = () => (
    <div className="dashboard-overview-new">
      <h2>Welcome back, {creatorData?.displayName || creatorData?.username || currentUser?.name}! 👋</h2>
      
      <div className="stats-grid-new">
        <div className="stat-card-new">
          <div className="stat-icon-new">👥</div>
          <div className="stat-content-new">
            <h3>{stats.totalFollowers}</h3>
            <p>Total Followers</p>
          </div>
        </div>
        
        <div className="stat-card-new earnings-new">
          <div className="stat-icon-new">💰</div>
          <div className="stat-content-new">
            <h3>₹{stats.totalEarnings}</h3>
            <p>Total Earnings</p>
          </div>
        </div>
        
        <div className="stat-card-new">
          <div className="stat-icon-new">⭐</div>
          <div className="stat-content-new">
            <h3>{stats.activeSubscriptions}</h3>
            <p>Active Subscriptions</p>
          </div>
        </div>
        
        <div className="stat-card-new pending-new">
          <div className="stat-icon-new">📬</div>
          <div className="stat-content-new">
            <h3>{stats.pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>
      </div>

      <div className="quick-actions-new">
        <h3>Quick Actions</h3>
        <div className="action-buttons-new">
          <button onClick={() => setActiveSection('profile')} className="action-btn-new">
            ✏️ Edit Profile
          </button>
          <button onClick={() => setActiveSection('content')} className="action-btn-new">
            📸 Upload Content
          </button>
          <button onClick={() => setActiveSection('monetization')} className="action-btn-new">
            💳 Manage Plans
          </button>
          <button onClick={() => setActiveSection('orders')} className="action-btn-new">
            📦 View Orders
          </button>
        </div>
      </div>

      {creatorData?.creatorSlug && (
        <div className="public-page-link-new">
          <h3>Your Public Page 🌐</h3>
          <div className="page-link-container">
            <a 
              href={`/creator/${creatorData.creatorSlug}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="page-link-new"
            >
              https://auraxai.in/creator/{creatorData.creatorSlug}
            </a>
            <button 
              onClick={() => navigator.clipboard.writeText(`https://auraxai.in/creator/${creatorData.creatorSlug}`)}
              className="copy-link-btn"
            >
              📋 Copy
            </button>
          </div>
          <p className="page-hint">Share this link on your Instagram bio!</p>
        </div>
      )}

      {!creatorData?.creatorSlug && (
        <div className="setup-prompt">
          <h3>⚠️ Complete Your Setup</h3>
          <p>Create your public creator page to start monetizing!</p>
          <button onClick={() => window.location.href = '/creator/public-page-setup'} className="setup-btn">
            Create Public Page →
          </button>
        </div>
      )}
    </div>
  );

  const renderProfileManagement = () => (
    <div className="dashboard-profile-new">
      <h2>Profile Management</h2>
      <ProfileEditForm creatorData={creatorData} onUpdate={fetchDashboardData} />
    </div>
  );

  const renderContentManagement = () => (
    <div className="dashboard-content-new">
      <h2>Content & Exclusives</h2>
      <p className="section-description">Upload and manage your exclusive content for subscribers</p>
      <ContentManager creatorId={creatorData?._id} />
    </div>
  );

  const renderMonetization = () => (
    <div className="dashboard-monetization-new">
      <h2>Monetization Controls</h2>
      <p className="section-description">Manage your subscription plans and services</p>
      <MonetizationSettings creatorData={creatorData} onUpdate={fetchDashboardData} />
    </div>
  );

  const renderOrders = () => (
    <div className="dashboard-orders-new">
      <h2>Orders & Messages</h2>
      <p className="section-description">View and respond to your fan requests</p>
      <OrdersManager creatorId={creatorData?._id} />
    </div>
  );

  // Instagram connection handlers
  const handleInstagramConnect = () => {
    // Prevent double-clicks
    if (isConnectingInstagram) {
      return;
    }
    
    setIsConnectingInstagram(true);
    
    // Get token for authentication
    const token = localStorage.getItem('token');
    
    // Redirect to backend Instagram OAuth endpoint
    // Backend handles everything: Meta redirect, callback, data saving
    window.location.href = `${getApiEndpoint('/api/auth/instagram/login')}?token=${token}`;
  };

  const handleInstagramDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect your Instagram account?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiEndpoint('/api/creator/disconnect-instagram'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          alert('Instagram disconnected successfully!');
          fetchDashboardData();
        } else {
          alert('Failed to disconnect Instagram');
        }
      } catch (error) {
        console.error('Error disconnecting Instagram:', error);
        alert('Error disconnecting Instagram');
      }
    }
  };

  const renderInstagram = () => {
    // Debug logging for Instagram connection state
    return (
      <div className="dashboard-instagram-new">
        <h2>📱 Connect Instagram</h2>
        <p className="section-description">Link your Instagram to display your feed and grow your following</p>
        
        <div className="instagram-status-card">
          {creatorData?.instagram?.connected || creatorData?.instagramConnected ? (
            <div className="instagram-connected">
              <div className="status-indicator connected">✓ Connected</div>
              
              {loadingInstagramData ? (
                <div style={{padding: '20px', textAlign: 'center'}}>
                  <p>Loading Instagram data...</p>
                </div>
              ) : instagramProfile ? (
                <>
                  {/* Profile Header */}
                  <div style={{display: 'flex', alignItems: 'center', gap: '16px', margin: '16px 0'}}>
                    {instagramProfile.profile?.profile_picture_url && (
                      <img 
                        src={instagramProfile.profile.profile_picture_url} 
                        alt="Profile" 
                        style={{width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #E1306C'}}
                      />
                    )}
                    <div>
                      <p className="ig-username" style={{margin: '0 0 4px 0'}}>
                        @{instagramProfile.profile?.username || creatorData?.instagram?.username}
                      </p>
                      <p style={{color: '#4a5568', fontSize: '12px', margin: 0}}>
                        {instagramProfile.profile?.account_type} Account
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div style={{
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '12px', 
                    margin: '16px 0',
                    padding: '16px',
                    background: '#f7fafc',
                    borderRadius: '8px'
                  }}>
                    <div style={{textAlign: 'center'}}>
                      <div style={{fontSize: '24px', fontWeight: 'bold', color: '#2d3748'}}>
                        {instagramProfile.profile?.followers_count?.toLocaleString() || 0}
                      </div>
                      <div style={{fontSize: '12px', color: '#718096'}}>Followers</div>
                    </div>
                    <div style={{textAlign: 'center'}}>
                      <div style={{fontSize: '24px', fontWeight: 'bold', color: '#2d3748'}}>
                        {instagramProfile.profile?.follows_count?.toLocaleString() || 0}
                      </div>
                      <div style={{fontSize: '12px', color: '#718096'}}>Following</div>
                    </div>
                    <div style={{textAlign: 'center'}}>
                      <div style={{fontSize: '24px', fontWeight: 'bold', color: '#2d3748'}}>
                        {instagramProfile.profile?.media_count?.toLocaleString() || 0}
                      </div>
                      <div style={{fontSize: '12px', color: '#718096'}}>Posts</div>
                    </div>
                  </div>

                  {/* Engagement Metrics */}
                  {instagramProfile.profile?.engagement_metrics && (
                    <div style={{
                      padding: '12px',
                      background: '#f0f9ff',
                      borderRadius: '8px',
                      margin: '12px 0'
                    }}>
                      <div style={{fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e40af'}}>
                        📊 Engagement Metrics
                      </div>
                      <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '13px'}}>
                        <div>
                          <span style={{color: '#64748b'}}>Avg. Engagement:</span> 
                          <strong style={{marginLeft: '4px'}}>
                            {instagramProfile.profile.engagement_metrics.avg_engagement_per_post}
                          </strong>
                        </div>
                        <div>
                          <span style={{color: '#64748b'}}>Engagement Rate:</span> 
                          <strong style={{marginLeft: '4px'}}>
                            {instagramProfile.profile.engagement_metrics.engagement_rate}%
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Posts Preview */}
                  {instagramProfile.media && instagramProfile.media.length > 0 && (
                    <div style={{margin: '16px 0'}}>
                      <div style={{fontSize: '14px', fontWeight: '600', marginBottom: '12px'}}>
                        📸 Recent Posts ({instagramProfile.media.length})
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '8px'
                      }}>
                        {instagramProfile.media.slice(0, 4).map((post) => (
                          <a 
                            key={post.id}
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              position: 'relative',
                              paddingTop: '100%',
                              overflow: 'hidden',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            <img
                              src={post.thumbnail_url || post.media_url}
                              alt={post.caption?.substring(0, 50) || 'Instagram post'}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <p style={{color: '#4a5568', fontSize: '12px', margin: '12px 0 8px 0'}}>
                    Business Account ID: {creatorData?.instagram?.accountId}
                  </p>
                </>
              ) : (
                <>
                  <p className="ig-username">@{creatorData?.instagram?.username || creatorData?.instagramUsername}</p>
                  <p style={{color: '#4a5568', fontSize: '14px', margin: '8px 0'}}>
                    Instagram Business Account ID: {creatorData?.instagram?.accountId}
                  </p>
                </>
              )}
              
              <button className="btn-secondary" onClick={handleInstagramDisconnect}>
                Disconnect Instagram
              </button>
            </div>
          ) : (
            <div className="instagram-not-connected">
              <div className="status-indicator not-connected">Not Connected</div>
              <p style={{fontSize: '15px', color: '#4a5568', marginBottom: '20px'}}>
                Link your Instagram to display your feed and grow your following
              </p>

              {/* Desktop Version - Detailed Requirements */}
              <div className="ig-requirements-desktop">
                <div style={{
                  background: '#f0f9ff', 
                  padding: '20px', 
                  borderRadius: '12px', 
                  marginBottom: '20px',
                  border: '1px solid #bfdbfe'
                }}>
                  <div style={{fontSize: '16px', fontWeight: '600', color: '#1e40af', marginBottom: '12px'}}>
                    📋 Before you connect, make sure:
                  </div>
                  <ul style={{
                    margin: '0', 
                    paddingLeft: '24px', 
                    fontSize: '14px', 
                    lineHeight: '1.8',
                    color: '#1e3a8a'
                  }}>
                    <li>Your Instagram account is a <strong>Creator or Business account</strong></li>
                    <li>Your Instagram is <strong>linked to a Facebook Page</strong></li>
                    <li>You're <strong>logged into the correct Instagram account</strong></li>
                    <li>You grant access to <strong>basic profile & insights</strong> (followers, reach, posts)</li>
                  </ul>
                </div>
              </div>

              {/* Mobile Version - Shorter Requirements */}
              <div className="ig-requirements-mobile">
                <div style={{
                  background: '#f0f9ff', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  marginBottom: '16px',
                  border: '1px solid #bfdbfe'
                }}>
                  <div style={{fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '10px'}}>
                    📋 Requirements
                  </div>
                  <ul style={{
                    margin: '0', 
                    paddingLeft: '20px', 
                    fontSize: '13px', 
                    lineHeight: '1.6',
                    color: '#1e3a8a'
                  }}>
                    <li>Creator/Business Instagram account</li>
                    <li>Linked Facebook Page</li>
                    <li>Permission to fetch profile & insights</li>
                  </ul>
                </div>
              </div>

            <button 
              className="btn-primary btn-connect-instagram" 
              onClick={handleInstagramConnect}
              disabled={isConnectingInstagram}
              style={isConnectingInstagram ? {opacity: 0.6, cursor: 'not-allowed'} : {}}
            >
              {isConnectingInstagram ? '⏳ Connecting...' : '🔗 Connect Instagram Account'}
            </button>
          </div>
        )}
      </div>
    </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading-new">
        <div className="spinner-new"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="creator-dashboard-new">
      <aside className="dashboard-sidebar-new">
        <div className="sidebar-header-new">
          <div className="logo-section">
            <h2>💎 AURAX</h2>
            <span className="creator-badge">Creator</span>
          </div>
        </div>
        
        <nav className="sidebar-nav-new">
          <button 
            className={activeSection === 'overview' ? 'active-nav' : ''}
            onClick={() => setActiveSection('overview')}
          >
            <span className="nav-icon-new">🏠</span>
            <span>Overview</span>
          </button>
          
          <button 
            className={activeSection === 'profile' ? 'active-nav' : ''}
            onClick={() => setActiveSection('profile')}
          >
            <span className="nav-icon-new">👤</span>
            <span>Profile</span>
          </button>
          
          <button 
            className={activeSection === 'content' ? 'active-nav' : ''}
            onClick={() => setActiveSection('content')}
          >
            <span className="nav-icon-new">📸</span>
            <span>Content</span>
          </button>
          
          <button 
            className={activeSection === 'monetization' ? 'active-nav' : ''}
            onClick={() => setActiveSection('monetization')}
          >
            <span className="nav-icon-new">💰</span>
            <span>Monetization</span>
          </button>
          
          <button 
            className={activeSection === 'orders' ? 'active-nav' : ''}
            onClick={() => setActiveSection('orders')}
          >
            <span className="nav-icon-new">📦</span>
            <span>Orders</span>
            {stats.pendingOrders > 0 && (
              <span className="badge-new">{stats.pendingOrders}</span>
            )}
          </button>
          
          <button 
            className={activeSection === 'instagram' ? 'active-nav' : ''}
            onClick={() => setActiveSection('instagram')}
          >
            <span className="nav-icon-new">📱</span>
            <span>Connect Instagram</span>
          </button>
          
          <button 
            className={activeSection === 'analytics' ? 'active-nav' : ''}
            onClick={() => setActiveSection('analytics')}
            disabled
          >
            <span className="nav-icon-new">📊</span>
            <span>Analytics</span>
            <span className="coming-soon-badge">Soon</span>
          </button>
        </nav>

        <div className="sidebar-footer-new">
          <button 
            onClick={() => navigate('/')} 
            className="home-link"
            style={{ marginBottom: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#888', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.target.style.color = '#fff'}
            onMouseOut={(e) => e.target.style.color = '#888'}
          >
            🏠 Back to Home
          </button>
          <a href="/creator/welcome" className="settings-link">⚙️ Settings</a>
          <button onClick={handleLogout} className="logout-link">🚪 Logout</button>
        </div>
      </aside>

      <main className="dashboard-content-area-new">
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'profile' && renderProfileManagement()}
        {activeSection === 'content' && renderContentManagement()}
        {activeSection === 'monetization' && renderMonetization()}
        {activeSection === 'instagram' && renderInstagram()}
        {activeSection === 'orders' && renderOrders()}
        {activeSection === 'analytics' && (
          <div className="coming-soon-section-new">
            <div className="coming-soon-icon">📊</div>
            <h2>Analytics Dashboard</h2>
            <p>Coming soon! Track your page visits, link clicks, conversions, and revenue growth.</p>
          </div>
        )}
      </main>
    </div>
  );
};

// Profile Edit Form Component
const ProfileEditForm = ({ creatorData, onUpdate }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    welcomeMessage: '',
    profileImage: '',
    coverImage: '',
    instagramUsername: '',
    totalFollowers: 0
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (creatorData) {
      setFormData({
        displayName: creatorData.displayName || '',
        bio: creatorData.bio || '',
        welcomeMessage: creatorData.welcomeMessage || '',
        profileImage: creatorData.profileImage || '',
        coverImage: creatorData.coverImage || '',
        instagramUsername: creatorData.instagramUsername || '',
        totalFollowers: creatorData.totalFollowers || 0
      });
    }
  }, [creatorData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const response = await apiClient.request('/creator/profile', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      
      if (response.success) {
        setMessage('✅ Profile updated successfully!');
        onUpdate();
      }
    } catch (error) {
      setMessage('❌ Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-edit-form-new">
      {message && <div className={`message-box ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}
      
      <div className="form-row">
        <div className="form-group-new">
          <label>Display Name *</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
            placeholder="Your display name"
            required
          />
        </div>

        <div className="form-group-new">
          <label>Total Followers</label>
          <input
            type="number"
            value={formData.totalFollowers}
            onChange={(e) => setFormData({...formData, totalFollowers: parseInt(e.target.value) || 0})}
            placeholder="0"
          />
        </div>
      </div>

      <div className="form-group-new">
        <label>Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          placeholder="Tell your fans about yourself..."
          rows="4"
        />
      </div>

      <div className="form-group-new">
        <label>Welcome Message</label>
        <textarea
          value={formData.welcomeMessage}
          onChange={(e) => setFormData({...formData, welcomeMessage: e.target.value})}
          placeholder="Welcome message for new subscribers..."
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group-new">
          <label>Profile Image URL</label>
          <input
            type="url"
            value={formData.profileImage}
            onChange={(e) => setFormData({...formData, profileImage: e.target.value})}
            placeholder="https://example.com/profile.jpg"
          />
        </div>

        <div className="form-group-new">
          <label>Cover Image URL</label>
          <input
            type="url"
            value={formData.coverImage}
            onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
            placeholder="https://example.com/cover.jpg"
          />
        </div>
      </div>

      <div className="form-group-new">
        <label>Instagram Username</label>
        <div className="input-with-prefix">
          <span className="input-prefix">@</span>
          <input
            type="text"
            value={formData.instagramUsername}
            onChange={(e) => setFormData({...formData, instagramUsername: e.target.value.replace('@', '')})}
            placeholder="username"
          />
        </div>
      </div>

      <button type="submit" disabled={saving} className="save-btn-new">
        {saving ? '💾 Saving...' : '✓ Save Changes'}
      </button>
    </form>
  );
};

// Content Manager Component
const ContentManager = ({ creatorId }) => {
  const [posts, setPosts] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.request('/creator/content');
      if (response.success) {
        setPosts(response.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-manager-new">
      <div className="content-header-new">
        <button onClick={() => setShowUploadForm(true)} className="upload-btn-new">
          ➕ Upload New Content
        </button>
      </div>

      {showUploadForm && (
        <ContentUploadForm 
          onClose={() => setShowUploadForm(false)}
          onSuccess={() => {
            setShowUploadForm(false);
            fetchPosts();
          }}
        />
      )}

      <div className="content-grid-new">
        {loading ? (
          <div className="loading-state">Loading content...</div>
        ) : posts.length === 0 ? (
          <div className="empty-state-new">
            <div className="empty-icon">📸</div>
            <h3>No content yet</h3>
            <p>Upload your first exclusive post to start monetizing!</p>
            <button onClick={() => setShowUploadForm(true)} className="empty-action-btn">
              Upload Content
            </button>
          </div>
        ) : (
          posts.map(post => (
            <div key={post._id} className="content-card-new">
              <div className="content-media">
                <img src={post.mediaUrl} alt={post.title} />
                <span className={`lock-badge-new ${post.isLocked ? 'locked' : 'public'}`}>
                  {post.isLocked ? '🔒' : '🌐'}
                </span>
              </div>
              <div className="content-info-new">
                <h4>{post.title}</h4>
                <p>{post.description}</p>
                {post.requiresSubscription && (
                  <span className="sub-required">⭐ Subscription Required</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Content Upload Form Component
const ContentUploadForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mediaUrl: '',
    mediaType: 'image',
    isLocked: false,
    requiresSubscription: false
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const response = await apiClient.request('/creator/content', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response.success) {
        alert('Content uploaded successfully!');
        onSuccess();
      }
    } catch (error) {
      alert('Failed to upload content: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-modal-new">
      <div className="upload-form-container-new">
        <div className="upload-header-new">
          <h3>📸 Upload Exclusive Content</h3>
          <button onClick={onClose} className="close-btn-new">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form-new">
          <div className="form-group-new">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Give your content a title"
              required
            />
          </div>

          <div className="form-group-new">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your content..."
              rows="3"
            />
          </div>

          <div className="form-group-new">
            <label>Media URL *</label>
            <input
              type="url"
              value={formData.mediaUrl}
              onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})}
              placeholder="https://example.com/image.jpg"
              required
            />
            <small>Upload your image/video to a hosting service and paste the URL here</small>
          </div>

          <div className="form-group-new">
            <label>Media Type</label>
            <select
              value={formData.mediaType}
              onChange={(e) => setFormData({...formData, mediaType: e.target.value})}
            >
              <option value="image">📷 Image</option>
              <option value="video">🎥 Video</option>
            </select>
          </div>

          <div className="checkbox-group-new">
            <label className="checkbox-label-new">
              <input
                type="checkbox"
                checked={formData.isLocked}
                onChange={(e) => setFormData({...formData, isLocked: e.target.checked})}
              />
              <span>🔒 Lock content (require login to view)</span>
            </label>
          </div>

          <div className="checkbox-group-new">
            <label className="checkbox-label-new">
              <input
                type="checkbox"
                checked={formData.requiresSubscription}
                onChange={(e) => setFormData({...formData, requiresSubscription: e.target.checked})}
              />
              <span>⭐ Require active subscription</span>
            </label>
          </div>

          <div className="form-actions-new">
            <button type="button" onClick={onClose} className="cancel-btn-new">
              Cancel
            </button>
            <button type="submit" disabled={uploading} className="submit-btn-new">
              {uploading ? '⏳ Uploading...' : '✓ Upload Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Monetization Settings Component
const MonetizationSettings = ({ creatorData, onUpdate }) => {
  const [plans, setPlans] = useState([]);
  const [services, setServices] = useState([
    { name: 'Surprise in inbox', price: 149, enabled: false, description: 'Get a surprise message/photo' },
    { name: 'Ask 3 questions', price: 399, enabled: false, description: 'Personal Q&A session' },
    { name: 'Personalized video', price: 1100, enabled: false, description: 'Custom video message' }
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (creatorData) {
      setPlans(creatorData.subscriptionPlans || []);
      setServices(creatorData.services || [
        { name: 'Surprise in inbox', price: 149, enabled: false, description: 'Get a surprise message/photo' },
        { name: 'Ask 3 questions', price: 399, enabled: false, description: 'Personal Q&A session' },
        { name: 'Personalized video', price: 1100, enabled: false, description: 'Custom video message' }
      ]);
    }
  }, [creatorData]);

  const addPlan = () => {
    setPlans([...plans, { duration: 'monthly', price: 499, features: ['Access to exclusive content', 'Direct messaging'] }]);
  };

  const savePlans = async () => {
    setSaving(true);
    try {
      // Format plans with required fields including 'name'
      const formattedPlans = plans.map(plan => {
        // Generate plan name from duration if not provided
        let planName = plan.name || '';
        if (!planName) {
          if (plan.duration === 'monthly') planName = 'Monthly Subscription';
          else if (plan.duration === 'quarterly') planName = 'Quarterly Subscription';
          else if (plan.duration === 'yearly') planName = 'Yearly Subscription';
          else planName = 'Subscription Plan';
        }

        return {
          name: planName,
          duration: plan.duration,
          price: plan.price,
          features: plan.features || ['Access to exclusive content', 'Direct messaging'],
          isActive: true,
          emoji: plan.emoji || '😘',
          description: plan.description || `${planName} - ₹${plan.price}`
        };
      });

      // Format services with isActive field
      const formattedServices = services.map(service => ({
        name: service.name,
        price: service.price,
        description: service.description,
        isActive: service.enabled || false
      }));

      const response = await apiClient.request('/creator/monetization', {
        method: 'PUT',
        body: JSON.stringify({ 
          subscriptionPlans: formattedPlans, 
          services: formattedServices 
        })
      });

      if (response.success) {
        alert('✅ Monetization settings saved!');
        onUpdate();
      }
    } catch (error) {
      console.error('Monetization save error:', error);
      alert('❌ Failed to save settings: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="monetization-settings-new">
      <div className="monetization-section-new">
        <div className="section-header-new">
          <h3>💳 Subscription Plans</h3>
          <button onClick={addPlan} className="add-plan-btn-new">+ Add Plan</button>
        </div>
        
        <div className="plans-list-new">
          {plans.length === 0 ? (
            <div className="empty-plans">
              <p>No subscription plans yet. Add your first plan!</p>
            </div>
          ) : (
            plans.map((plan, index) => (
              <div key={index} className="plan-card-new">
                <div className="plan-form-new">
                  <div className="plan-input-group">
                    <label>Duration</label>
                    <select
                      value={plan.duration}
                      onChange={(e) => {
                        const newPlans = [...plans];
                        newPlans[index].duration = e.target.value;
                        setPlans(newPlans);
                      }}
                    >
                      <option value="monthly">📅 Monthly</option>
                      <option value="quarterly">📅 Quarterly (3 months)</option>
                      <option value="yearly">📅 Yearly (12 months)</option>
                    </select>
                  </div>
                  
                  <div className="plan-input-group">
                    <label>Price</label>
                    <div className="price-input-new">
                      <span className="currency">₹</span>
                      <input
                        type="number"
                        value={plan.price}
                        onChange={(e) => {
                          const newPlans = [...plans];
                          newPlans[index].price = parseInt(e.target.value) || 0;
                          setPlans(newPlans);
                        }}
                        placeholder="499"
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setPlans(plans.filter((_, i) => i !== index))}
                    className="remove-plan-btn"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="monetization-section-new">
        <h3>🎯 Services</h3>
        <div className="services-list-new">
          {services.map((service, index) => (
            <div key={index} className="service-card-new">
              <label className="service-toggle">
                <input
                  type="checkbox"
                  checked={service.enabled}
                  onChange={(e) => {
                    const newServices = [...services];
                    newServices[index].enabled = e.target.checked;
                    setServices(newServices);
                  }}
                />
                <div className="service-info">
                  <h4>{service.name}</h4>
                  <p>{service.description}</p>
                </div>
              </label>
              <div className="price-input-new">
                <span className="currency">₹</span>
                <input
                  type="number"
                  value={service.price}
                  onChange={(e) => {
                    const newServices = [...services];
                    newServices[index].price = parseInt(e.target.value) || 0;
                    setServices(newServices);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={savePlans} disabled={saving} className="save-settings-btn-new">
        {saving ? '💾 Saving...' : '✓ Save All Settings'}
      </button>
    </div>
  );
};

// Orders Manager Component
const OrdersManager = ({ creatorId }) => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.request(`/creator/orders?status=${filter}`);
      if (response.success) {
        setOrders(response.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orders-manager-new">
      <div className="orders-header-new">
        <div className="filter-buttons-new">
          <button 
            className={filter === 'all' ? 'active-filter' : ''}
            onClick={() => setFilter('all')}
          >
            All Orders
          </button>
          <button 
            className={filter === 'pending' ? 'active-filter' : ''}
            onClick={() => setFilter('pending')}
          >
            ⏳ Pending
          </button>
          <button 
            className={filter === 'completed' ? 'active-filter' : ''}
            onClick={() => setFilter('completed')}
          >
            ✅ Completed
          </button>
        </div>
      </div>

      <div className="orders-list-new">
        {loading ? (
          <div className="loading-state">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state-new">
            <div className="empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Your paid requests will appear here</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="order-card-new">
              <div className="order-header-new">
                <div className="order-type">
                  {order.type === 'video' && '🎥'}
                  {order.type === 'message' && '💌'}
                  {order.type === 'question' && '❓'}
                  <span>{order.type}</span>
                </div>
                <span className={`order-status ${order.status}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-body-new">
                <p className="order-from">From: <strong>{order.fan?.username || 'Anonymous'}</strong></p>
                {order.message && <p className="order-message">"{order.message}"</p>}
                <div className="order-footer-new">
                  <span className="order-price-new">₹{order.price}</span>
                  <div className="order-actions-new">
                    {order.status === 'pending' && (
                      <>
                        <button className="reply-btn-new">Reply</button>
                        <button className="complete-btn-new">Mark Complete</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CreatorDashboardNew;
