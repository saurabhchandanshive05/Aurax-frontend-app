import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './CampaignCurator.module.css';

const CampaignCurator = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Brand info
    brandName: '',
    posterName: '',
    posterRole: '',
    company: '',
    isVerified: false,
    
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
      console.log('⏳ CampaignCurator - Auth still loading, waiting...');
      return;
    }

    if (!isAuthenticated || !currentUser) {
      console.log('🚫 CampaignCurator - Not authenticated, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    const hasAdminRole = currentUser?.roles?.includes('admin') || currentUser?.role === 'admin';
    console.log('📊 CampaignCurator - Checking admin access:', { hasAdminRole, roles: currentUser?.roles, role: currentUser?.role });

    if (!hasAdminRole) {
      console.log('🚫 CampaignCurator - Not admin, redirecting to home');
      navigate('/', { replace: true });
      return;
    }

    console.log('✅ CampaignCurator - Admin access confirmed, fetching campaigns');
    fetchCampaigns();
  }, [isAuthenticated, currentUser, isLoading, navigate]);

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
        
        title: formData.title,
        intent: formData.intent,
        description: formData.description || 'Details will be shared with shortlisted creators',
        objective: formData.objective,
        deliverables: formData.deliverables.split(',').map(d => d.trim()).filter(Boolean),
        
        budget: formData.budget,
        platform: formData.platform,
        category: formData.category.split(',').map(c => c.trim()).filter(Boolean),
        locations: formData.locations.split(',').map(l => l.trim()).filter(Boolean),
        
        followerRange: {
          min: parseInt(formData.followerRange.min) || 0,
          max: parseInt(formData.followerRange.max) || 0
        },
        avgViews: formData.avgViews,
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

      const response = await fetch('http://localhost:5002/api/admin/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Campaign published successfully!');
        setShowForm(false);
        fetchCampaigns();
        
        // Reset form
        setFormData({
          brandName: '', posterName: '', posterRole: '', company: '', isVerified: false,
          title: '', intent: '', description: '', objective: '', deliverables: '',
          budget: '', platform: '', category: '', locations: '',
          followerRange: { min: '', max: '' }, avgViews: '', creatorsNeeded: 1,
          gender: 'Any', ageRange: { min: '', max: '' }, timeline: '', deadline: '',
          isHandPicked: false, contactVerified: false,
          sourceType: 'manual', sourceUrl: '', contactPerson: '', contactMethod: '',
          rawText: '', sourceNotes: '', moderationNotes: '', status: 'live'
        });
      } else {
        setError(data.error || 'Failed to create campaign');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
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
      <div className={styles.curatorContainer}>
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h2>Loading...</h2>
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
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
          <h2>Add New Campaign</h2>
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
                onClick={() => setShowForm(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className={styles.submitBtn}
              >
                {loading ? 'Publishing...' : 'Publish Campaign'}
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
                <div>
                  <h3>{campaign.title}</h3>
                  <p className={styles.company}>{campaign.company} • {campaign.posterName}</p>
                </div>
                <div className={styles.badges}>
                  {campaign.isHandPicked && (
                    <span className={`${styles.badge} ${styles.handpicked}`}>Hand Picked</span>
                  )}
                  {campaign.contactVerified?.default && (
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
                  <strong>Budget:</strong> {campaign.budget?.currency || '$'}{campaign.budget?.min || 0} - {campaign.budget?.currency || '$'}{campaign.budget?.max || 0}
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
  );
};

export default CampaignCurator;
