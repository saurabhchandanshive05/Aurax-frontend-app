import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './InquiryFormMobile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const PURPOSES = {
  CONNECT_CREATORS: 'connect-creators',
  CONNECT_BRANDS: 'connect-brands',
  POST_CAMPAIGN: 'post-campaign'
};

const InquiryFormMobile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Purpose Selection, 2: Form
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [existingInquiry, setExistingInquiry] = useState(null);
  const [loadingInquiry, setLoadingInquiry] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    userRole: '',
    company: '',
    budgetRange: '',
    message: '',
    targetPlatform: [],
    niche: '',
    portfolioLink: '',
    campaignTitle: '',
    brandName: '',
    creatorCategory: '',
    followerRange: '',
    location: '',
    deliverables: '',
    timeline: ''
  });

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isAuthenticated) {
      navigate('/creator/login?returnUrl=/inquiry/form');
    } else {
      fetchExistingInquiries();
    }
  }, [navigate, isAuthenticated]);

  // Pre-fill purpose from URL params
  useEffect(() => {
    const purposeParam = searchParams.get('purpose');
    if (purposeParam === 'connect') {
      setPurpose(PURPOSES.CONNECT_CREATORS);
      setStep(2);
    } else if (purposeParam === 'campaign') {
      setPurpose(PURPOSES.POST_CAMPAIGN);
      setStep(2);
    }
  }, [searchParams]);

  const fetchExistingInquiries = async () => {
    setLoadingInquiry(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/inquiry/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success && response.data.inquiries?.length > 0) {
        const latestInquiry = response.data.inquiries[0];
        if (latestInquiry.verificationStatus === 'pending' || latestInquiry.verificationStatus === 'approved') {
          setExistingInquiry(latestInquiry);
        }
      }
    } catch (err) {
      console.error('Error fetching inquiry status:', err);
    } finally {
      setLoadingInquiry(false);
    }
  };

  const handlePurposeSelect = (selectedPurpose) => {
    setPurpose(selectedPurpose);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setPurpose('');
    } else {
      navigate(-1);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlatformChange = (platform) => {
    setFormData(prev => {
      const platforms = prev.targetPlatform.includes(platform)
        ? prev.targetPlatform.filter(p => p !== platform)
        : [...prev.targetPlatform, platform];
      return { ...prev, targetPlatform: platforms };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/creator/login?returnUrl=/inquiry/form');
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/inquiry/submit`,
        { ...formData, purpose },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Inquiry submission error:', err);
      if (err.response?.status === 401) {
        navigate('/creator/login?returnUrl=/inquiry/form');
      } else {
        setError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (step === 1) return 20;
    if (step === 2) return 60;
    return 100;
  };

  const isFormValid = () => {
    if (!formData.name || !formData.userRole || formData.targetPlatform.length === 0) {
      return false;
    }

    // Purpose-specific validations
    if (purpose === PURPOSES.POST_CAMPAIGN) {
      return formData.campaignTitle && formData.brandName;
    }

    return true;
  };

  // Loading screen
  if (loadingInquiry) {
    return (
      <div className="inquiryMobileContainer">
        <div className="loadingScreen">
          <div className="loadingSpinner"></div>
          <p className="loadingText">Loading inquiry status...</p>
        </div>
      </div>
    );
  }

  // Show existing inquiry status
  if (existingInquiry) {
    const status = existingInquiry.verificationStatus;
    
    return (
      <div className="inquiryMobileContainer">
        <div className="existingInquiryStatus">
          <div className={`statusCard ${status}`}>
            <div className={`statusBadge ${status}`}>
              {status === 'pending' && '⏳ Under Review'}
              {status === 'approved' && '✓ Verified'}
              {status === 'rejected' && '✗ Not Approved'}
            </div>

            <h2 className="statusTitle">
              {status === 'pending' && 'Your Request is Being Reviewed'}
              {status === 'approved' && 'Verification Complete!'}
              {status === 'rejected' && 'Request Not Approved'}
            </h2>

            <p className="statusDesc">
              {status === 'pending' && 'Our team is reviewing your request. This typically takes 24-48 hours. You\'ll receive an email notification once reviewed.'}
              {status === 'approved' && 'Congratulations! You now have full access to platform features. Check your email for details about your new capabilities.'}
              {status === 'rejected' && 'Your request was not approved. Please contact us if you believe this was an error.'}
            </p>

            <div className="statusDetails">
              <div className="statusDetailRow">
                <span className="statusDetailLabel">Submitted</span>
                <span className="statusDetailValue">
                  {new Date(existingInquiry.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="statusDetailRow">
                <span className="statusDetailLabel">Name</span>
                <span className="statusDetailValue">{existingInquiry.name}</span>
              </div>
              <div className="statusDetailRow">
                <span className="statusDetailLabel">Role</span>
                <span className="statusDetailValue">{existingInquiry.userRole}</span>
              </div>
              {existingInquiry.company && (
                <div className="statusDetailRow">
                  <span className="statusDetailLabel">Company</span>
                  <span className="statusDetailValue">{existingInquiry.company}</span>
                </div>
              )}
            </div>

            {status === 'pending' && (
              <div className="infoBox warning">
                <div className="infoBoxTitle">⏰ What happens next?</div>
                <div className="infoBoxContent">
                  <ul>
                    <li>Team review in progress</li>
                    <li>Email notification on approval</li>
                    <li>Access granted after approval</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="resultActions">
            <button className="resultBtn primary" onClick={() => navigate('/live/campaigns')}>
              Browse Campaigns
            </button>
            <button className="resultBtn secondary" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="inquiryMobileContainer">
        <div className="inquiryResult">
          <div className="resultIcon success">✓</div>
          <h2 className="resultTitle">Request Submitted!</h2>
          <p className="resultDesc">
            Your request has been received. You'll be notified via email once approved.
          </p>

          <div className="infoBox success">
            <div className="infoBoxTitle">✓ What happens next?</div>
            <div className="infoBoxContent">
              <ul>
                <li>Team review within 24-48 hours</li>
                <li>Email notification on approval</li>
                <li>Features accessible after approval</li>
              </ul>
            </div>
          </div>

          <div className="resultActions">
            <button className="resultBtn primary" onClick={() => navigate('/live/campaigns')}>
              Browse Campaigns
            </button>
            <button className="resultBtn secondary" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="inquiryMobileContainer">
        <div className="inquiryResult">
          <div className="resultIcon error">✗</div>
          <h2 className="resultTitle">Submission Failed</h2>
          <p className="resultDesc">{error}</p>

          <div className="resultActions">
            <button className="resultBtn primary" onClick={() => setError('')}>
              Try Again
            </button>
            <button className="resultBtn secondary" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inquiryMobileContainer">
      {/* Progress Bar */}
      <div className="progressBar">
        <div className="progressTrack">
          <div className="progressFill" style={{ width: `${getProgressPercentage()}%` }}></div>
        </div>
        <div className="progressLabel">
          <span>Step {step} of 2</span>
          <span>{getProgressPercentage()}%</span>
        </div>
      </div>

      {/* Step 1: Purpose Selection */}
      {step === 1 && (
        <div className="purposeSelection">
          <h1 className="purposeTitle">What brings you here?</h1>
          <p className="purposeSubtitle">
            Select your primary purpose to get started
          </p>

          <div className="purposeCards">
            <div
              className={`purposeCard ${purpose === PURPOSES.CONNECT_CREATORS ? 'selected' : ''}`}
              onClick={() => handlePurposeSelect(PURPOSES.CONNECT_CREATORS)}
            >
              <div className="purposeIcon">🤝</div>
              <h3 className="purposeCardTitle">Connect with Creators</h3>
              <p className="purposeCardDesc">
                Looking to collaborate with influencers and content creators
              </p>
              <span className="purposeCardBadge">For Brands & Agencies</span>
            </div>

            <div
              className={`purposeCard ${purpose === PURPOSES.CONNECT_BRANDS ? 'selected' : ''}`}
              onClick={() => handlePurposeSelect(PURPOSES.CONNECT_BRANDS)}
            >
              <div className="purposeIcon">🎯</div>
              <h3 className="purposeCardTitle">Connect with Brands</h3>
              <p className="purposeCardDesc">
                Want to find brand collaboration opportunities
              </p>
              <span className="purposeCardBadge">For Creators</span>
              <p className="purposeCardNote">
                Note: This requires campaign posting from brands
              </p>
            </div>

            <div
              className={`purposeCard ${purpose === PURPOSES.POST_CAMPAIGN ? 'selected' : ''}`}
              onClick={() => handlePurposeSelect(PURPOSES.POST_CAMPAIGN)}
            >
              <div className="purposeIcon">📝</div>
              <h3 className="purposeCardTitle">Post a Campaign</h3>
              <p className="purposeCardDesc">
                Ready to launch a creator collaboration campaign
              </p>
              <span className="purposeCardBadge">Requires Verification</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Form (Dynamic based on purpose) */}
      {step === 2 && (
        <form className="formContent" onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div className="formSection">
            <h3 className="formSectionTitle">
              📋 Basic Information
            </h3>
            <p className="formSectionDesc">
              Tell us about yourself
            </p>

            <div className="formGroup">
              <label className="formLabel">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="formInput"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="formGroup">
              <label className="formLabel">
                I am a <span className="required">*</span>
              </label>
              <select
                name="userRole"
                value={formData.userRole}
                onChange={handleChange}
                className="formSelect"
                required
              >
                <option value="">Select your role...</option>
                <option value="Brand">Brand</option>
                <option value="Agency">Agency</option>
                <option value="Creator">Creator</option>
                <option value="Individual">Individual</option>
              </select>
            </div>

            <div className="formGroup">
              <label className="formLabel">Company (Optional)</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="formInput"
                placeholder="Your company name"
              />
            </div>
          </div>

          {/* Platform Selection */}
          <div className="formSection">
            <h3 className="formSectionTitle">
              📱 Target Platforms
            </h3>
            <p className="formSectionDesc">
              Select all platforms you're interested in
            </p>

            <div className="platformCheckboxes">
              {['Instagram', 'YouTube', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok'].map(platform => (
                <label key={platform} className="checkboxLabel">
                  <input
                    type="checkbox"
                    checked={formData.targetPlatform.includes(platform)}
                    onChange={() => handlePlatformChange(platform)}
                  />
                  <span>{platform}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Purpose-Specific Fields */}
          {purpose === PURPOSES.POST_CAMPAIGN && (
            <div className="formSection">
              <h3 className="formSectionTitle">
                🎯 Campaign Details
              </h3>
              <p className="formSectionDesc">
                Tell us about your campaign
              </p>

              <div className="formGroup">
                <label className="formLabel">
                  Campaign Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="campaignTitle"
                  value={formData.campaignTitle}
                  onChange={handleChange}
                  className="formInput"
                  placeholder="e.g., Summer Product Launch"
                  required
                />
              </div>

              <div className="formGroup">
                <label className="formLabel">
                  Brand Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleChange}
                  className="formInput"
                  placeholder="Your brand name"
                  required
                />
              </div>

              <div className="formGroup">
                <label className="formLabel">Budget Range (Optional)</label>
                <select
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  className="formSelect"
                >
                  <option value="">Select budget range...</option>
                  <option value="Under ₹50K">Under ₹50K</option>
                  <option value="₹50K - ₹1L">₹50K - ₹1L</option>
                  <option value="₹1L - ₹5L">₹1L - ₹5L</option>
                  <option value="₹5L+">₹5L+</option>
                </select>
              </div>
            </div>
          )}

          {purpose === PURPOSES.CONNECT_CREATORS && (
            <div className="formSection">
              <h3 className="formSectionTitle">
                🎨 Creator Preferences
              </h3>
              <p className="formSectionDesc">
                What type of creators are you looking for?
              </p>

              <div className="formGroup">
                <label className="formLabel">Niche/Category (Optional)</label>
                <input
                  type="text"
                  name="niche"
                  value={formData.niche}
                  onChange={handleChange}
                  className="formInput"
                  placeholder="e.g., Fashion, Tech, Food"
                />
              </div>

              <div className="formGroup">
                <label className="formLabel">Follower Range (Optional)</label>
                <select
                  name="followerRange"
                  value={formData.followerRange}
                  onChange={handleChange}
                  className="formSelect"
                >
                  <option value="">Any size...</option>
                  <option value="1K-10K">1K - 10K (Micro)</option>
                  <option value="10K-100K">10K - 100K (Mid-tier)</option>
                  <option value="100K-1M">100K - 1M (Macro)</option>
                  <option value="1M+">1M+ (Mega)</option>
                </select>
              </div>
            </div>
          )}

          {/* Additional Message */}
          <div className="formSection">
            <h3 className="formSectionTitle">
              💬 Additional Information
            </h3>

            <div className="formGroup">
              <label className="formLabel">
                Message (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="formTextarea"
                placeholder="Tell us more about your requirements..."
              />
              <p className="formHelp">
                Share any specific requirements or questions
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="infoBox">
            <div className="infoBoxTitle">ℹ️ What happens after submission?</div>
            <div className="infoBoxContent">
              <ul>
                <li>Team reviews your request (24-48 hours)</li>
                <li>Email notification on approval</li>
                <li>Features unlock after verification</li>
              </ul>
            </div>
          </div>
        </form>
      )}

      {/* Bottom Action Bar */}
      {step > 0 && (
        <div className="bottomActionBar">
          <div className="actionButtons">
            <button
              type="button"
              className="btnBack"
              onClick={handleBack}
              disabled={loading}
            >
              ← Back
            </button>
            {step === 2 && (
              <button
                type="submit"
                className={`btnSubmit ${loading ? 'loading' : ''}`}
                onClick={handleSubmit}
                disabled={loading || !isFormValid()}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryFormMobile;
