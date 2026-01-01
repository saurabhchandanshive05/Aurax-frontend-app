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
  const [publicPageForm, setPublicPageForm] = useState({
    creatorSlug: '',
    displayName: '',
    welcomeMessage: '',
    coverImage: null
  });
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugCheckTimeout, setSlugCheckTimeout] = useState(null);

  // Fetch creator data on mount
  useEffect(() => {
    fetchCreatorData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        console.log('✅ Creator data fetched successfully:', data);
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
      } else if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Token might be invalid');
        // Only redirect if we're absolutely sure the token is invalid
        // Don't redirect immediately - let the user see the page first
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
        
        // Set empty creator data instead of redirecting
        setCreatorData({
          username: 'User',
          email: '',
          role: 'creator'
        });
      } else {
        console.error('Failed to fetch creator data:', response.status);
        // Set minimal data instead of breaking
        setCreatorData({
          username: 'User',
          email: '',
          role: 'creator'
        });
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

    if (!isProfileCompleted) return 1;
    if (!isInstagramConnected) return 2;
    return 3; // All complete
  };

  const getCompletionStatus = () => {
    if (!creatorData) return { profile: false, instagram: false, publicPage: false };
    
    return {
      profile: creatorData.isProfileCompleted || (creatorData.fullName && creatorData.bio),
      instagram: creatorData.profilesConnected || creatorData.isInstagramConnected,
      publicPage: !!creatorData.creatorSlug && creatorData.isPublicPageActive
    };
  };

  const isOnboardingComplete = () => {
    const status = getCompletionStatus();
    return status.profile && status.instagram;
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

  // Check slug availability
  const checkSlugAvailability = async (slug) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    try {
      setCheckingSlug(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      console.log('🔍 Checking slug availability for:', slug);
      console.log('🔑 Token exists:', !!token);
      
      const response = await fetch(
        `http://localhost:5002/api/creator/check-slug?slug=${encodeURIComponent(slug)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📡 Response status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📦 Slug check response data:', data);
      
      if (response.ok && data.success) {
        setSlugAvailable(data.available);
        console.log(data.available ? '✅ Slug is AVAILABLE' : '❌ Slug is TAKEN');
      } else {
        console.error('❌ Slug check failed:', data);
        setSlugAvailable(null);
      }
    } catch (error) {
      console.error('💥 Error checking slug:', error);
      console.error('Error details:', error.message);
      setSlugAvailable(null);
    } finally {
      setCheckingSlug(false);
      console.log('🏁 Slug check completed. slugAvailable:', slugAvailable);
    }
  };

  // Handle slug input change
  const handleSlugChange = (value) => {
    const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setPublicPageForm({ ...publicPageForm, creatorSlug: cleanSlug });
    
    // Clear previous timeout
    if (slugCheckTimeout) {
      clearTimeout(slugCheckTimeout);
    }
    
    // Reset availability status while typing
    setSlugAvailable(null);
    
    // Debounce check
    if (cleanSlug.length >= 3) {
      const timeout = setTimeout(() => {
        checkSlugAvailability(cleanSlug);
      }, 800);
      setSlugCheckTimeout(timeout);
    } else {
      setSlugAvailable(null);
    }
  };

  // Save public page
  const handlePublicPageSave = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!publicPageForm.creatorSlug) {
        alert('Please enter a creator slug');
        return;
      }

      if (slugAvailable === false) {
        alert('This slug is already taken. Please choose another one.');
        return;
      }

      const response = await fetch('http://localhost:5002/api/creator/public-page', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creatorSlug: publicPageForm.creatorSlug,
          displayName: publicPageForm.displayName || creatorData.username,
          welcomeMessage: publicPageForm.welcomeMessage || 'Welcome to my official APP',
          coverImage: publicPageForm.coverImage
        })
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success response:', data);
        alert(
          `🎉 Success! Your page is live at:\n\n${data.publicUrl}\n\n` +
          `Copy this link and add it to your Instagram bio!`
        );
        fetchCreatorData(); // Refresh data
      } else {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        let errorMessage;
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || error.error || 'Failed to create public page';
        } catch (e) {
          errorMessage = errorText || 'Failed to create public page';
        }
        console.error('❌ Error message:', errorMessage);
        alert(errorMessage);
      }
    } catch (error) {
      console.error('💥 Exception creating public page:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Failed to create public page: ${error.message}`);
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
            <span className="step-label">Profile Setup</span>
          </div>
          <div className="progress-line"></div>
          
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-circle">
              {currentStep > 2 ? '✓' : '2'}
            </div>
            <span className="step-label">Connect Instagram</span>
          </div>
          <div className="progress-line"></div>
          
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
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

          {/* Card 3: Create Public Page */}
          <div className="onboarding-card">
            <div className="card-header">
              <h3>🔗 Create Your Public Page</h3>
              <span className={`status-pill ${completionStatus.publicPage ? 'completed' : 'pending'}`}>
                {completionStatus.publicPage ? 'Created' : 'Pending'}
              </span>
            </div>
            <div className="card-body">
              <p>Get your unique link to share with fans and start monetizing!</p>
              
              {!completionStatus.publicPage && (
                <div className="info-box">
                  <p>💡 <strong>Tip:</strong> Choose a slug that's short, memorable, and matches your brand. 
                  Minimum 3 characters, only lowercase letters, numbers, and hyphens.</p>
                </div>
              )}
              
              <div className="slug-preview">
                <strong>Your Link:</strong>
                <div className="link-display">
                  <span className="link-prefix">auraxai.in/creator/</span>
                  <input 
                    type="text" 
                    value={publicPageForm.creatorSlug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="yourname"
                    className="slug-input"
                    disabled={completionStatus.publicPage}
                  />
                  {checkingSlug && <span className="slug-status checking">⏳</span>}
                  {!checkingSlug && slugAvailable === true && <span className="slug-status available">✓</span>}
                  {!checkingSlug && slugAvailable === false && <span className="slug-status taken">✗</span>}
                </div>
                {publicPageForm.creatorSlug.length > 0 && publicPageForm.creatorSlug.length < 3 && (
                  <p className="slug-error">⚠️ Slug must be at least 3 characters long</p>
                )}
                {slugAvailable === false && (
                  <p className="slug-error">❌ This slug is already taken. Try another one!</p>
                )}
                {slugAvailable === true && (
                  <p className="slug-success">✅ Great! This slug is available!</p>
                )}
                {checkingSlug && (
                  <p className="slug-checking">🔍 Checking availability...</p>
                )}
              </div>
              
              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  value={publicPageForm.displayName}
                  onChange={(e) => setPublicPageForm({...publicPageForm, displayName: e.target.value})}
                  placeholder={creatorData.username || "How your name appears"}
                  disabled={completionStatus.publicPage}
                />
              </div>
              
              <div className="form-group">
                <label>Welcome Message</label>
                <textarea
                  value={publicPageForm.welcomeMessage}
                  onChange={(e) => setPublicPageForm({...publicPageForm, welcomeMessage: e.target.value})}
                  placeholder="Welcome to my official APP..."
                  rows="3"
                  disabled={completionStatus.publicPage}
                />
              </div>

              {completionStatus.publicPage && creatorData.creatorSlug && (
                <div className="public-link-display">
                  <p className="page-live-text"><strong>Your public page is live</strong></p>
                  <div className="page-actions">
                    <a 
                      href={`/creator/${creatorData.creatorSlug}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-view-page"
                    >
                      View Your Page →
                    </a>
                    <button 
                      className="btn-copy-link"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://auraxai.in/creator/${creatorData.creatorSlug}`);
                        alert('Link copied to clipboard!');
                      }}
                    >
                      📋 Copy Link
                    </button>
                  </div>
                  <a 
                    href={`https://auraxai.in/creator/${creatorData.creatorSlug}`}
                    className="page-url-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    auraxai.in/creator/{creatorData.creatorSlug}
                  </a>
                </div>
              )}
            </div>
            <div className="card-footer">
              <button 
                className="btn-primary" 
                onClick={handlePublicPageSave}
                disabled={
                  completionStatus.publicPage || 
                  !publicPageForm.creatorSlug || 
                  publicPageForm.creatorSlug.length < 3 ||
                  slugAvailable !== true ||
                  checkingSlug
                }
              >
                {completionStatus.publicPage ? '✓ Page Created' : 'Create Public Page'}
              </button>
            </div>
          </div>
        </div>

        {/* Completion Summary & Dashboard Button */}
        <div className="completion-summary">
          <div className="summary-content">
            <div className="summary-header">
              <h3>Setup Progress</h3>
              <div className="progress-count">
                {[completionStatus.profile, completionStatus.instagram, completionStatus.publicPage].filter(Boolean).length}/3 Complete
              </div>
            </div>
            <div className="summary-items">
              <div className="summary-item">
                <span className="summary-icon">{completionStatus.profile ? '✅' : '⭕'}</span>
                <span className="summary-label">Profile</span>
              </div>
              <div className="summary-item">
                <span className="summary-icon">{completionStatus.instagram ? '✅' : '⭕'}</span>
                <span className="summary-label">Instagram</span>
              </div>
              <div className="summary-item">
                <span className="summary-icon">{completionStatus.publicPage ? '✅' : '⭕'}</span>
                <span className="summary-label">Public Page</span>
              </div>
            </div>
          </div>
          
          <button 
            className="btn-go-dashboard"
            onClick={handleGoToDashboard}
          >
            {isOnboardingComplete() ? 'Go to Dashboard →' : 'Skip to Dashboard →'}
          </button>
          
          {!isOnboardingComplete() && (
            <p className="skip-message">You can complete these steps later</p>
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
