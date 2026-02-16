import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiEndpoint } from '../utils/getApiUrl';
import './PublicPageSetup.css';

const PublicPageSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  
  const [formData, setFormData] = useState({
    creatorSlug: '',
    displayName: '',
    bio: '',
    welcomeMessage: '',
    profileImage: '',
    coverImage: '',
    instagramUsername: '',
    category: 'Creator',
    contentRules: 'No nudity, No hate speech, Family-friendly content only'
  });

  const [errors, setErrors] = useState({});

  const categories = [
    'Creator',
    'Influencer', 
    'Artist',
    'Actor',
    'Musician',
    'Fitness Coach',
    'Beauty Expert',
    'Gamer',
    'Educator',
    'Other'
  ];

  useEffect(() => {
    checkExistingPage();
  }, []);

  const checkExistingPage = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(getApiEndpoint('/api/me'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { user } = await response.json();
        
        // If public page already exists, redirect to dashboard
        if (user.creatorSlug && user.isPublicPageActive) {
          navigate('/creator/dashboard');
          return;
        }

        // Pre-fill with existing data
        setFormData(prev => ({
          ...prev,
          displayName: user.fullName || user.username || '',
          bio: user.bio || '',
          instagramUsername: user.instagram?.username || '',
          profileImage: user.profileImage || '',
          category: user.creatorType || 'Creator'
        }));
      }
    } catch (error) {
      console.error('Error checking existing page:', error);
    }
  };

  const checkSlugAvailability = async (slug) => {
    if (slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    setCheckingSlug(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(
        getApiEndpoint(`/api/creator/check-slug?slug=${encodeURIComponent(slug)}`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      setSlugAvailable(data.available);
    } catch (error) {
      console.error('Slug check error:', error);
      setSlugAvailable(null);
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleSlugChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, creatorSlug: value });
    
    // Debounce slug check
    clearTimeout(window.slugCheckTimeout);
    window.slugCheckTimeout = setTimeout(() => {
      if (value.length >= 3) {
        checkSlugAvailability(value);
      }
    }, 500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.creatorSlug) {
      newErrors.creatorSlug = 'Creator URL is required';
    } else if (formData.creatorSlug.length < 3) {
      newErrors.creatorSlug = 'URL must be at least 3 characters';
    } else if (!/^[a-z0-9-]+$/.test(formData.creatorSlug)) {
      newErrors.creatorSlug = 'URL can only contain lowercase letters, numbers, and hyphens';
    } else if (slugAvailable === false) {
      newErrors.creatorSlug = 'This URL is already taken';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.length < 20) {
      newErrors.bio = 'Bio should be at least 20 characters';
    }

    if (!formData.welcomeMessage.trim()) {
      newErrors.welcomeMessage = 'Welcome message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(getApiEndpoint('/api/creator/public-page'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creatorSlug: formData.creatorSlug,
          displayName: formData.displayName,
          bio: formData.bio,
          welcomeMessage: formData.welcomeMessage,
          profileImage: formData.profileImage,
          coverImage: formData.coverImage,
          instagramUsername: formData.instagramUsername,
          category: formData.category,
          contentRules: formData.contentRules
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Show success and redirect to dashboard
        alert('🎉 Your public creator page is now live!');
        navigate('/creator/dashboard');
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        alert(errorData.message || 'Failed to create public page');
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
      alert('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-page-setup">
      <div className="setup-container">
        <div className="setup-header">
          <h1>🎨 Create Your Public Creator Page</h1>
          <p>Set up your public profile where fans can discover and support you</p>
          
          <div className="progress-steps">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Basic Info</span>
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">About You</span>
            </div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Content Rules</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          {step === 1 && (
            <div className="step-content">
              <h2>📝 Basic Information</h2>
              
              <div className="form-group">
                <label>Your Public URL *</label>
                <div className="url-input-wrapper">
                  <span className="url-prefix">auraxai.in/creator/</span>
                  <input
                    type="text"
                    name="creatorSlug"
                    value={formData.creatorSlug}
                    onChange={handleSlugChange}
                    placeholder="your-username"
                    className={errors.creatorSlug ? 'error' : ''}
                  />
                </div>
                {checkingSlug && <p className="field-hint">⏳ Checking availability...</p>}
                {slugAvailable === true && <p className="field-success">✅ Available!</p>}
                {slugAvailable === false && <p className="field-error">❌ Already taken</p>}
                {errors.creatorSlug && <p className="field-error">{errors.creatorSlug}</p>}
                <p className="field-hint">Only lowercase letters, numbers, and hyphens. Min 3 characters.</p>
              </div>

              <div className="form-group">
                <label>Display Name *</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Your public display name"
                  className={errors.displayName ? 'error' : ''}
                />
                {errors.displayName && <p className="field-error">{errors.displayName}</p>}
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? 'error' : ''}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="field-error">{errors.category}</p>}
              </div>

              <div className="form-group">
                <label>Instagram Username (Optional)</label>
                <input
                  type="text"
                  name="instagramUsername"
                  value={formData.instagramUsername}
                  onChange={handleChange}
                  placeholder="@yourusername"
                />
                <p className="field-hint">Will show as verified badge on your public page</p>
              </div>

              <button 
                type="button" 
                onClick={handleNextStep}
                className="btn-next"
                disabled={!formData.creatorSlug || slugAvailable !== true}
              >
                Next: About You →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h2>👤 About You</h2>
              
              <div className="form-group">
                <label>Bio *</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell your audience about yourself..."
                  rows={4}
                  className={errors.bio ? 'error' : ''}
                />
                <p className="field-hint">{formData.bio.length}/500 characters</p>
                {errors.bio && <p className="field-error">{errors.bio}</p>}
              </div>

              <div className="form-group">
                <label>Welcome Message *</label>
                <textarea
                  name="welcomeMessage"
                  value={formData.welcomeMessage}
                  onChange={handleChange}
                  placeholder="Welcome message for your subscribers..."
                  rows={3}
                  className={errors.welcomeMessage ? 'error' : ''}
                />
                {errors.welcomeMessage && <p className="field-error">{errors.welcomeMessage}</p>}
              </div>

              <div className="form-group">
                <label>Profile Image URL (Optional)</label>
                <input
                  type="url"
                  name="profileImage"
                  value={formData.profileImage}
                  onChange={handleChange}
                  placeholder="https://example.com/your-photo.jpg"
                />
              </div>

              <div className="form-group">
                <label>Cover Image URL (Optional)</label>
                <input
                  type="url"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              <div className="button-group">
                <button type="button" onClick={() => setStep(1)} className="btn-back">
                  ← Back
                </button>
                <button type="button" onClick={handleNextStep} className="btn-next">
                  Next: Content Rules →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h2>📋 Content Rules</h2>
              
              <div className="form-group">
                <label>Content Guidelines *</label>
                <textarea
                  name="contentRules"
                  value={formData.contentRules}
                  onChange={handleChange}
                  placeholder="Set your content rules and boundaries..."
                  rows={4}
                />
                <p className="field-hint">
                  These rules will be shown on your public page
                </p>
              </div>

              <div className="preview-box">
                <h3>Preview Your Public Page</h3>
                <div className="page-preview">
                  <div className="preview-cover" style={{ backgroundImage: formData.coverImage ? `url(${formData.coverImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    {formData.profileImage && <img src={formData.profileImage} alt="Profile" className="preview-avatar" />}
                  </div>
                  <div className="preview-content">
                    <h2>{formData.displayName}</h2>
                    <p className="preview-category">{formData.category}</p>
                    {formData.instagramUsername && (
                      <p className="preview-instagram">@{formData.instagramUsername}</p>
                    )}
                    <p className="preview-bio">{formData.bio}</p>
                  </div>
                </div>
              </div>

              <div className="button-group">
                <button type="button" onClick={() => setStep(2)} className="btn-back">
                  ← Back
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? '⏳ Creating...' : '✨ Create Public Page'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PublicPageSetup;
