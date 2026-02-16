import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminNav from '../../components/admin/AdminNav';
import styles from './CampaignCurator.module.css';

const CampaignCurator = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    // Brand info
    brandName: '',
    posterName: '',
    posterRole: '',
    company: '',
    isVerified: false,
    
    // Creator visual fields
    profilePicture: '',
    linkedinVerified: false,
    linkedinUrl: '',
    
    // Campaign details
    title: '',
    intent: '',
    description: '',
    objective: '',
    deliverables: '',
    
    // Highlights
    budget: '',
    platform: '',
    category: '',
    locations: '',
    
    // Requirements
    followerRange: { min: '', max: '' },
    avgViews: '',
    creatorsNeeded: 1,
    gender: 'Any',
    ageRange: { min: '', max: '' },
    timeline: '',
    deadline: '',
    
    // Admin fields
    isHandPicked: false,
    contactVerified: false,
    sourceType: 'manual',
    sourceUrl: '',
    contactPerson: '',
    contactMethod: '',
    rawText: '',
    sourceNotes: '',
    moderationNotes: '',
    status: 'live'
  });

  // Check if user is admin
  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) {
      return;
    }

    if (!isAuthenticated || !currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    const hasAdminRole = currentUser?.roles?.includes('admin') || currentUser?.role === 'admin';
    if (!hasAdminRole) {
      navigate('/', { replace: true });
      return;
    }
    fetchCampaigns();
  }, [isAuthenticated, currentUser, isLoading, navigate]);

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      brandName: campaign.brandName || '',
      posterName: campaign.posterName || '',
      posterRole: campaign.posterRole || '',
      company: campaign.company || '',
      isVerified: campaign.isVerified || false,
      profilePicture: campaign.profilePicture || '',
      linkedinVerified: campaign.linkedinVerified || false,
      linkedinUrl: campaign.linkedinUrl || '',
      title: campaign.title || '',
      intent: campaign.intent || '',
      description: campaign.description || '',
      objective: campaign.objective || '',
      deliverables: campaign.deliverables?.join('\n') || '',
      budget: `${campaign.budget?.min || ''}-${campaign.budget?.max || ''}`,
      platform: campaign.platform || '',
      category: campaign.category?.join(', ') || '',
      locations: campaign.locations?.join(', ') || '',
      followerRange: campaign.followerRange || { min: '', max: '' },
      avgViews: campaign.avgViews || '',
      creatorsNeeded: campaign.creatorsNeeded || 1,
      gender: campaign.gender || 'Any',
      ageRange: campaign.ageRange || { min: '', max: '' },
      timeline: campaign.timeline || '',
      deadline: campaign.deadline ? new Date(campaign.deadline).toISOString().split('T')[0] : '',
      isHandPicked: campaign.isHandPicked || false,
      contactVerified: campaign.contactVerified || false,
      sourceType: campaign.source?.type || 'manual',
      sourceUrl: campaign.source?.url || '',
      contactPerson: campaign.source?.contactPerson || '',
      contactMethod: campaign.source?.contactMethod || '',
      rawText: campaign.source?.rawText || '',
      sourceNotes: campaign.source?.notes || '',
      moderationNotes: campaign.moderationNotes || '',
      status: campaign.status || 'live'
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5002/api/admin/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setCampaigns(data.data);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      // Prepare payload
      const payload = {
        brandName: formData.brandName || 'Available on request',
        posterName: formData.posterName,
        posterRole: formData.posterRole,
        company: formData.company,
        isVerified: formData.isVerified,
        
        // Creator visual fields
        profilePicture: formData.profilePicture,
        linkedinVerified: formData.linkedinVerified,
        linkedinUrl: formData.linkedinUrl,
        
        title: formData.title,
        intent: formData.intent,
        description: formData.description || 'Details will be shared with shortlisted creators',
        objective: formData.objective,
        deliverables: formData.deliverables.split(',').map(d => d.trim()).filter(Boolean),
        
        budget: (() => {
          // Parse budget string like "18k-30k", "18000-30000", or "18k" into {min, max, currency}
          if (typeof formData.budget === 'string' && formData.budget.trim()) {
            // Match range format: "18k-30k" or "18000-30000"
            const rangeMatch = formData.budget.match(/(\d+)(k)?\s*-\s*(\d+)(k)?/i);
            if (rangeMatch) {
              const min = parseInt(rangeMatch[1]) * (rangeMatch[2] ? 1000 : 1);
              const max = parseInt(rangeMatch[3]) * (rangeMatch[4] ? 1000 : 1);
              return { min, max, currency: 'INR' };
            }
            // Single value like "18k" or "18000"
            const singleMatch = formData.budget.match(/(\d+)(k)?/i);
            if (singleMatch) {
              const value = parseInt(singleMatch[1]) * (singleMatch[2] ? 1000 : 1);
              return { min: value, max: Math.round(value * 1.5), currency: 'INR' };
            }
          }
          // Already an object or empty
          return formData.budget && typeof formData.budget === 'object' 
            ? formData.budget 
            : { min: 0, max: 0, currency: 'INR' };
        })(),
        platform: formData.platform,
        category: formData.category.split(',').map(c => c.trim()).filter(Boolean),
        locations: formData.locations.split(',').map(l => l.trim()).filter(Boolean),
        
        followerRange: {
          min: parseInt(formData.followerRange.min) || 0,
          max: parseInt(formData.followerRange.max) || 0
        },
        avgViews: {
          min: parseInt(formData.avgViews) || 0,
          max: parseInt(formData.avgViews) * 1.5 || 0
        },
        creatorsNeeded: parseInt(formData.creatorsNeeded) || 1,
        gender: formData.gender,
        ageRange: {
          min: parseInt(formData.ageRange.min) || 0,
          max: parseInt(formData.ageRange.max) || 0
        },
        timeline: formData.timeline,
        deadline: formData.deadline,
        
        status: formData.status,
        isHandPicked: formData.isHandPicked,
        moderationNotes: formData.moderationNotes,
        
        // Admin-only source info
        source: {
          type: formData.sourceType,
          url: formData.sourceUrl,
          contactPerson: formData.contactPerson,
          contactMethod: formData.contactMethod,
          rawText: formData.rawText,
          notes: formData.sourceNotes
        },
        contactVerified: formData.contactVerified
      };

      const url = editingCampaign 
        ? `http://localhost:5002/api/admin/campaigns/${editingCampaign._id}`
        : 'http://localhost:5002/api/admin/campaigns';
      
      const method = editingCampaign ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Campaign save failed:', {
          status: response.status,
          error: data.error,
          details: data.details,
          validation: data.validation
        });
        
        // Show specific error message
        const errorMsg = data.details || data.error || 'Failed to save campaign';
        setError(editingCampaign ? `Failed to update campaign: ${errorMsg}` : `Failed to create campaign: ${errorMsg}`);
        return;
      }
      
      if (data.success) {
        setSuccess(editingCampaign ? 'Campaign updated successfully!' : 'Campaign published successfully!');
        setShowForm(false);
        setEditingCampaign(null);
        fetchCampaigns();
        
        // Reset form
        setFormData({
          brandName: '', posterName: '', posterRole: '', company: '', isVerified: false,
          profilePicture: '', linkedinVerified: false, linkedinUrl: '',
          title: '', intent: '', description: '', objective: '', deliverables: '',
          budget: '', platform: '', category: '', locations: '',
          followerRange: { min: '', max: '' }, avgViews: '', creatorsNeeded: 1,
          gender: 'Any', ageRange: { min: '', max: '' }, timeline: '', deadline: '',
          isHandPicked: false, contactVerified: false,
          sourceType: 'manual', sourceUrl: '', contactPerson: '', contactMethod: '',
          rawText: '', sourceNotes: '', moderationNotes: '', status: 'live'
        });
      } else {
        setError(data.error || data.details || 'Failed to save campaign');
      }
    } catch (err) {
      console.error('❌ Network error saving campaign:', err);
      setError('Network error: Unable to connect to server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5002/api/admin/campaigns/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchCampaigns();
        setSuccess('Campaign deleted successfully');
      }
    } catch (err) {
      setError('Failed to delete campaign');
    }
  };

  const handleToggleHandPicked = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5002/api/admin/campaigns/${id}/hand-pick`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchCampaigns();
      }
    } catch (err) {
      setError('Failed to update hand-picked status');
    }
  };

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <AdminNav />
        <div className={styles.mainContent}>
          <div className={styles.curatorContainer}>
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
              <h2>Loading...</h2>
              <p>Verifying admin access...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <AdminNav />
      <div className={styles.mainContent}>
        <div className={styles.curatorContainer}>
          <div className={styles.curatorHeader}>
            <div>
              <h1>Campaign Curator</h1>
              <p>AURAX LIVE - Admin Dashboard</p>
            </div>
            <button 
              className={styles.addBtn}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : '+ Add Campaign'}
            </button>
          </div>

      {error && (
        <div className={`${styles.alert} ${styles.error}`}>
          {error}
        </div>
      )}

      {success && (
        <div className={`${styles.alert} ${styles.success}`}>
          {success}
        </div>
      )}

      {showForm && (
        <div className={styles.formContainer}>
          <h2>{editingCampaign ? 'Edit Campaign' : 'Add New Campaign'}</h2>
          <form onSubmit={handleSubmit} className={styles.campaignForm}>
            {/* Source Information */}
            <div className={styles.section}>
              <h3>🔍 Source Information (Internal Only)</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Source Type *</label>
                  <select 
                    name="sourceType" 
                    value={formData.sourceType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="agency">Agency Partner</option>
                    <option value="referral">Referral</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Source URL</label>
                  <input
                    type="url"
                    name="sourceUrl"
                    value={formData.sourceUrl}
                    onChange={handleInputChange}
                    placeholder="LinkedIn post URL, IG profile, etc."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="Name of person who shared this"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Contact Method</label>
                  <input
                    type="text"
                    name="contactMethod"
                    value={formData.contactMethod}
                    onChange={handleInputChange}
                    placeholder="Email, phone, DM, etc."
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Raw Campaign Text</label>
                <textarea
                  name="rawText"
                  value={formData.rawText}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Paste the original campaign text here before formatting..."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Source Notes</label>
                <textarea
                  name="sourceNotes"
                  value={formData.sourceNotes}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Internal notes about this source..."
                />
              </div>
            </div>

            {/* Creator Visual Information */}
            <div className={styles.section}>
              <h3>👤 Creator Visual Information</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Profile Picture URL</label>
                  <input
                    type="url"
                    name="profilePicture"
                    value={formData.profilePicture}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  {formData.profilePicture && (
                    <div className={styles.imagePreview}>
                      <img 
                        src={formData.profilePicture} 
                        alt="Preview" 
                        className={styles.avatarPreview}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <small className={styles.fieldHelp}>Enter URL of creator's profile picture (will be displayed as circular avatar)</small>
                </div>

                <div className={styles.formGroup}>
                  <label>LinkedIn Profile URL</label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    placeholder="https://www.linkedin.com/in/username"
                  />
                  <small className={styles.fieldHelp}>Link to creator's LinkedIn profile (opens in new tab)</small>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="linkedinVerified"
                      checked={formData.linkedinVerified}
                      onChange={handleInputChange}
                    />
                    <span>LinkedIn Verified</span>
                  </label>
                  <small className={styles.fieldHelp}>Shows LinkedIn badge with link on campaign card</small>
                </div>
              </div>
            </div>

            {/* Brand Information */}
            <div className={styles.section}>
              <h3>🏢 Brand Information</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Brand Name</label>
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleInputChange}
                    placeholder="Leave blank for 'Available on request'"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Poster Name *</label>
                  <input
                    type="text"
                    name="posterName"
                    value={formData.posterName}
                    onChange={handleInputChange}
                    required
                    placeholder="Person posting the campaign"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Poster Role</label>
                  <input
                    type="text"
                    name="posterRole"
                    value={formData.posterRole}
                    onChange={handleInputChange}
                    placeholder="Marketing Manager, CEO, etc."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Company *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    placeholder="Company name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="isVerified"
                      checked={formData.isVerified}
                      onChange={handleInputChange}
                    />
                    Verified Brand
                  </label>
                </div>
              </div>
            </div>

            {/* Campaign Details */}
            <div className={styles.section}>
              <h3>📝 Campaign Details</h3>
              <div className={styles.formGroup}>
                <label>Campaign Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Looking for tech influencers for product launch"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Intent *</label>
                <select 
                  name="intent" 
                  value={formData.intent}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Intent</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="sponsorship">Sponsorship</option>
                  <option value="ambassador">Brand Ambassador</option>
                  <option value="product_review">Product Review</option>
                  <option value="event">Event Promotion</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Campaign description (leave blank for default)"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Objective</label>
                <input
                  type="text"
                  name="objective"
                  value={formData.objective}
                  onChange={handleInputChange}
                  placeholder="Brand awareness, sales, engagement, etc."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Deliverables (comma-separated)</label>
                <input
                  type="text"
                  name="deliverables"
                  value={formData.deliverables}
                  onChange={handleInputChange}
                  placeholder="3 Instagram posts, 2 stories, 1 reel"
                />
              </div>
            </div>

            {/* Highlights */}
            <div className={styles.section}>
              <h3>💰 Highlights</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Budget *</label>
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    required
                    placeholder="₹50K-1L, Barter, Negotiable"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Platform *</label>
                  <select 
                    name="platform" 
                    value={formData.platform}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Platform</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitter">Twitter/X</option>
                    <option value="TikTok">TikTok</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Multiple">Multiple Platforms</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Category (comma-separated)</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Tech, Fashion, Food, etc."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Locations (comma-separated)</label>
                  <input
                    type="text"
                    name="locations"
                    value={formData.locations}
                    onChange={handleInputChange}
                    placeholder="Mumbai, Delhi, Pan India"
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className={styles.section}>
              <h3>📊 Requirements</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Follower Range Min</label>
                  <input
                    type="number"
                    name="followerRange.min"
                    value={formData.followerRange.min}
                    onChange={handleInputChange}
                    placeholder="10000"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Follower Range Max</label>
                  <input
                    type="number"
                    name="followerRange.max"
                    value={formData.followerRange.max}
                    onChange={handleInputChange}
                    placeholder="100000"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Avg Views</label>
                  <input
                    type="text"
                    name="avgViews"
                    value={formData.avgViews}
                    onChange={handleInputChange}
                    placeholder="10K+, 50K+, etc."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Creators Needed</label>
                  <input
                    type="number"
                    name="creatorsNeeded"
                    value={formData.creatorsNeeded}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Gender</label>
                  <select 
                    name="gender" 
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="Any">Any</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Timeline</label>
                  <input
                    type="text"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    placeholder="2 weeks, 1 month, etc."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Admin Options */}
            <div className={styles.section}>
              <h3>⚙️ Admin Options</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select 
                    name="status" 
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="live">Live</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="isHandPicked"
                      checked={formData.isHandPicked}
                      onChange={handleInputChange}
                    />
                    Hand Picked
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="contactVerified"
                      checked={formData.contactVerified}
                      onChange={handleInputChange}
                    />
                    Contact Verified
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Moderation Notes</label>
                <textarea
                  name="moderationNotes"
                  value={formData.moderationNotes}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Internal notes about moderation..."
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button 
                type="button" 
                onClick={() => {
                  setShowForm(false);
                  setEditingCampaign(null);
                }}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className={styles.submitBtn}
              >
                {loading ? (editingCampaign ? 'Updating...' : 'Publishing...') : (editingCampaign ? 'Update Campaign' : 'Publish Campaign')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns List */}
      <div className={styles.campaignsList}>
        <h2>Published Campaigns ({campaigns.length})</h2>
        <div className={styles.campaignsGrid}>
          {campaigns.map(campaign => (
            <div key={campaign._id} className={styles.campaignCard}>
              <div className={styles.cardHeader}>
                <div className={styles.headerLeft}>
                  {campaign.profilePicture ? (
                    <img 
                      src={campaign.profilePicture} 
                      alt={campaign.posterName}
                      className={styles.creatorAvatar}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {campaign.posterName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <h3>{campaign.title}</h3>
                    <p className={styles.company}>
                      {campaign.company} • {campaign.posterName}
                      {(campaign.linkedinVerified || true) && (
                        <div className={styles.linkedinBadgeContainer}>
                          {campaign.linkedinUrl ? (
                            <a 
                              href={campaign.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.linkedinLogo}
                              title="LinkedIn Profile"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Clean LinkedIn Logo - Blue only, no white fill */}
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="24" height="24" rx="2" fill="#0077B5"/>
                                <path d="M7 9h2v8H7V9zm1-3c.7 0 1.3.6 1.3 1.3S8.7 8.6 8 8.6 6.7 8 6.7 7.3 7.3 6 8 6zm3 3h2v1.1c.3-.5 1-.1 1.9-1.1 2 0 2.4 1.3 2.4 3V17h-2v-4c0-.8 0-1.8-1.1-1.8-1.1 0-1.3.9-1.3 1.8v4h-2V9z" fill="white"/>
                              </svg>
                            </a>
                          ) : (
                            <span 
                              className={`${styles.linkedinLogo} ${styles.linkedinLogoDisabled}`}
                              title="LinkedIn Verified (Profile link not available)"
                            >
                              {/* Clean LinkedIn Logo - Blue only, no white fill */}
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="24" height="24" rx="2" fill="#0077B5"/>
                                <path d="M7 9h2v8H7V9zm1-3c.7 0 1.3.6 1.3 1.3S8.7 8.6 8 8.6 6.7 8 6.7 7.3 7.3 6 8 6zm3 3h2v1.1c.3-.5 1-.1 1.9-1.1 2 0 2.4 1.3 2.4 3V17h-2v-4c0-.8 0-1.8-1.1-1.8-1.1 0-1.3.9-1.3 1.8v4h-2V9z" fill="white"/>
                              </svg>
                            </span>
                          )}
                          {/* Separate Verification Shield */}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`${styles.verificationShield} ${!campaign.linkedinUrl ? styles.verificationShieldDisabled : ''}`}>
                            <path d="M12 1L21 4v7c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V4l9-3z" fill="#10B981"/>
                            <path d="M10 12.5l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </p>
                  </div>
                </div>
                <div className={styles.badges}>
                  {campaign.isHandPicked && (
                    <span className={`${styles.badge} ${styles.handpicked}`}>Hand Picked</span>
                  )}
                  {campaign.contactVerified && (
                    <span className={`${styles.badge} ${styles.verified}`}>Verified</span>
                  )}
                  <span className={`${styles.badge} ${styles[campaign.status]}`}>
                    {campaign.status}
                  </span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.detail}>
                  <strong>Platform:</strong> {campaign.platform}
                </div>
                <div className={styles.detail}>
                  <strong>Budget:</strong> {campaign.budget?.currency === 'INR' ? '₹' : '$'}
                  {(campaign.budget?.min || 0).toLocaleString()} - {(campaign.budget?.max || 0).toLocaleString()}
                </div>
                <div className={styles.detail}>
                  <strong>Source:</strong> {campaign.source?.type || 'manual'}
                </div>
                <div className={styles.detail}>
                  <strong>Views:</strong> {campaign.views || 0}
                </div>
              </div>

              <div className={styles.cardActions}>
                <button 
                  onClick={() => handleEdit(campaign)}
                  className={`${styles.actionBtn} ${styles.edit}`}
                  title="Edit campaign"
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => handleToggleHandPicked(campaign._id)}
                  className={styles.actionBtn}
                >
                  {campaign.isHandPicked ? 'Unmark' : 'Mark'} Hand Picked
                </button>
                <button 
                  onClick={() => handleDelete(campaign._id)}
                  className={`${styles.actionBtn} ${styles.delete}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCurator;
