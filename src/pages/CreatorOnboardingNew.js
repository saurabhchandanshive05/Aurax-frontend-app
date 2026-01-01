import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiEndpoint } from '../utils/getApiUrl';
import './CreatorOnboardingNew.css';

const CreatorOnboardingNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [creatorData, setCreatorData] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    profileImage: '',
    totalFollowers: 0
  });
  const [publicPageForm, setPublicPageForm] = useState({
    creatorSlug: '',
    welcomeMessage: ''
  });
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [saving, setSaving] = useState(false);

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

      const response = await fetch(getApiEndpoint('/api/me'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCreatorData(data);
        
        // Initialize forms
        setProfileForm({
          displayName: data.displayName || '',
          bio: data.bio || '',
          profileImage: data.profileImage || '',
          totalFollowers: data.totalFollowers || 0
        });
        
        setPublicPageForm({
          creatorSlug: data.creatorSlug || '',
          welcomeMessage: data.welcomeMessage || ''
        });

        // Determine current step
        determineCurrentStep(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const determineCurrentStep = (data) => {
    // Profile incomplete
    if (!data.displayName || !data.bio) {
      setCurrentStep('profile');
      return;
    }
    
    // Instagram not connected
    if (!data.instagramUsername && !data.profilesConnected) {
      setCurrentStep('instagram');
      return;
    }
    
    // Public page not created
    if (!data.creatorSlug || !data.isPublicPageActive) {
      setCurrentStep('public-page');
      return;
    }
    
    // All complete
    setCurrentStep('complete');
  };

  const checkSlugAvailability = async (slug) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    try {
      setCheckingSlug(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(
        getApiEndpoint(`/api/creator/check-slug?slug=${encodeURIComponent(slug)}`),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setSlugAvailable(data.available);
      }
    } catch (error) {
      console.error('Error checking slug:', error);
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleSlugChange = (value) => {
    const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setPublicPageForm({ ...publicPageForm, creatorSlug: cleanSlug });
    
    if (cleanSlug.length >= 3) {
      const timeout = setTimeout(() => {
        checkSlugAvailability(cleanSlug);
      }, 800);
      return () => clearTimeout(timeout);
    } else {
      setSlugAvailable(null);
    }
  };

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(getApiEndpoint('/api/creator/profile'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        await fetchCreatorData();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublicPageSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(getApiEndpoint('/api/creator/public-page'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creatorSlug: publicPageForm.creatorSlug,
          displayName: profileForm.displayName,
          welcomeMessage: publicPageForm.welcomeMessage || 'Welcome to my official page',
        })
      });

      if (response.ok) {
        await fetchCreatorData();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInstagramConnect = () => {
    // Redirect to Instagram OAuth
    window.location.href = getApiEndpoint('/api/instagram/auth');
  };

  if (loading) {
    return (
      <div className="onboarding-modern">
        <div className="loading-state">
          <div className="loading-dot"></div>
        </div>
      </div>
    );
  }

  const getProgress = () => {
    let completed = 0;
    if (creatorData?.displayName && creatorData?.bio) completed++;
    if (creatorData?.instagramUsername || creatorData?.profilesConnected) completed++;
    if (creatorData?.creatorSlug && creatorData?.isPublicPageActive) completed++;
    return (completed / 3) * 100;
  };

  return (
    <div className="onboarding-modern">
      {/* Header */}
      <header className="onboarding-header">
        <h1>Welcome</h1>
        <p className="subtitle">Build your creator business in minutes</p>
      </header>

      {/* Progress */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* Main Content - Show only current step */}
      <div className="onboarding-content">
        
        {/* STEP 1: Profile Setup */}
        {currentStep === 'profile' && (
          <div className="step-card">
            <div className="step-content">
              <h2>Complete your profile</h2>
              <p className="step-description">
                Tell your audience who you are
              </p>

              <div className="form-modern">
                <div className="input-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm({...profileForm, displayName: e.target.value})}
                    className="input-modern"
                  />
                </div>

                <div className="input-group">
                  <label>Bio</label>
                  <textarea
                    placeholder="Tell your story"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                    className="textarea-modern"
                    rows="4"
                  />
                </div>

                <div className="input-group">
                  <label>Profile Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={profileForm.profileImage}
                    onChange={(e) => setProfileForm({...profileForm, profileImage: e.target.value})}
                    className="input-modern"
                  />
                </div>

                <div className="input-group">
                  <label>Follower Count</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={profileForm.totalFollowers}
                    onChange={(e) => setProfileForm({...profileForm, totalFollowers: parseInt(e.target.value) || 0})}
                    className="input-modern"
                  />
                </div>

                <button 
                  onClick={handleProfileSave}
                  disabled={!profileForm.displayName || !profileForm.bio || saving}
                  className="btn-modern-primary"
                >
                  {saving ? 'Saving...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Instagram Connect */}
        {currentStep === 'instagram' && (
          <div className="step-card">
            <div className="step-content">
              <h2>Connect Instagram</h2>
              <p className="step-description">
                Link your account to start monetizing
              </p>

              <div className="instagram-info">
                <p>Connecting allows you to:</p>
                <ul className="feature-list">
                  <li>Share your profile automatically</li>
                  <li>Display follower count</li>
                  <li>Show your latest content</li>
                </ul>
              </div>

              <button 
                onClick={handleInstagramConnect}
                className="btn-modern-primary"
              >
                Connect Instagram
              </button>
              
              <button 
                onClick={() => setCurrentStep('public-page')}
                className="btn-modern-secondary"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Public Page */}
        {currentStep === 'public-page' && (
          <div className="step-card">
            <div className="step-content">
              <h2>Create your page</h2>
              <p className="step-description">
                Get a link you can share anywhere
              </p>

              <div className="form-modern">
                <div className="input-group">
                  <label>Choose your URL</label>
                  <div className="url-input-wrapper">
                    <span className="url-prefix">auraxai.in/creator/</span>
                    <input
                      type="text"
                      placeholder="yourname"
                      value={publicPageForm.creatorSlug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="input-modern url-input"
                    />
                  </div>
                  {checkingSlug && <p className="input-hint">Checking...</p>}
                  {slugAvailable === true && <p className="input-hint success">Available</p>}
                  {slugAvailable === false && <p className="input-hint error">Already taken</p>}
                </div>

                <div className="input-group">
                  <label>Welcome Message (optional)</label>
                  <input
                    type="text"
                    placeholder="Welcome to my page"
                    value={publicPageForm.welcomeMessage}
                    onChange={(e) => setPublicPageForm({...publicPageForm, welcomeMessage: e.target.value})}
                    className="input-modern"
                  />
                </div>

                <button 
                  onClick={handlePublicPageSave}
                  disabled={!publicPageForm.creatorSlug || slugAvailable !== true || saving}
                  className="btn-modern-primary"
                >
                  {saving ? 'Creating...' : 'Create Page'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Complete */}
        {currentStep === 'complete' && (
          <div className="step-card">
            <div className="step-content completion-content">
              <div className="completion-icon">✓</div>
              <h2>You're all set</h2>
              <p className="step-description">
                Your creator page is live
              </p>

              <div className="page-link-box">
                <p className="link-label">Your page</p>
                <a 
                  href={`/creator/${creatorData?.creatorSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="page-url"
                >
                  auraxai.in/creator/{creatorData?.creatorSlug}
                </a>
              </div>

              <button 
                onClick={() => navigate('/creator/dashboard')}
                className="btn-modern-primary"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="onboarding-footer">
        <button 
          onClick={() => navigate('/creator/dashboard')}
          className="btn-text"
        >
          Skip to Dashboard
        </button>
      </footer>
    </div>
  );
};

export default CreatorOnboardingNew;
