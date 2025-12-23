import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreatorOnboarding.css';

const CreatorOnboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [creatorData, setCreatorData] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    bio: '',
    location: '',
    phone: ''
  });
  const [audienceForm, setAudienceForm] = useState({
    categories: [],
    contentTypes: [],
    regions: []
  });
  const [savingAudience, setSavingAudience] = useState(false);

  // Fetch creator data on mount
  useEffect(() => {
    fetchCreatorData();
  }, []);

  const fetchCreatorData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        navigate('/creator/login');
        return;
      }

      const response = await fetch('http://localhost:5002/api/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCreatorData(data);
        
        // Initialize forms with existing data
        if (data.fullName || data.bio || data.location || data.phone) {
          setProfileForm({
            fullName: data.fullName || '',
            bio: data.bio || '',
            location: data.location || '',
            phone: data.phone || ''
          });
        }

        if (data.audienceInfo) {
          setAudienceForm({
            categories: data.audienceInfo.categories || [],
            contentTypes: data.audienceInfo.contentTypes || [],
            regions: data.audienceInfo.regions || []
          });
        }
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        navigate('/creator/login');
      } else {
        console.error('Failed to fetch creator data');
      }
    } catch (error) {
      console.error('Error fetching creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate current step based on completion status
  const getCurrentStep = () => {
    if (!creatorData) return 0;
    
    const isProfileCompleted = creatorData.isProfileCompleted || 
                                (creatorData.fullName && creatorData.bio);
    const isInstagramConnected = creatorData.profilesConnected || 
                                  creatorData.isInstagramConnected;
    const hasAudienceInfo = creatorData.hasAudienceInfo || 
                            (creatorData.audienceInfo?.categories?.length > 0);

    if (!isProfileCompleted) return 1;
    if (!isInstagramConnected) return 2;
    if (!hasAudienceInfo) return 3;
    return 4; // All complete
  };

  const getCompletionStatus = () => {
    if (!creatorData) return { profile: false, instagram: false, audience: false };
    
    return {
      profile: creatorData.isProfileCompleted || (creatorData.fullName && creatorData.bio),
      instagram: creatorData.profilesConnected || creatorData.isInstagramConnected,
      audience: creatorData.hasAudienceInfo || (creatorData.audienceInfo?.categories?.length > 0)
    };
  };

  const isOnboardingComplete = () => {
    const status = getCompletionStatus();
    return status.profile && status.instagram && status.audience;
  };

  // Handle profile form submission
  const handleProfileSave = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch('http://localhost:5002/api/creator/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        setShowProfileModal(false);
        fetchCreatorData(); // Refresh data
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Handle Instagram connection
  const handleConnectInstagram = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      console.error('No authentication token found');
      alert('Please log in first');
      return;
    }
    
    console.log('🔐 Connecting Instagram with token...');
    // Redirect to backend Instagram OAuth route with token as query parameter
    window.location.href = `http://localhost:5002/api/auth/instagram/login?token=${token}`;
  };

  // Handle Instagram stats refresh
  const handleRefreshInstagram = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch('http://localhost:5002/api/instagram/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchCreatorData(); // Refresh data
      }
    } catch (error) {
      console.error('Error refreshing Instagram stats:', error);
    }
  };

  // Handle audience form changes
  const handleCategoryToggle = (category) => {
    setAudienceForm(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleContentTypeToggle = (type) => {
    setAudienceForm(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(type)
        ? prev.contentTypes.filter(t => t !== type)
        : [...prev.contentTypes, type]
    }));
  };

  const handleRegionToggle = (region) => {
    setAudienceForm(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region]
    }));
  };

  // Save audience information
  const handleAudienceSave = async () => {
    try {
      setSavingAudience(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch('http://localhost:5002/api/creator/audience', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(audienceForm)
      });

      if (response.ok) {
        fetchCreatorData(); // Refresh data
      } else {
        console.error('Failed to save audience info');
      }
    } catch (error) {
      console.error('Error saving audience info:', error);
    } finally {
      setSavingAudience(false);
    }
  };

  // Navigate to dashboard
  const handleGoToDashboard = () => {
    navigate('/creator/dashboard');
  };

  if (loading) {
    return (
      <div className="onboarding-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!creatorData) {
    return (
      <div className="onboarding-container">
        <div className="error-message">
          <p>Unable to load profile data. Please try again.</p>
          <button onClick={() => navigate('/creator/login')}>Back to Login</button>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStep();
  const completionStatus = getCompletionStatus();
  const categories = ['Fashion', 'Tech', 'Beauty', 'Gaming', 'Food', 'Fitness', 'Travel', 'Lifestyle'];
  const contentTypes = ['Reels', 'Posts', 'Stories', 'Videos', 'IGTV', 'Live'];
  const regions = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Australia', 'India'];

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        {/* Welcome Header */}
        <div className="welcome-header">
          <h1>Welcome, {creatorData.username || creatorData.fullName || 'Creator'}! 🎉</h1>
          <p className="welcome-subtitle">{creatorData.email}</p>
          <p className="welcome-message">
            Let's set up your profile to connect with the best brands for your content.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-circle">
              {currentStep > 1 ? '✓' : '1'}
            </div>
            <span className="step-label">Account Created</span>
          </div>
          <div className="progress-line"></div>
          
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-circle">
              {currentStep > 2 ? '✓' : '2'}
            </div>
            <span className="step-label">Profile Setup</span>
          </div>
          <div className="progress-line"></div>
          
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <div className="step-circle">
              {currentStep > 3 ? '✓' : '3'}
            </div>
            <span className="step-label">Connect Instagram</span>
          </div>
          <div className="progress-line"></div>
          
          <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>
            <div className="step-circle">4</div>
            <span className="step-label">Ready to Go</span>
          </div>
        </div>

        {/* Main Cards */}
        <div className="onboarding-cards">
          {/* Card 1: Complete Profile */}
          <div className="onboarding-card">
            <div className="card-header">
              <h3>📝 Complete Your Profile</h3>
              <span className={`status-pill ${completionStatus.profile ? 'completed' : 'pending'}`}>
                {completionStatus.profile ? 'Completed' : 'Pending'}
              </span>
            </div>
            <div className="card-body">
              <p>Add your details to help brands understand who you are and what you create.</p>
              <ul className="checklist">
                <li className={profileForm.fullName ? 'checked' : ''}>Full Name</li>
                <li className={profileForm.bio ? 'checked' : ''}>Bio</li>
                <li className={profileForm.location ? 'checked' : ''}>Location</li>
                <li className={profileForm.phone ? 'checked' : ''}>Phone Number</li>
              </ul>
            </div>
            <div className="card-footer">
              <button 
                className="btn-primary" 
                onClick={() => setShowProfileModal(true)}
              >
                {completionStatus.profile ? 'Edit Profile' : 'Complete Now'}
              </button>
            </div>
          </div>

          {/* Card 2: Connect Instagram */}
          <div className="onboarding-card">
            <div className="card-header">
              <h3>📸 Connect Instagram</h3>
              <span className={`status-pill ${completionStatus.instagram ? 'completed' : 'pending'}`}>
                {completionStatus.instagram ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <div className="card-body">
              {!completionStatus.instagram ? (
                <>
                  <p>Connect your Instagram Business Account to showcase your content and analytics.</p>
                  <div className="info-box">
                    <strong>Note:</strong> You need an Instagram Business Account linked to a Facebook Page.
                  </div>
                </>
              ) : (
                <>
                  <div className="instagram-info">
                    <div className="instagram-avatar">
                      {creatorData.instagram?.profilePicture ? (
                        <img src={creatorData.instagram.profilePicture} alt="Profile" />
                      ) : (
                        <div className="avatar-placeholder">IG</div>
                      )}
                    </div>
                    <div className="instagram-details">
                      <p className="instagram-handle">
                        @{creatorData.instagram?.username || 'instagram_handle'}
                      </p>
                      <p className="instagram-followers">
                        {(creatorData.instagram?.followersCount || 0).toLocaleString()} Followers
                      </p>
                      <p className="instagram-posts">
                        {(creatorData.instagram?.mediaCount || 0)} Posts
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="card-footer">
              {!completionStatus.instagram ? (
                <button 
                  className="btn-primary btn-instagram" 
                  onClick={handleConnectInstagram}
                >
                  Connect Instagram
                </button>
              ) : (
                <button 
                  className="btn-secondary" 
                  onClick={handleRefreshInstagram}
                >
                  🔄 Refresh Stats
                </button>
              )}
            </div>
          </div>

          {/* Card 3: Content & Audience */}
          <div className="onboarding-card onboarding-card-wide">
            <div className="card-header">
              <h3>🎯 Content & Audience</h3>
              <span className={`status-pill ${completionStatus.audience ? 'completed' : 'pending'}`}>
                {completionStatus.audience ? 'Completed' : 'Pending'}
              </span>
            </div>
            <div className="card-body">
              <p>Tell us about your content niche and target audience.</p>
              
              {/* Categories */}
              <div className="form-section">
                <label>Content Categories</label>
                <div className="checkbox-group">
                  {categories.map(category => (
                    <label key={category} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={audienceForm.categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Content Types */}
              <div className="form-section">
                <label>Content Types</label>
                <div className="checkbox-group">
                  {contentTypes.map(type => (
                    <label key={type} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={audienceForm.contentTypes.includes(type)}
                        onChange={() => handleContentTypeToggle(type)}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Regions */}
              <div className="form-section">
                <label>Target Regions</label>
                <div className="checkbox-group">
                  {regions.map(region => (
                    <label key={region} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={audienceForm.regions.includes(region)}
                        onChange={() => handleRegionToggle(region)}
                      />
                      <span>{region}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button 
                className="btn-primary" 
                onClick={handleAudienceSave}
                disabled={savingAudience || audienceForm.categories.length === 0}
              >
                {savingAudience ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>

        {/* Completion Summary & Dashboard Button */}
        <div className="completion-summary">
          <div className="summary-items">
            <div className="summary-item">
              <span className="summary-label">Profile</span>
              <span className="summary-icon">{completionStatus.profile ? '✅' : '⭕'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Instagram</span>
              <span className="summary-icon">{completionStatus.instagram ? '✅' : '⭕'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Audience</span>
              <span className="summary-icon">{completionStatus.audience ? '✅' : '⭕'}</span>
            </div>
          </div>
          
          <button 
            className={`btn-dashboard ${isOnboardingComplete() ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleGoToDashboard}
          >
            {isOnboardingComplete() ? '🚀 Go to Dashboard' : '⏭️ Skip to Dashboard'}
          </button>
          
          {!isOnboardingComplete() && (
            <p className="skip-message">You can complete these steps later from your dashboard.</p>
          )}
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Complete Your Profile</h2>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Bio *</label>
                <textarea
                  placeholder="Tell us about yourself and your content..."
                  rows="4"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="City, Country"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowProfileModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleProfileSave}
                disabled={!profileForm.fullName || !profileForm.bio}
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorOnboarding;
