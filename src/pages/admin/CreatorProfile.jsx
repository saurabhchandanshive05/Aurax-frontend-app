import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreatorProfile.css';

const CreatorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  
  // Editable fields
  const [adminNotes, setAdminNotes] = useState('');
  const [onboardingStatus, setOnboardingStatus] = useState('PENDING');
  const [verifiedContact, setVerifiedContact] = useState(false);
  const [allowCampaigns, setAllowCampaigns] = useState(true);
  const [allowAIAutomation, setAllowAIAutomation] = useState(false);
  const [allowWhatsappAutomation, setAllowWhatsappAutomation] = useState(false);
  const [autoSyncSocials, setAutoSyncSocials] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Social stats editable fields
  const [followers, setFollowers] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');

  useEffect(() => {
    fetchCreatorDetails();
  }, [id]);

  const fetchCreatorDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to continue');
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://localhost:5002/api/admin/creators/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const data = response.data.data;
        setCreator(data);
        
        // Initialize editable fields
        setAdminNotes(data.adminNotes || '');
        setOnboardingStatus(data.onboardingStatus || 'PENDING');
        setVerifiedContact(data.verifiedContact || false);
        setAllowCampaigns(data.allowCampaigns !== undefined ? data.allowCampaigns : true);
        setAllowAIAutomation(data.allowAIAutomation || false);
        setAllowWhatsappAutomation(data.allowWhatsappAutomation || false);
        setAutoSyncSocials(data.autoSyncSocials || false);
        setEmail(data.email || '');
        setPhone(data.phone || data.whatsappNumber || '');
        
        // Initialize social stats
        setFollowers(data.followers || 0);
        setFollowingCount(data.followingCount || 0);
        setPostCount(data.postCount || 0);
        setProfilePictureUrl(data.profilePictureUrl || data.avatar || '');
        
        // Debug log for followers
      }
    } catch (error) {
      console.error('Error fetching creator:', error);
      if (error.response?.status === 403) {
        alert('Admin access required');
        navigate('/dashboard');
      } else if (error.response?.status === 404) {
        alert('Creator not found');
        navigate('/admin/brand-intelligence/creators');
      } else {
        alert('Failed to load creator details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const updates = {
        adminNotes,
        onboardingStatus,
        verifiedContact,
        allowCampaigns,
        email,
        phone,
        allowAIAutomation,
        allowWhatsappAutomation,
        autoSyncSocials,
        // Social stats - manual updates
        followers: parseInt(followers) || 0,
        followingCount: parseInt(followingCount) || 0,
        postCount: parseInt(postCount) || 0,
        profilePictureUrl: profilePictureUrl || '',
        // Track manual update
        manuallyUpdatedAt: new Date().toISOString(),
        manuallyUpdatedBy: 'admin'
      };
      const response = await axios.patch(
        `http://localhost:5002/api/admin/creators/${id}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        alert('Changes saved successfully!');
        setEditing(false);
        fetchCreatorDetails(); // Refresh data
      }
    } catch (error) {
      console.error('❌ Error saving changes:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert('Failed to save changes: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleCopyProfileLink = () => {
    const link = creator?.profileLink || creator?.socials?.instagram 
      ? `https://www.instagram.com/${creator.socials.instagram}`
      : '';
    
    if (link) {
      navigator.clipboard.writeText(link);
      alert('Profile link copied to clipboard!');
    } else {
      alert('No profile link available');
    }
  };

  const handleConnectCollab = () => {
    const phone = creator?.whatsappNumber || creator?.phone || '';
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      const message = encodeURIComponent(`Hi ${creator.name}, I came across your profile on Aurax and would love to discuss a collaboration opportunity!`);
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    } else {
      alert('No contact number available');
    }
  };

  const handleTriggerSync = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5002/api/admin/creators/${id}/sync`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        alert('Profile sync triggered successfully!');
        fetchCreatorDetails();
      }
    } catch (error) {
      console.error('Error triggering sync:', error);
      alert('Failed to trigger profile sync');
    }
  };

  const formatFollowers = (count) => {
    if (count === null || count === undefined) {
      
      return '0';
    }
    const numCount = Number(count);
    if (isNaN(numCount) || numCount === 0) return '0';
    if (numCount >= 1000000) return `${(numCount / 1000000).toFixed(1)}M`;
    if (numCount >= 1000) return `${(numCount / 1000).toFixed(1)}K`;
    return numCount.toLocaleString();
  };

  const isPending = (value) => {
    return !value || value === '' || value === 'Pending' || value === 'N/A' || value === 'null';
  };

  const getDisplayValue = (value, fallback = 'Not provided') => {
    return isPending(value) ? fallback : value;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="creator-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading creator profile...</p>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="creator-profile-error">
        <h2>Creator not found</h2>
        <button onClick={() => navigate('/admin/brand-intelligence/creators')}>
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="creator-profile-container">
      {/* Back Button */}
      <button 
        className="back-button"
        onClick={() => navigate('/admin/brand-intelligence/creators')}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          background: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        ← Back to Creator Database
      </button>

      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="breadcrumb-link">Admin</span>
        <span className="breadcrumb-separator">/</span>
        <span onClick={() => navigate('/admin/brand-intelligence/creators')} className="breadcrumb-link">
          Creator Database
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{creator.name}</span>
      </div>

      {/* Header Card */}
      <div className="profile-header-card">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            {(!isPending(creator.profilePictureUrl) || !isPending(creator.avatar)) ? (
              <img 
                src={getDisplayValue(creator.profilePictureUrl, creator.avatar)} 
                alt={creator.name} 
                className="profile-avatar-large"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div 
              className="profile-avatar-large profile-avatar-placeholder"
              style={{ display: isPending(creator.profilePictureUrl) && isPending(creator.avatar) ? 'flex' : 'none' }}
            >
              {creator.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div className="avatar-stats">
              <div className="avatar-stat">
                {editing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={followers}
                      onChange={(e) => setFollowers(e.target.value)}
                      placeholder="0"
                      className="stat-input"
                      style={{ 
                        width: '80px', 
                        padding: '4px 8px', 
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: '600',
                        border: '2px solid #7c3aed',
                        borderRadius: '6px'
                      }}
                    />
                    <span className="avatar-stat-label">Followers</span>
                  </div>
                ) : (
                  <>
                    <span className="avatar-stat-value">{formatFollowers(creator.followers)}</span>
                    <span className="avatar-stat-label">Followers</span>
                  </>
                )}
              </div>
              <div className="avatar-stat">
                {editing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={followingCount}
                      onChange={(e) => setFollowingCount(e.target.value)}
                      placeholder="0"
                      className="stat-input"
                      style={{ 
                        width: '80px', 
                        padding: '4px 8px', 
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: '600',
                        border: '2px solid #7c3aed',
                        borderRadius: '6px'
                      }}
                    />
                    <span className="avatar-stat-label">Following</span>
                  </div>
                ) : (
                  <>
                    <span className="avatar-stat-value">{formatFollowers(creator.followingCount || 0)}</span>
                    <span className="avatar-stat-label">Following</span>
                  </>
                )}
              </div>
              <div className="avatar-stat">
                {editing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={postCount}
                      onChange={(e) => setPostCount(e.target.value)}
                      placeholder="0"
                      className="stat-input"
                      style={{ 
                        width: '80px', 
                        padding: '4px 8px', 
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: '600',
                        border: '2px solid #7c3aed',
                        borderRadius: '6px'
                      }}
                    />
                    <span className="avatar-stat-label">Posts</span>
                  </div>
                ) : (
                  <>
                    <span className="avatar-stat-value">{formatFollowers(creator.postCount || 0)}</span>
                    <span className="avatar-stat-label">Posts</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="profile-header-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{creator.displayName || creator.name}</h1>
              {creator.verifiedContact && (
                <span className="verified-badge-large">✓ Verified</span>
              )}
            </div>
            
            {!isPending(creator.bio) && (
              <p className="creator-bio">
                {creator.bio}
              </p>
            )}
            
            {creator.verifiedContact && (
              <p className="verified-contact-label">
                ✓ Verified official contact for partnership
              </p>
            )}
            
            <div className="management-type-label">
              {creator.managementType === 'SELF_MANAGED' ? '👤 Self-managed' : 
               creator.managementType === 'AGENCY_MANAGED' ? `🏢 Agency-managed${!isPending(creator.managementHandle) ? ` by ${creator.managementHandle}` : ''}` : 
               `❓ Management type unknown${!isPending(creator.managementHandle) ? ` (${creator.managementHandle})` : ''}`}
            </div>
            
            {creator.tags && creator.tags.length > 0 && (
              <div className="profile-niche-tags">
                {creator.tags.slice(0, 5).map((tag, index) => (
                  <span key={index} className="niche-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Line */}
        <div className="profile-stats-line">
          <div className="stat-item">
            <span className="stat-icon">📍</span>
            <span className="stat-text">{creator.location || creator.city || 'Location unknown'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📅</span>
            <span className="stat-text">Joined {formatDate(creator.joinedAt || creator.createdAt)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🤝</span>
            <span className="stat-text">
              {creator.recentBrandConnectionsCount || 0} brands connected in past 6 months
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-action-buttons">
          <button className="action-btn action-btn-secondary" onClick={handleCopyProfileLink}>
            📋 Copy profile link
          </button>
          <button className="action-btn action-btn-primary" onClick={handleConnectCollab}>
            💬 Connect & Collab
          </button>
          <button 
            className="action-btn action-btn-edit" 
            onClick={() => setEditing(!editing)}
          >
            ✏️ {editing ? 'Cancel Edit' : 'Edit Settings'}
          </button>
        </div>
      </div>

      {/* Socials Section */}
      <div className="profile-section">
        <h2 className="section-title">Social Media Presence</h2>
        <div className="socials-grid">
          {creator.socials?.instagram && (
            <div className="social-card social-instagram">
              <div className="social-icon">📷</div>
              <div className="social-info">
                <div className="social-platform">Instagram</div>
                <div className="social-handle">@{creator.socials.instagram}</div>
                <a 
                  href={`https://www.instagram.com/${creator.socials.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  View Profile →
                </a>
              </div>
            </div>
          )}
          
          {creator.socials?.youtube && (
            <div className="social-card social-youtube">
              <div className="social-icon">📺</div>
              <div className="social-info">
                <div className="social-platform">YouTube</div>
                <div className="social-handle">{creator.socials.youtube}</div>
                <a 
                  href={`https://www.youtube.com/@${creator.socials.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  View Channel →
                </a>
              </div>
            </div>
          )}
          
          {creator.socials?.tiktok && (
            <div className="social-card social-tiktok">
              <div className="social-icon">🎵</div>
              <div className="social-info">
                <div className="social-platform">TikTok</div>
                <div className="social-handle">@{creator.socials.tiktok}</div>
                <a 
                  href={`https://www.tiktok.com/@${creator.socials.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  View Profile →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Section */}
      {(creator.rateStory > 0 || creator.rateReel > 0 || creator.ratePost > 0) && (
        <div className="profile-section pricing-section">
          <h2 className="section-title">💰 Pricing (INR)</h2>
          <div className="pricing-grid">
            {creator.rateStory > 0 && (
              <div className="pricing-card">
                <div className="pricing-type">Story</div>
                <div className="pricing-amount">₹{creator.rateStory.toLocaleString()}</div>
              </div>
            )}
            {creator.rateReel > 0 && (
              <div className="pricing-card">
                <div className="pricing-type">Reel</div>
                <div className="pricing-amount">₹{creator.rateReel.toLocaleString()}</div>
              </div>
            )}
            {creator.ratePost > 0 && (
              <div className="pricing-card">
                <div className="pricing-type">Post</div>
                <div className="pricing-amount">₹{creator.ratePost.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Info Section */}
      <div className="profile-section">
        <h2 className="section-title">Content Information</h2>
        <div className="content-info-grid">
          <div className="info-block">
            <div className="info-label">Primary Niche</div>
            <div className="info-value">{creator.primaryNiche || creator.category || 'N/A'}</div>
          </div>
          
          {creator.secondaryNiche && (
            <div className="info-block">
              <div className="info-label">Secondary Niche</div>
              <div className="info-value">{creator.secondaryNiche}</div>
            </div>
          )}
          
          {creator.contentFormats && creator.contentFormats.length > 0 && (
            <div className="info-block">
              <div className="info-label">Content Formats</div>
              <div className="info-value">{creator.contentFormats.join(', ')}</div>
            </div>
          )}
          
          {creator.languages && creator.languages.length > 0 && (
            <div className="info-block">
              <div className="info-label">Languages</div>
              <div className="info-value">{creator.languages.join(', ')}</div>
            </div>
          )}
          
          <div className="info-block">
            <div className="info-label">Engagement Rate</div>
            <div className="info-value">{creator.engagement ? `${creator.engagement}%` : 'N/A'}</div>
          </div>
          
          <div className="info-block">
            <div className="info-label">Total Campaigns</div>
            <div className="info-value">{creator.totalCampaigns || creator.campaigns || 0}</div>
          </div>
        </div>
      </div>

      {/* Contact Details (Admin Only) */}
      <div className="profile-section admin-only-section">
        <h2 className="section-title">Contact Details (Admin Only)</h2>
        <div className="contact-details-grid">
          <div className="contact-item">
            <div className="contact-label">📧 Business Email</div>
            <div className="contact-value" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {editing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@gmail.com"
                  className="control-select"
                  style={{ flex: 1 }}
                />
              ) : (
                !isPending(creator.email) ? (
                  <a href={`mailto:${creator.email}`}>{creator.email}</a>
                ) : (
                  <span className="text-muted">Not provided</span>
                )
              )}
              {!editing && !isPending(creator.email) && (
                <button
                  onClick={() => window.open(`mailto:${creator.email}?subject=Partnership Inquiry&body=Hi ${creator.name},`, '_blank')}
                  className="link-btn"
                  style={{ padding: '5px 12px', fontSize: '13px' }}
                >
                  📧 Send Email
                </button>
              )}
            </div>
          </div>
          
          <div className="contact-item">
            <div className="contact-label">📱 Phone/WhatsApp</div>
            <div className="contact-value">
              {editing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="control-select"
                />
              ) : (
                getDisplayValue(creator.whatsappNumber || creator.phone)
              )}
            </div>
          </div>
          
          {!isPending(creator.managementHandle) && (
            <div className="contact-item">
              <div className="contact-label">🏢 Management Handle</div>
              <div className="contact-value">{creator.managementHandle}</div>
            </div>
          )}
          
          {creator.managerName && (
            <div className="contact-item">
              <div className="contact-label">👤 Manager Name</div>
              <div className="contact-value">{creator.managerName}</div>
            </div>
          )}
          
          {creator.managerContact && (
            <div className="contact-item">
              <div className="contact-label">📞 Manager Contact</div>
              <div className="contact-value">{creator.managerContact}</div>
            </div>
          )}
          
          {creator.collabLink && (
            <div className="contact-item">
              <div className="contact-label">🔗 Business Inquiry Link</div>
              <div className="contact-value">
                <a href={creator.collabLink} target="_blank" rel="noopener noreferrer">
                  {creator.collabLink}
                </a>
              </div>
            </div>
          )}
          
          {(creator.mediaKitLink || creator.websiteUrl || creator.videoCvLink) && (
            <div className="contact-item contact-item-full">
              <div className="contact-label">📎 Additional Links</div>
              <div className="contact-links">
                {creator.mediaKitLink && (
                  <a href={creator.mediaKitLink} target="_blank" rel="noopener noreferrer" className="link-btn">
                    📄 Media Kit
                  </a>
                )}
                {creator.websiteUrl && (
                  <a href={creator.websiteUrl} target="_blank" rel="noopener noreferrer" className="link-btn">
                    🌐 Website
                  </a>
                )}
                {creator.videoCvLink && (
                  <a href={creator.videoCvLink} target="_blank" rel="noopener noreferrer" className="link-btn">
                    🎥 Video CV
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Data Management (Admin Only) */}
      <div className="profile-section admin-only-section" style={{ background: '#fff9e6', border: '2px solid #ffc107' }}>
        <h2 className="section-title" style={{ color: '#ff9800' }}>
          📊 Profile Data Management (Admin Only)
        </h2>
        
        {/* Missing Data Warning */}
        {(creator.followers === 0 || !creator.profilePictureUrl || creator.profilePictureUrl === 'Pending') && (
          <div style={{ 
            background: '#fff3cd', 
            border: '1px solid #ffc107', 
            borderRadius: '8px', 
            padding: '15px', 
            marginBottom: '20px',
            color: '#856404'
          }}>
            <strong>⚠️ Missing Data Detected:</strong>
            <ul style={{ marginTop: '8px', marginBottom: '0', paddingLeft: '20px' }}>
              {creator.followers === 0 && <li>Followers count is 0 or not set</li>}
              {creator.followingCount === 0 && <li>Following count is 0 or not set</li>}
              {creator.postCount === 0 && <li>Post count is 0 or not set</li>}
              {(!creator.profilePictureUrl || creator.profilePictureUrl === 'Pending') && <li>Profile picture URL is missing</li>}
            </ul>
            <p style={{ marginTop: '10px', marginBottom: '0' }}>
              Click "Edit Settings" above to manually update these fields.
            </p>
          </div>
        )}

        <div className="contact-details-grid">
          <div className="contact-item">
            <div className="contact-label">👥 Followers Count</div>
            <div className="contact-value">
              {editing ? (
                <input
                  type="number"
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                  placeholder="0"
                  className="control-select"
                  min="0"
                />
              ) : (
                <span className={creator.followers === 0 ? 'text-muted' : ''}>
                  {creator.followers === 0 ? 'Not set' : formatFollowers(creator.followers)}
                </span>
              )}
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-label">👤 Following Count</div>
            <div className="contact-value">
              {editing ? (
                <input
                  type="number"
                  value={followingCount}
                  onChange={(e) => setFollowingCount(e.target.value)}
                  placeholder="0"
                  className="control-select"
                  min="0"
                />
              ) : (
                <span className={creator.followingCount === 0 ? 'text-muted' : ''}>
                  {creator.followingCount === 0 ? 'Not set' : formatFollowers(creator.followingCount)}
                </span>
              )}
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-label">📸 Post Count</div>
            <div className="contact-value">
              {editing ? (
                <input
                  type="number"
                  value={postCount}
                  onChange={(e) => setPostCount(e.target.value)}
                  placeholder="0"
                  className="control-select"
                  min="0"
                />
              ) : (
                <span className={creator.postCount === 0 ? 'text-muted' : ''}>
                  {creator.postCount === 0 ? 'Not set' : formatFollowers(creator.postCount)}
                </span>
              )}
            </div>
          </div>

          <div className="contact-item contact-item-full">
            <div className="contact-label">🖼️ Profile Picture URL</div>
            <div className="contact-value">
              {editing ? (
                <input
                  type="url"
                  value={profilePictureUrl}
                  onChange={(e) => setProfilePictureUrl(e.target.value)}
                  placeholder="https://example.com/profile.jpg"
                  className="control-select"
                  style={{ width: '100%' }}
                />
              ) : (
                <>
                  {creator.profilePictureUrl && creator.profilePictureUrl !== 'Pending' ? (
                    <a href={creator.profilePictureUrl} target="_blank" rel="noopener noreferrer">
                      {creator.profilePictureUrl.length > 60 
                        ? creator.profilePictureUrl.substring(0, 60) + '...' 
                        : creator.profilePictureUrl}
                    </a>
                  ) : (
                    <span className="text-muted">Not provided</span>
                  )}
                </>
              )}
            </div>
          </div>

          {creator.manuallyUpdatedAt && (
            <div className="contact-item contact-item-full" style={{ background: '#e3f2fd', padding: '10px', borderRadius: '6px' }}>
              <div className="contact-label">🕒 Last Manual Update</div>
              <div className="contact-value">
                {new Date(creator.manuallyUpdatedAt).toLocaleString()} by {creator.manuallyUpdatedBy || 'admin'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Automation & Admin Controls */}
      <div className="profile-section automation-section">
        <h2 className="section-title">Automation & Admin Controls</h2>
        
        <div className="automation-controls">
          <div className="control-group">
            <label className="control-label">Onboarding Status</label>
            <select 
              className="control-select"
              value={onboardingStatus}
              onChange={(e) => setOnboardingStatus(e.target.value)}
              disabled={!editing}
            >
              <option value="NEW">New</option>
              <option value="PENDING">Pending</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">
              <input 
                type="checkbox"
                checked={verifiedContact}
                onChange={(e) => setVerifiedContact(e.target.checked)}
                disabled={!editing}
                className="control-checkbox"
              />
              <span>Verified Contact</span>
            </label>
          </div>

          <div className="control-group">
            <label className="control-label">Last Updated</label>
            <div className="control-value">{formatDate(creator.lastModifiedAt || creator.updatedAt)}</div>
          </div>
        </div>

        {/* Admin Notes */}
        <div className="admin-notes-section">
          <label className="control-label">Admin Notes</label>
          <textarea
            className="admin-notes-textarea"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            disabled={!editing}
            placeholder="Add internal notes about this creator..."
            rows={4}
          />
        </div>

        {/* Toggle Switches */}
        <div className="toggle-switches">
          <div className="toggle-item">
            <label className="toggle-label">
              <input 
                type="checkbox"
                checked={allowCampaigns}
                onChange={(e) => setAllowCampaigns(e.target.checked)}
                disabled={!editing}
                className="toggle-checkbox"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">Allow campaigns</span>
            </label>
          </div>

          <div className="toggle-item">
            <label className="toggle-label">
              <input 
                type="checkbox"
                checked={allowAIAutomation}
                onChange={(e) => setAllowAIAutomation(e.target.checked)}
                disabled={!editing}
                className="toggle-checkbox"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">Allow AI outreach</span>
            </label>
          </div>

          <div className="toggle-item">
            <label className="toggle-label">
              <input 
                type="checkbox"
                checked={allowWhatsappAutomation}
                onChange={(e) => setAllowWhatsappAutomation(e.target.checked)}
                disabled={!editing}
                className="toggle-checkbox"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">Allow WhatsApp automation</span>
            </label>
          </div>

          <div className="toggle-item">
            <label className="toggle-label">
              <input 
                type="checkbox"
                checked={autoSyncSocials}
                onChange={(e) => setAutoSyncSocials(e.target.checked)}
                disabled={!editing}
                className="toggle-checkbox"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">Auto-sync socials</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        {editing && (
          <div className="automation-actions">
            <button 
              className="action-btn action-btn-success"
              onClick={handleSaveChanges}
              disabled={saving}
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
            <button 
              className="action-btn action-btn-secondary"
              onClick={() => {
                setEditing(false);
                fetchCreatorDetails(); // Reset to original values
              }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        )}

        <div className="automation-quick-actions">
          <button className="quick-action-btn" onClick={handleTriggerSync}>
            🔄 Trigger Profile Sync
          </button>
          <button className="quick-action-btn" disabled>
            📧 Send Onboarding Email
          </button>
          <button className="quick-action-btn" disabled>
            📝 Generate Campaign Brief
          </button>
          <button className="quick-action-btn" disabled>
            💬 Generate Outreach Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
