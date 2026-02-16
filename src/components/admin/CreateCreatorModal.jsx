import React, { useState } from 'react';
import axios from 'axios';
import './CreateCreatorModal.css';

const CreateCreatorModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic Info (Required)
    name: '',
    displayName: '',
    category: 'General',
    location: '',
    city: '',
    bio: '',
    
    // Social Media (At least Instagram required)
    instagram: '',
    youtube: '',
    tiktok: '',
    facebook: '',
    twitter: '',
    
    // Social Stats
    followers: 0,
    followingCount: 0,
    postCount: 0,
    profilePictureUrl: '',
    avgReelViews: 0,
    engagementRate: 0,
    
    // Contact Info
    email: '',
    phone: '',
    whatsappNumber: '',
    websiteUrl: '',
    mediaKitLink: '',
    
    // Management
    managementType: 'SELF_MANAGED',
    managementHandle: '',
    managerName: '',
    managerContact: '',
    
    // Content Details
    primaryNiche: '',
    secondaryNiche: '',
    languages: 'English',
    contentFormats: '',
    
    // Pricing (INR)
    rateStory: 0,
    rateReel: 0,
    ratePost: 0,
    
    // Status & Controls
    onboardingStatus: 'NEW',
    priority: 'Medium',
    verifiedContact: false,
    availableForPR: false,
    availableForPaid: false,
    allowCampaigns: true,
    
    // Admin Notes
    adminNotes: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!formData.name.trim()) {
      setError('Creator name is required');
      return;
    }
    
    if (!formData.instagram.trim()) {
      setError('Instagram handle is required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Prepare data for API
      const creatorData = {
        name: formData.name.trim(),
        displayName: formData.displayName.trim() || formData.name.trim(),
        category: formData.category,
        location: formData.location.trim(),
        city: formData.city.trim(),
        bio: formData.bio.trim(),
        
        // Social Media
        socials: {
          instagram: formData.instagram.trim().replace('@', ''),
          youtube: formData.youtube.trim(),
          tiktok: formData.tiktok.trim(),
          facebook: formData.facebook.trim(),
          twitter: formData.twitter.trim()
        },
        
        // Social Stats
        followers: parseInt(formData.followers) || 0,
        followingCount: parseInt(formData.followingCount) || 0,
        postCount: parseInt(formData.postCount) || 0,
        profilePictureUrl: formData.profilePictureUrl.trim(),
        avgReelViews: parseInt(formData.avgReelViews) || 0,
        engagementRate: parseFloat(formData.engagementRate) || 0,
        
        // Contact
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        whatsappNumber: formData.whatsappNumber.trim(),
        websiteUrl: formData.websiteUrl.trim(),
        mediaKitLink: formData.mediaKitLink.trim(),
        
        // Management
        managementType: formData.managementType,
        managementHandle: formData.managementHandle.trim(),
        managerName: formData.managerName.trim(),
        managerContact: formData.managerContact.trim(),
        
        // Content
        primaryNiche: formData.primaryNiche.trim(),
        secondaryNiche: formData.secondaryNiche.trim(),
        languages: formData.languages.split(',').map(l => l.trim()).filter(Boolean),
        contentFormats: formData.contentFormats.split(',').map(f => f.trim()).filter(Boolean),
        
        // Pricing
        rateStory: parseInt(formData.rateStory) || 0,
        rateReel: parseInt(formData.rateReel) || 0,
        ratePost: parseInt(formData.ratePost) || 0,
        
        // Status
        onboardingStatus: formData.onboardingStatus,
        priority: formData.priority,
        verifiedContact: formData.verifiedContact,
        availableForPR: formData.availableForPR,
        availableForPaid: formData.availableForPaid,
        allowCampaigns: formData.allowCampaigns,
        
        // Admin
        adminNotes: formData.adminNotes.trim(),
        
        // Metadata
        profileLink: `https://instagram.com/${formData.instagram.trim().replace('@', '')}`,
        source: 'MANUAL',
        importedFrom: 'ADMIN_DASHBOARD',
        tags: [formData.category.toLowerCase()]
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/api/admin/creators`,
        creatorData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('✅ Creator profile created successfully!');
        onSuccess(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error('Error creating creator:', error);
      setError(error.response?.data?.error || 'Failed to create creator profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-creator-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Create New Creator Profile</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="creator-form">
          {error && (
            <div className="error-banner">
              ⚠️ {error}
            </div>
          )}

          {/* Basic Information */}
          <section className="form-section">
            <h3>📝 Basic Information</h3>
            <div className="form-grid">
              <div className="form-field required">
                <label>Creator Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Priya Sharma"
                  required
                />
              </div>

              <div className="form-field">
                <label>Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="Public display name"
                />
              </div>

              <div className="form-field">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="General">General</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Tech">Tech</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div className="form-field">
                <label>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleInputChange}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="form-field">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., Mumbai"
                />
              </div>

              <div className="form-field">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Mumbai, India"
                />
              </div>

              <div className="form-field full-width">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Short bio or description..."
                  rows="3"
                />
              </div>
            </div>
          </section>

          {/* Social Media */}
          <section className="form-section">
            <h3>📱 Social Media Handles</h3>
            <div className="form-grid">
              <div className="form-field required">
                <label>Instagram Handle *</label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="username (without @)"
                  required
                />
              </div>

              <div className="form-field">
                <label>YouTube Channel</label>
                <input
                  type="text"
                  name="youtube"
                  value={formData.youtube}
                  onChange={handleInputChange}
                  placeholder="channel name"
                />
              </div>

              <div className="form-field">
                <label>TikTok</label>
                <input
                  type="text"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleInputChange}
                  placeholder="username"
                />
              </div>

              <div className="form-field">
                <label>Facebook</label>
                <input
                  type="text"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  placeholder="page name"
                />
              </div>

              <div className="form-field">
                <label>Twitter/X</label>
                <input
                  type="text"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="username"
                />
              </div>
            </div>
          </section>

          {/* Social Stats */}
          <section className="form-section">
            <h3>📊 Social Media Stats</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Followers</label>
                <input
                  type="number"
                  name="followers"
                  value={formData.followers}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-field">
                <label>Following</label>
                <input
                  type="number"
                  name="followingCount"
                  value={formData.followingCount}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-field">
                <label>Posts</label>
                <input
                  type="number"
                  name="postCount"
                  value={formData.postCount}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-field">
                <label>Avg Reel Views</label>
                <input
                  type="number"
                  name="avgReelViews"
                  value={formData.avgReelViews}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-field">
                <label>Engagement Rate (%)</label>
                <input
                  type="number"
                  name="engagementRate"
                  value={formData.engagementRate}
                  onChange={handleInputChange}
                  placeholder="0.0"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="form-field full-width">
                <label>Profile Picture URL</label>
                <input
                  type="url"
                  name="profilePictureUrl"
                  value={formData.profilePictureUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/profile.jpg"
                />
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="form-section">
            <h3>📞 Contact Information</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Business Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="creator@example.com"
                />
              </div>

              <div className="form-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="form-field">
                <label>WhatsApp Number</label>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="form-field">
                <label>Website URL</label>
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-field">
                <label>Media Kit Link</label>
                <input
                  type="url"
                  name="mediaKitLink"
                  value={formData.mediaKitLink}
                  onChange={handleInputChange}
                  placeholder="https://example.com/mediakit.pdf"
                />
              </div>
            </div>
          </section>

          {/* Management */}
          <section className="form-section">
            <h3>🏢 Management Details</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Management Type</label>
                <select name="managementType" value={formData.managementType} onChange={handleInputChange}>
                  <option value="SELF_MANAGED">Self-Managed</option>
                  <option value="AGENCY_MANAGED">Agency Managed</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>

              <div className="form-field">
                <label>Management Handle</label>
                <input
                  type="text"
                  name="managementHandle"
                  value={formData.managementHandle}
                  onChange={handleInputChange}
                  placeholder="@agencyname"
                />
              </div>

              <div className="form-field">
                <label>Manager Name</label>
                <input
                  type="text"
                  name="managerName"
                  value={formData.managerName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </div>

              <div className="form-field">
                <label>Manager Contact</label>
                <input
                  type="text"
                  name="managerContact"
                  value={formData.managerContact}
                  onChange={handleInputChange}
                  placeholder="manager@agency.com"
                />
              </div>
            </div>
          </section>

          {/* Content Details */}
          <section className="form-section">
            <h3>🎨 Content Details</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Primary Niche</label>
                <input
                  type="text"
                  name="primaryNiche"
                  value={formData.primaryNiche}
                  onChange={handleInputChange}
                  placeholder="e.g., Fashion"
                />
              </div>

              <div className="form-field">
                <label>Secondary Niche</label>
                <input
                  type="text"
                  name="secondaryNiche"
                  value={formData.secondaryNiche}
                  onChange={handleInputChange}
                  placeholder="e.g., Lifestyle"
                />
              </div>

              <div className="form-field">
                <label>Languages (comma-separated)</label>
                <input
                  type="text"
                  name="languages"
                  value={formData.languages}
                  onChange={handleInputChange}
                  placeholder="English, Hindi, Tamil"
                />
              </div>

              <div className="form-field">
                <label>Content Formats (comma-separated)</label>
                <input
                  type="text"
                  name="contentFormats"
                  value={formData.contentFormats}
                  onChange={handleInputChange}
                  placeholder="Reels, Stories, Posts, IGTV"
                />
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="form-section">
            <h3>💰 Pricing (INR)</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Story Rate</label>
                <input
                  type="number"
                  name="rateStory"
                  value={formData.rateStory}
                  onChange={handleInputChange}
                  placeholder="5000"
                  min="0"
                />
              </div>

              <div className="form-field">
                <label>Reel Rate</label>
                <input
                  type="number"
                  name="rateReel"
                  value={formData.rateReel}
                  onChange={handleInputChange}
                  placeholder="15000"
                  min="0"
                />
              </div>

              <div className="form-field">
                <label>Post Rate</label>
                <input
                  type="number"
                  name="ratePost"
                  value={formData.ratePost}
                  onChange={handleInputChange}
                  placeholder="10000"
                  min="0"
                />
              </div>
            </div>
          </section>

          {/* Status & Controls */}
          <section className="form-section">
            <h3>⚙️ Status & Controls</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Onboarding Status</label>
                <select name="onboardingStatus" value={formData.onboardingStatus} onChange={handleInputChange}>
                  <option value="NEW">New</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="form-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="verifiedContact"
                    checked={formData.verifiedContact}
                    onChange={handleInputChange}
                  />
                  <span>Verified Contact</span>
                </label>
              </div>

              <div className="form-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="availableForPR"
                    checked={formData.availableForPR}
                    onChange={handleInputChange}
                  />
                  <span>Available for PR</span>
                </label>
              </div>

              <div className="form-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="availableForPaid"
                    checked={formData.availableForPaid}
                    onChange={handleInputChange}
                  />
                  <span>Available for Paid</span>
                </label>
              </div>

              <div className="form-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="allowCampaigns"
                    checked={formData.allowCampaigns}
                    onChange={handleInputChange}
                  />
                  <span>Allow Campaigns</span>
                </label>
              </div>
            </div>
          </section>

          {/* Admin Notes */}
          <section className="form-section">
            <h3>📋 Admin Notes</h3>
            <div className="form-field full-width">
              <textarea
                name="adminNotes"
                value={formData.adminNotes}
                onChange={handleInputChange}
                placeholder="Internal notes about this creator..."
                rows="4"
              />
            </div>
          </section>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating...' : '✓ Create Creator Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCreatorModal;
