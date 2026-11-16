import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/apiClient';
import { getApiEndpoint, redirectToInstagramOAuth } from '../utils/getApiUrl';
import Icon from '../components/ui/Icon';
import './CreatorDashboardNew.css';

const CreatorDashboardNew = () => {

  const { currentUser } = useAuth();
  // The active section lives in the URL (?section=) so the app rail can drive it.
  const [searchParams, setSearchParams] = useSearchParams();
  const SECTIONS = ['overview', 'profile', 'content', 'monetization', 'orders', 'instagram'];
  const requested = searchParams.get('section');
  const activeSection = SECTIONS.includes(requested) ? requested : 'overview';
  const setActiveSection = (next) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'overview') params.delete('section'); else params.set('section', next);
    setSearchParams(params);
  };
  const [creatorData, setCreatorData] = useState(null);
  const [stats, setStats] = useState({
    totalFollowers: 0,
    totalEarnings: 0,
    activeSubscriptions: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
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

  const renderOverview = () => {
    const name =
      creatorData?.displayName || creatorData?.fullName || creatorData?.username || currentUser?.name || 'there';
    const slug = creatorData?.creatorSlug;
    const igConnected = Boolean(creatorData?.instagram?.connected || creatorData?.instagramConnected);
    const hasOffer = Boolean(
      creatorData?.subscriptionPlans?.length ||
        creatorData?.services?.some((s) => s.isActive || s.enabled)
    );
    const steps = [
      { key: 'profile', label: 'Add a display name and bio', done: Boolean(creatorData?.displayName && creatorData?.bio), cta: 'Edit profile', go: () => setActiveSection('profile') },
      { key: 'photo', label: 'Add a profile photo', done: Boolean(creatorData?.profileImage), cta: 'Add photo', go: () => setActiveSection('profile') },
      { key: 'instagram', label: 'Connect your Instagram account', done: igConnected, cta: 'Connect', go: () => setActiveSection('instagram') },
      { key: 'page', label: 'Create your public page', done: Boolean(slug), cta: 'Create page', href: '/creator/public-page-setup' },
      { key: 'offer', label: 'Add a subscription plan or service', done: hasOffer, cta: 'Set up', go: () => setActiveSection('monetization') },
    ];
    const doneCount = steps.filter((s) => s.done).length;
    const complete = doneCount === steps.length;
    const pct = Math.round((doneCount / steps.length) * 100);
    const publicUrl = slug ? `https://auraxai.in/creator/${slug}` : null;
    const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

    const copyLink = () => {
      navigator.clipboard.writeText(publicUrl).then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      });
    };

    return (
      <div className="cd-overview">
        <header className="cd-hero">
          <div
            className="ax-ring cd-hero__ring"
            style={{ '--ring-size': '88px', '--ring-fill': pct }}
            role="img"
            aria-label={`Setup ${pct}% complete`}
          >
            {creatorData?.profileImage ? (
              <img className="cd-hero__photo" src={creatorData.profileImage} alt="" />
            ) : (
              <span className="cd-hero__initial">{name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="cd-hero__text">
            <h1>Welcome back, {name}</h1>
            <p>
              {complete
                ? 'Your setup is complete. Share your public page to start earning.'
                : `${doneCount} of ${steps.length} setup steps done. Finish the rest so brands and fans can find you.`}
            </p>
          </div>
          <div className="cd-hero__actions">
            {slug ? (
              <a className="ax-btn ax-btn--ghost" href={`/creator/${slug}`} target="_blank" rel="noopener noreferrer">
                View public page <Icon name="external" size={16} />
              </a>
            ) : (
              <a className="ax-btn ax-btn--primary" href="/creator/public-page-setup">
                Create public page
              </a>
            )}
          </div>
        </header>

        <section className="cd-stats" aria-label="Your numbers">
          <div className="cd-stat">
            <span className="cd-stat__label">Followers</span>
            <span className="cd-stat__value">{fmt(stats.totalFollowers)}</span>
          </div>
          <div className="cd-stat cd-stat--money">
            <span className="cd-stat__label">Earnings</span>
            <span className="cd-stat__value">₹{fmt(stats.totalEarnings)}</span>
          </div>
          <div className="cd-stat">
            <span className="cd-stat__label">Subscribers</span>
            <span className="cd-stat__value">{fmt(stats.activeSubscriptions)}</span>
          </div>
          <div className="cd-stat">
            <span className="cd-stat__label">Pending orders</span>
            <span className="cd-stat__value">{fmt(stats.pendingOrders)}</span>
          </div>
        </section>

        <div className="cd-grid">
          <section className="cd-panel">
            <h2 className="cd-panel__title">{complete ? 'Your public page' : 'Finish your setup'}</h2>
            {!complete && (
              <ol className="cd-steps">
                {steps.map((step) => (
                  <li key={step.key} className={`cd-step${step.done ? ' is-done' : ''}`}>
                    <Icon name={step.done ? 'check-circle' : 'circle'} size={20} className="cd-step__icon" />
                    <span className="cd-step__label">{step.label}</span>
                    {step.done ? (
                      <span className="cd-step__state">Done</span>
                    ) : step.href ? (
                      <a className="cd-step__cta" href={step.href}>{step.cta}</a>
                    ) : (
                      <button type="button" className="cd-step__cta" onClick={step.go}>{step.cta}</button>
                    )}
                  </li>
                ))}
              </ol>
            )}
            {publicUrl && (
              <div className="cd-link">
                <a href={`/creator/${slug}`} target="_blank" rel="noopener noreferrer" className="cd-link__url">
                  {publicUrl}
                </a>
                <button type="button" className="ax-btn ax-btn--ghost cd-link__copy" onClick={copyLink}>
                  {linkCopied ? 'Copied' : 'Copy link'}
                </button>
                <p className="cd-link__hint" aria-live="polite">Add this link to your Instagram bio.</p>
              </div>
            )}
          </section>

          <section className="cd-panel">
            <h2 className="cd-panel__title">Shortcuts</h2>
            <ul className="cd-shortcuts">
              {[
                { icon: 'user', label: 'Edit profile', section: 'profile' },
                { icon: 'image', label: 'Upload content', section: 'content' },
                { icon: 'wallet', label: 'Manage plans and services', section: 'monetization' },
                { icon: 'package', label: 'View orders', section: 'orders' },
              ].map((s) => (
                <li key={s.section}>
                  <button type="button" className="cd-shortcut" onClick={() => setActiveSection(s.section)}>
                    <Icon name={s.icon} size={18} />
                    <span>{s.label}</span>
                    <Icon name="chevron-right" size={16} className="cd-shortcut__go" />
                  </button>
                </li>
              ))}
            </ul>
            <a className="cd-live" href="/live/campaigns">
              <span className="cd-live__dot" aria-hidden="true" />
              <span>
                <strong>LIVE campaigns</strong>
                <span>Brands looking for creators right now</span>
              </span>
              <Icon name="arrow-right" size={18} />
            </a>
          </section>
        </div>
      </div>
    );
  };

  const renderProfileManagement = () => (
    <div className="dashboard-profile-new">
      <h2>Profile</h2>
      <p className="section-description">This is what brands and fans see on your public page.</p>
      <ProfileEditForm creatorData={creatorData} onUpdate={fetchDashboardData} />
    </div>
  );

  const renderContentManagement = () => (
    <div className="dashboard-content-new">
      <h2>Content</h2>
      <p className="section-description">Exclusive posts for your subscribers.</p>
      <ContentManager creatorId={creatorData?._id} />
    </div>
  );

  const renderMonetization = () => (
    <div className="dashboard-monetization-new">
      <h2>Monetization</h2>
      <p className="section-description">Set what fans pay for subscriptions and one-off requests.</p>
      <MonetizationSettings creatorData={creatorData} onUpdate={fetchDashboardData} />
    </div>
  );

  const renderOrders = () => (
    <div className="dashboard-orders-new">
      <h2>Orders</h2>
      <p className="section-description">Paid requests from your fans.</p>
      <OrdersManager creatorId={creatorData?._id} />
    </div>
  );

  // Instagram connection handlers
  const handleInstagramConnect = async () => {
    // Prevent double-clicks
    if (isConnectingInstagram) {
      return;
    }
    
    setIsConnectingInstagram(true);
    
    // Get token for authentication
    const token = localStorage.getItem('token');
    
    try {
      await redirectToInstagramOAuth(token);
    } catch (error) {
      console.error('Instagram connect error:', error);
      setIsConnectingInstagram(false);
    }
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
    const connected = creatorData?.instagram?.connected || creatorData?.instagramConnected;
    const profile = instagramProfile?.profile;
    const metrics = profile?.engagement_metrics;
    const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
    return (
      <div className="dashboard-instagram-new">
        <h2>Instagram</h2>
        <p className="section-description">Connect Instagram to show your feed and real audience numbers to brands.</p>

        <div className="instagram-status-card">
          {connected ? (
            <div className="instagram-connected">
              <span className="status-indicator connected">
                <Icon name="check" size={14} /> Connected
              </span>

              {loadingInstagramData ? (
                <p className="ig-muted">Loading Instagram data…</p>
              ) : instagramProfile ? (
                <>
                  <div className="ig-profile">
                    {profile?.profile_picture_url && (
                      <span className="ax-ring" style={{ '--ring-size': '64px' }}>
                        <img className="ig-profile__photo" src={profile.profile_picture_url} alt="" />
                      </span>
                    )}
                    <div>
                      <p className="ig-username">@{profile?.username || creatorData?.instagram?.username}</p>
                      {profile?.account_type && <p className="ig-muted">{profile.account_type} account</p>}
                    </div>
                  </div>

                  <dl className="ig-stats">
                    <div><dt>Followers</dt><dd>{fmt(profile?.followers_count)}</dd></div>
                    <div><dt>Following</dt><dd>{fmt(profile?.follows_count)}</dd></div>
                    <div><dt>Posts</dt><dd>{fmt(profile?.media_count)}</dd></div>
                  </dl>

                  {metrics && (
                    <dl className="ig-stats ig-stats--engagement">
                      <div><dt>Average engagement per post</dt><dd>{metrics.avg_engagement_per_post}</dd></div>
                      <div><dt>Engagement rate</dt><dd>{metrics.engagement_rate}%</dd></div>
                    </dl>
                  )}

                  {instagramProfile.media && instagramProfile.media.length > 0 && (
                    <div className="ig-media">
                      <p className="ig-media__title">Recent posts</p>
                      <div className="ig-media__grid">
                        {instagramProfile.media.slice(0, 4).map((post) => (
                          <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer" className="ig-media__item">
                            <img
                              src={post.thumbnail_url || post.media_url}
                              alt={post.caption?.substring(0, 50) || 'Instagram post'}
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="ig-muted ig-account-id">Business account ID: {creatorData?.instagram?.accountId}</p>
                </>
              ) : (
                <>
                  <p className="ig-username">@{creatorData?.instagram?.username || creatorData?.instagramUsername}</p>
                  <p className="ig-muted ig-account-id">Business account ID: {creatorData?.instagram?.accountId}</p>
                </>
              )}

              <button className="btn-secondary" onClick={handleInstagramDisconnect}>
                Disconnect Instagram
              </button>
            </div>
          ) : (
            <div className="instagram-not-connected">
              <span className="status-indicator not-connected">Not connected</span>

              <div className="ig-requirements">
                <p className="ig-requirements__title">Before you connect, check that:</p>
                <ul>
                  <li>Your Instagram is a <strong>Creator or Business account</strong></li>
                  <li>It is <strong>linked to a Facebook Page</strong></li>
                  <li>You are <strong>logged into the right Instagram account</strong></li>
                  <li>You allow access to <strong>basic profile and insights</strong> (followers, reach, posts)</li>
                </ul>
              </div>

              <button
                className="btn-primary btn-connect-instagram"
                onClick={handleInstagramConnect}
                disabled={isConnectingInstagram}
              >
                <Icon name="instagram" size={18} />
                {isConnectingInstagram ? 'Connecting…' : 'Connect Instagram'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading-new" role="status">
        <div className="ax-ring ax-loader__ring" aria-hidden="true"></div>
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="creator-dashboard-new">
      {/* Navigation is provided by the app shell rail (see components/layout/appNav.js). */}

      <div className="dashboard-content-area-new">
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
      </div>
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
        setMessage('Profile saved.');
        onUpdate();
      }
    } catch (error) {
      setMessage('Profile not saved. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-edit-form-new">
      {message && <div role="status" className={`message-box ${message.startsWith('Profile saved') ? 'success' : 'error'}`}>{message}</div>}
      
      <div className="form-row">
        <div className="form-group-new">
          <label>Display name *</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
            placeholder="Your display name"
            required
          />
        </div>

        <div className="form-group-new">
          <label>Total followers</label>
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
        <label>Welcome message</label>
        <textarea
          value={formData.welcomeMessage}
          onChange={(e) => setFormData({...formData, welcomeMessage: e.target.value})}
          placeholder="Welcome message for new subscribers..."
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group-new">
          <label>Profile image URL</label>
          <input
            type="url"
            value={formData.profileImage}
            onChange={(e) => setFormData({...formData, profileImage: e.target.value})}
            placeholder="https://example.com/profile.jpg"
          />
        </div>

        <div className="form-group-new">
          <label>Cover image URL</label>
          <input
            type="url"
            value={formData.coverImage}
            onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
            placeholder="https://example.com/cover.jpg"
          />
        </div>
      </div>

      <div className="form-group-new">
        <label>Instagram username</label>
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
        {saving ? 'Saving…' : 'Save changes'}
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
          <Icon name="plus" size={18} /> Upload content
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
            <div className="empty-icon"><Icon name="image" size={28} /></div>
            <h3>No content yet</h3>
            <p>Upload your first exclusive post. Subscribers see it on your public page.</p>
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
                  {post.isLocked ? 'Locked' : 'Public'}
                </span>
              </div>
              <div className="content-info-new">
                <h4>{post.title}</h4>
                <p>{post.description}</p>
                {post.requiresSubscription && (
                  <span className="sub-required">Subscribers only</span>
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
          <h3>Upload content</h3>
          <button type="button" onClick={onClose} className="close-btn-new" aria-label="Close"><Icon name="x" size={18} /></button>
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
            <label>Media type</label>
            <select
              value={formData.mediaType}
              onChange={(e) => setFormData({...formData, mediaType: e.target.value})}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div className="checkbox-group-new">
            <label className="checkbox-label-new">
              <input
                type="checkbox"
                checked={formData.isLocked}
                onChange={(e) => setFormData({...formData, isLocked: e.target.checked})}
              />
              <span>Lock content (viewers must log in)</span>
            </label>
          </div>

          <div className="checkbox-group-new">
            <label className="checkbox-label-new">
              <input
                type="checkbox"
                checked={formData.requiresSubscription}
                onChange={(e) => setFormData({...formData, requiresSubscription: e.target.checked})}
              />
              <span>Subscribers only</span>
            </label>
          </div>

          <div className="form-actions-new">
            <button type="button" onClick={onClose} className="cancel-btn-new">
              Cancel
            </button>
            <button type="submit" disabled={uploading} className="submit-btn-new">
              {uploading ? 'Uploading…' : 'Upload content'}
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
          <h3>Subscription plans</h3>
          <button type="button" onClick={addPlan} className="add-plan-btn-new"><Icon name="plus" size={16} /> Add plan</button>
        </div>
        
        <div className="plans-list-new">
          {plans.length === 0 ? (
            <div className="empty-plans">
              <p>No plans yet. Add a monthly plan to start taking subscriptions.</p>
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
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly (3 months)</option>
                      <option value="yearly">Yearly (12 months)</option>
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
                    type="button"
                    aria-label="Remove plan"
                  >
                    <Icon name="x" size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="monetization-section-new">
        <h3>Services</h3>
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
        {saving ? 'Saving…' : 'Save plans and services'}
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
            All
          </button>
          <button 
            className={filter === 'pending' ? 'active-filter' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={filter === 'completed' ? 'active-filter' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="orders-list-new">
        {loading ? (
          <div className="loading-state">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state-new">
            <div className="empty-icon"><Icon name="package" size={28} /></div>
            <h3>No orders yet</h3>
            <p>When a fan pays for a service, the request shows up here.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="order-card-new">
              <div className="order-header-new">
                <div className="order-type">
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
