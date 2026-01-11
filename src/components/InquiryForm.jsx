import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './InquiryForm.css';

const InquiryForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [existingInquiry, setExistingInquiry] = useState(null);
  const [loadingInquiry, setLoadingInquiry] = useState(true);

  // Check auth and fetch existing inquiries - re-check when auth state changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isAuthenticated) {
      navigate('/login?returnUrl=/inquiry/form');
    } else {
      setIsCheckingAuth(false);
      fetchExistingInquiries();
    }
  }, [navigate, isAuthenticated]);

  const fetchExistingInquiries = async () => {
    setLoadingInquiry(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/api/inquiry/status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success && response.data.inquiries?.length > 0) {
        // Get the most recent inquiry
        const latestInquiry = response.data.inquiries[0];
        
        // Show inquiry status if it's pending or approved
        if (latestInquiry.verificationStatus === 'pending' || latestInquiry.verificationStatus === 'approved') {
          setExistingInquiry(latestInquiry);
        }
      }
    } catch (err) {
      console.error('Error fetching inquiry status:', err);
      // Don't show error - just allow form access
    } finally {
      setLoadingInquiry(false);
    }
  };

  const [purpose, setPurpose] = useState('');
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        navigate('/login?returnUrl=/inquiry/form');
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/api/inquiry/submit`,
        {
          ...formData,
          purpose: purpose
        },
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
        navigate('/login?returnUrl=/inquiry/form');
      } else {
        setError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  // Show loading while checking auth
  if (isCheckingAuth || loadingInquiry) {
    return (
      <div className="inquiry-page">
        <div className="inquiry-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem', width: '40px', height: '40px' }}></div>
          <p style={{ color: '#666' }}>{isCheckingAuth ? 'Verifying access...' : 'Loading inquiry status...'}</p>
        </div>
      </div>
    );
  }

  // Show existing inquiry status if found
  if (existingInquiry) {
    const statusColors = {
      'pending': { bg: '#fff3cd', border: '#ffc107', text: '#856404', icon: '⏳' },
      'approved': { bg: '#d4edda', border: '#28a745', text: '#155724', icon: '✅' },
      'rejected': { bg: '#f8d7da', border: '#dc3545', text: '#721c24', icon: '❌' }
    };

    const statusLabels = {
      'pending': 'Under Review',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };

    const purposeLabels = {
      'connect': 'Connect with Creators/Brands',
      'post': 'Post Campaign'
    };

    const status = existingInquiry.verificationStatus || 'pending';
    const color = statusColors[status] || statusColors.pending;

    return (
      <div className="inquiry-page">
        <div className="inquiry-container">
          <div className="inquiry-header">
            <h1>Your Verification Request</h1>
            <p className="inquiry-subtitle">
              You've already submitted a verification request. Here's the current status.
            </p>
          </div>

          {/* Status Card */}
          <div style={{
            background: color.bg,
            border: `2px solid ${color.border}`,
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2.5rem', marginRight: '1rem' }}>{color.icon}</span>
              <div>
                <h2 style={{ margin: 0, color: color.text, fontSize: '1.5rem' }}>
                  {statusLabels[status]}
                </h2>
                <p style={{ margin: '0.25rem 0 0', color: color.text, fontSize: '0.95rem' }}>
                  {purposeLabels[existingInquiry.purpose] || existingInquiry.purpose}
                </p>
              </div>
            </div>

            {status === 'pending' && (
              <div style={{ color: color.text, fontSize: '0.95rem', lineHeight: '1.6' }}>
                <p style={{ margin: '0.5rem 0' }}>
                  <strong>What's happening now?</strong>
                </p>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  <li>Our team is reviewing your request</li>
                  <li>This typically takes 24-48 hours</li>
                  <li>You'll receive an email notification once reviewed</li>
                </ul>
              </div>
            )}

            {status === 'approved' && (
              <div style={{ color: color.text, fontSize: '0.95rem', lineHeight: '1.6' }}>
                <p style={{ margin: '0.5rem 0' }}>
                  <strong>Congratulations! Your verification is complete.</strong>
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                  You now have full access to the platform features. Check your email for details about your new capabilities.
                </p>
              </div>
            )}
          </div>

          {/* Inquiry Details */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ margin: '0 0 1rem', color: '#333', fontSize: '1.1rem' }}>Submission Details</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '0.5rem 0', color: '#666', width: '140px' }}><strong>Submitted:</strong></td>
                  <td style={{ padding: '0.5rem 0', color: '#333' }}>
                    {new Date(existingInquiry.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem 0', color: '#666' }}><strong>Name:</strong></td>
                  <td style={{ padding: '0.5rem 0', color: '#333' }}>{existingInquiry.name}</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem 0', color: '#666' }}><strong>Role:</strong></td>
                  <td style={{ padding: '0.5rem 0', color: '#333' }}>{existingInquiry.userRole}</td>
                </tr>
                {existingInquiry.company && (
                  <tr>
                    <td style={{ padding: '0.5rem 0', color: '#666' }}><strong>Company:</strong></td>
                    <td style={{ padding: '0.5rem 0', color: '#333' }}>{existingInquiry.company}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ padding: '0.5rem 0', color: '#666' }}><strong>Platforms:</strong></td>
                  <td style={{ padding: '0.5rem 0', color: '#333' }}>
                    {existingInquiry.targetPlatform?.join(', ') || 'N/A'}
                  </td>
                </tr>
                {existingInquiry.budgetRange && (
                  <tr>
                    <td style={{ padding: '0.5rem 0', color: '#666' }}><strong>Budget:</strong></td>
                    <td style={{ padding: '0.5rem 0', color: '#333' }}>{existingInquiry.budgetRange}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="success-actions">
            <button
              className="btn-primary"
              onClick={() => navigate('/live/campaigns')}
            >
              Browse Campaigns
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>

          {status === 'pending' && (
            <p style={{ textAlign: 'center', color: '#999', fontSize: '0.85rem', marginTop: '1.5rem' }}>
              Need help? Contact us at <a href="mailto:hello@auraxai.in" style={{ color: '#667eea' }}>hello@auraxai.in</a>
            </p>
          )}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="inquiry-page">
        <div className="inquiry-container">
          <div className="inquiry-success">
            <div className="success-icon">✓</div>
            <h2>Request Submitted Successfully!</h2>
            <p>
              Your request has been received. You'll be notified via email once approved.
            </p>
            <div className="info-box" style={{
              background: '#f0f7ff',
              border: '1px solid #667eea',
              borderRadius: '8px',
              padding: '1.5rem',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <h3 style={{ margin: '0 0 0.75rem', color: '#667eea', fontSize: '1rem' }}>What happens next?</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#333', fontSize: '0.95rem', lineHeight: '1.8' }}>
                <li>Our team will review your request within 24-48 hours</li>
                <li>You'll receive an email notification once approved</li>
                <li>After approval, you can access the requested features</li>
              </ul>
            </div>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <strong>Note:</strong> Dashboard and premium features will be accessible only after verification approval.
            </p>
            <div className="success-actions">
              <button
                className="btn-primary"
                onClick={() => navigate('/live/campaigns')}
              >
                Browse Campaigns
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderPurpose1Form = () => (
    <>
      {/* Full Name */}
      <div className="form-group">
        <label>Full Name <span className="required">*</span></label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="form-input"
          placeholder="Enter your full name"
        />
      </div>

      {/* I am a */}
      <div className="form-group">
        <label>I am a <span className="required">*</span></label>
        <select
          name="userRole"
          value={formData.userRole}
          onChange={handleChange}
          required
          className="form-select"
        >
          <option value="">Select...</option>
          <option value="Brand">Brand</option>
          <option value="Agency">Agency</option>
          <option value="Individual">Individual</option>
        </select>
      </div>

      {/* Target Platform(s) */}
      <div className="form-group">
        <label>Target Platform(s) <span className="required">*</span></label>
        <div className="platform-checkboxes">
          {['Instagram', 'YouTube', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok', 'Other'].map(platform => (
            <label key={platform} className="checkbox-label">
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

      {/* Company (optional) */}
      <div className="form-group">
        <label>Company / Organization</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="form-input"
          placeholder="Enter company name (optional)"
        />
      </div>

      {/* Budget Range (optional) */}
      <div className="form-group">
        <label>Budget Range</label>
        <select
          name="budgetRange"
          value={formData.budgetRange}
          onChange={handleChange}
          className="form-select"
        >
          <option value="">Select...</option>
          <option value="Under ₹10,000">Under ₹10,000</option>
          <option value="₹10,000 - ₹50,000">₹10,000 - ₹50,000</option>
          <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
          <option value="₹1,00,000 - ₹5,00,000">₹1,00,000 - ₹5,00,000</option>
          <option value="₹5,00,000+">₹5,00,000+</option>
          <option value="Not decided yet">Not decided yet</option>
        </select>
      </div>

      {/* Message (optional) */}
      <div className="form-group">
        <label>Short Message / Requirement</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows="4"
          maxLength="1000"
          className="form-textarea"
          placeholder="Describe what you're looking for (optional)"
        />
        <span className="char-count">{formData.message.length}/1000</span>
      </div>
    </>
  );

  const renderPurpose2Form = () => (
    <>
      {/* Full Name */}
      <div className="form-group">
        <label>Full Name <span className="required">*</span></label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="form-input"
          placeholder="Enter your full name"
        />
      </div>

      {/* I am a */}
      <div className="form-group">
        <label>I am a <span className="required">*</span></label>
        <select
          name="userRole"
          value={formData.userRole}
          onChange={handleChange}
          required
          className="form-select"
        >
          <option value="">Select...</option>
          <option value="Creator">Creator</option>
          <option value="Agency">Agency</option>
        </select>
      </div>

      {/* Primary Niche */}
      <div className="form-group">
        <label>Primary Niche <span className="required">*</span></label>
        <input
          type="text"
          name="niche"
          value={formData.niche}
          onChange={handleChange}
          required
          className="form-input"
          placeholder="e.g., Fashion, Tech, Lifestyle"
        />
      </div>

      {/* Platform(s) */}
      <div className="form-group">
        <label>Platform(s) <span className="required">*</span></label>
        <div className="platform-checkboxes">
          {['Instagram', 'YouTube', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok', 'Other'].map(platform => (
            <label key={platform} className="checkbox-label">
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

      {/* Portfolio/Profile Link (optional) */}
      <div className="form-group">
        <label>Portfolio / Profile Link</label>
        <input
          type="url"
          name="portfolioLink"
          value={formData.portfolioLink}
          onChange={handleChange}
          className="form-input"
          placeholder="https://... (optional)"
        />
      </div>

      {/* Message (optional) */}
      <div className="form-group">
        <label>Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows="4"
          maxLength="1000"
          className="form-textarea"
          placeholder="Tell us about the campaign you're interested in (optional)"
        />
        <span className="char-count">{formData.message.length}/1000</span>
      </div>
    </>
  );

  const renderPurpose3Form = () => (
    <>
      {/* Brand/Company Name */}
      <div className="form-group">
        <label>Brand / Company Name <span className="required">*</span></label>
        <input
          type="text"
          name="brandName"
          value={formData.brandName}
          onChange={handleChange}
          required
          className="form-input"
          placeholder="Enter brand name"
        />
      </div>

      {/* Campaign Title */}
      <div className="form-group">
        <label>Campaign Title <span className="required">*</span></label>
        <input
          type="text"
          name="campaignTitle"
          value={formData.campaignTitle}
          onChange={handleChange}
          required
          className="form-input"
          placeholder="Enter campaign title"
        />
      </div>

      {/* Platform(s) */}
      <div className="form-group">
        <label>Platform(s) <span className="required">*</span></label>
        <div className="platform-checkboxes">
          {['Instagram', 'YouTube', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok', 'Other'].map(platform => (
            <label key={platform} className="checkbox-label">
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

      {/* Budget */}
      <div className="form-group">
        <label>Budget <span className="required">*</span></label>
        <select
          name="budgetRange"
          value={formData.budgetRange}
          onChange={handleChange}
          required
          className="form-select"
        >
          <option value="">Select budget range...</option>
          <option value="Under ₹10,000">Under ₹10,000</option>
          <option value="₹10,000 - ₹50,000">₹10,000 - ₹50,000</option>
          <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
          <option value="₹1,00,000 - ₹5,00,000">₹1,00,000 - ₹5,00,000</option>
          <option value="₹5,00,000+">₹5,00,000+</option>
        </select>
      </div>

      {/* Creator Category/Niche */}
      <div className="form-group">
        <label>Creator Category / Niche <span className="required">*</span></label>
        <input
          type="text"
          name="creatorCategory"
          value={formData.creatorCategory}
          onChange={handleChange}
          required
          className="form-input"
          placeholder="e.g., Fashion, Tech, Food, Travel"
        />
      </div>

      {/* Follower Range (optional) */}
      <div className="form-group">
        <label>Follower Range</label>
        <select
          name="followerRange"
          value={formData.followerRange}
          onChange={handleChange}
          className="form-select"
        >
          <option value="">Select...</option>
          <option value="Nano (1K - 10K)">Nano (1K - 10K)</option>
          <option value="Micro (10K - 50K)">Micro (10K - 50K)</option>
          <option value="Mid-tier (50K - 500K)">Mid-tier (50K - 500K)</option>
          <option value="Macro (500K - 1M)">Macro (500K - 1M)</option>
          <option value="Mega (1M+)">Mega (1M+)</option>
        </select>
      </div>

      {/* Location (optional) */}
      <div className="form-group">
        <label>Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="form-input"
          placeholder="Target location (optional)"
        />
      </div>

      {/* Deliverables (optional) */}
      <div className="form-group">
        <label>Deliverables</label>
        <textarea
          name="deliverables"
          value={formData.deliverables}
          onChange={handleChange}
          rows="3"
          maxLength="500"
          className="form-textarea"
          placeholder="Expected deliverables (e.g., 3 posts, 2 stories, 1 reel)"
        />
        <span className="char-count">{formData.deliverables.length}/500</span>
      </div>

      {/* Timeline (optional) */}
      <div className="form-group">
        <label>Timeline</label>
        <input
          type="text"
          name="timeline"
          value={formData.timeline}
          onChange={handleChange}
          className="form-input"
          placeholder="Campaign duration (optional)"
        />
      </div>

      {/* Additional Notes (optional) */}
      <div className="form-group">
        <label>Additional Notes</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows="4"
          maxLength="1000"
          className="form-textarea"
          placeholder="Any additional details (optional)"
        />
        <span className="char-count">{formData.message.length}/1000</span>
      </div>
    </>
  );

  return (
    <div className="inquiry-page">
      <div className="inquiry-container">
        <div className="inquiry-header">
          <h1>Human Verification Required</h1>
          <p className="inquiry-subtitle">
            To ensure quality interactions on AURAX, we verify all users before granting 
            access to premium features.
          </p>
        </div>

        {error && (
          <div className="inquiry-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="inquiry-form">
          {/* PURPOSE FIELD - PRIMARY SELECTOR */}
          <div className="form-group purpose-group">
            <label>Purpose <span className="required">*</span></label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              className="form-select purpose-select"
            >
              <option value="">Select your purpose...</option>
              <option value="connect_creators">Connect with Creators</option>
              <option value="connect_brands">Connect with Brands (Campaign Requirement)</option>
              <option value="post_campaign">Post a Campaign</option>
            </select>
            <p className="field-hint">
              Your selected purpose determines the information required and the access you'll receive after verification.
            </p>
          </div>

          {/* DYNAMIC FORM RENDERING */}
          {purpose === 'connect_creators' && (
            <div className="dynamic-form-section">
              <h3 className="form-section-title">Connect with Creators</h3>
              <p className="form-section-description">
                For brands, agencies, or individuals looking to discover and connect with creators.
              </p>
              {renderPurpose1Form()}
            </div>
          )}

          {purpose === 'connect_brands' && (
            <div className="dynamic-form-section">
              <h3 className="form-section-title">Connect with Brands</h3>
              <p className="form-section-description">
                For creators or agencies wanting to discuss or respond to campaign requirements.
              </p>
              {renderPurpose2Form()}
            </div>
          )}

          {purpose === 'post_campaign' && (
            <div className="dynamic-form-section">
              <h3 className="form-section-title">Post a Campaign</h3>
              <p className="form-section-description">
                For brands and agencies posting LIVE campaign requirements.
              </p>
              {renderPurpose3Form()}
            </div>
          )}

          {/* Submit Button - only show if purpose selected */}
          {purpose && (
            <>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit for Verification'
                )}
              </button>

              <p className="form-note">
                <strong>Note:</strong> This is a one-time verification process. Once approved, 
                you'll have full access to the requested features.
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default InquiryForm;
