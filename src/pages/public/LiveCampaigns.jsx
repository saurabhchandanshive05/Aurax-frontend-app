import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import styles from './LiveCampaigns.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const LiveCampaigns = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [stats, setStats] = useState({ totalLiveCampaigns: 0, handPickedCampaigns: 0 });
  const [filters, setFilters] = useState({ platform: '', category: '' });
  const [filterOptions, setFilterOptions] = useState({ platforms: [], categories: [] });

  // Auto-resume CTA action after login
  useEffect(() => {
    const resumeAction = searchParams.get('resumeAction');
    if (resumeAction) {
      console.log('🔄 Resuming CTA action after login:', resumeAction);
      // Clear the resumeAction param
      searchParams.delete('resumeAction');
      setSearchParams(searchParams);
      // Execute the action
      handleCTAClick(resumeAction, null);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [sortBy, filters]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/public/campaigns/stats/overview`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/public/campaigns/filters/options`);
      if (response.data.success) {
        setFilterOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('sort', sortBy);
      if (filters.platform) params.append('platform', filters.platform);
      if (filters.category) params.append('category', filters.category);

      const response = await axios.get(`${API_URL}/api/public/campaigns?${params.toString()}`);
      if (response.data.success) {
        setCampaigns(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignClick = (campaignId) => {
    navigate(`/live/campaigns/${campaignId}`);
  };

  const handleLoginClick = () => {
    const returnUrl = encodeURIComponent(window.location.pathname);
    navigate(`/login?returnUrl=${returnUrl}`);
  };

  const handleCTAClick = async (action, event) => {
    console.log('🔥 Button clicked!', action, event);
    
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      // Preserve CTA intent via URL parameters
      const returnUrl = encodeURIComponent(window.location.pathname);
      const ctaAction = encodeURIComponent(action);
      navigate(`/login?returnUrl=${returnUrl}&action=${ctaAction}`);
      return;
    }
    
    // Check if user is verified for inquirer actions
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/api/auth/user-status`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const { inquirerVerified } = response.data.user;
      
      // If action requires inquirer verification
      if ((action === 'chat' || action === 'call' || action === 'post') && !inquirerVerified) {
        console.log('User not verified, redirecting to inquiry form');
        navigate(`/inquiry/form?purpose=${action === 'post' ? 'campaign' : 'connect'}`);
        return;
      }
      
      // User is verified, proceed with action
      console.log('User verified, proceeding with action:', action);
      switch(action) {
        case 'chat':
          navigate('/contact?type=chat');
          break;
        case 'call':
          navigate('/contact?type=call');
          break;
        case 'post':
          navigate('/campaigns/create');
          break;
        default:
          console.log('Unknown action:', action);
          break;
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      // On error, show inquiry form to be safe
      navigate(`/inquiry/form?purpose=${action === 'post' ? 'campaign' : 'connect'}`);
    }
  };

  const formatBudget = (budget) => {
    if (!budget || (!budget.min && !budget.max)) return 'Not Disclosed';
    
    const formatNumber = (num) => {
      if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num.toString();
    };

    const currency = budget.currency === 'INR' ? '₹' : '$';
    
    if (budget.min && budget.max) {
      return `${currency}${formatNumber(budget.min)} - ${currency}${formatNumber(budget.max)}`;
    }
    return `${currency}${formatNumber(budget.min || budget.max)}`;
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className={styles.container}>
      {/* Action Toolbar - Floating CTAs */}
      <div className={styles.floatingToolbar}>
        <button 
          type="button"
          className={styles.actionBtn} 
          onClick={(e) => handleCTAClick('chat', e)} 
          title="Chat with us"
        >
          💬 Quick Chat
        </button>
        <button 
          type="button"
          className={styles.actionBtn} 
          onClick={(e) => handleCTAClick('call', e)} 
          title="Schedule a call"
        >
          📞 Call
        </button>
        <button 
          type="button"
          className={styles.primaryActionBtn} 
          onClick={(e) => handleCTAClick('post', e)} 
          title="Post your campaign"
        >
          📝 Post Campaign
        </button>
      </div>

      {/* Hero Section */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Discover{' '}<span className={styles.heroHighlight}>Live</span>{' '}Brand Campaigns
        </h1>
        <p className={styles.heroSubtitle}>
          Real brands looking for creators right now
        </p>
        <div className={styles.heroStats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.totalLiveCampaigns}</div>
            <div className={styles.statLabel}>Live Campaigns</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.handPickedCampaigns}</div>
            <div className={styles.statLabel}>Hand-Picked</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <button
            className={`${styles.filterBtn} ${sortBy === 'recent' ? styles.active : ''}`}
            onClick={() => setSortBy('recent')}
          >
            🔥 Recent
          </button>
          <button
            className={`${styles.filterBtn} ${sortBy === 'handpicked' ? styles.active : ''}`}
            onClick={() => setSortBy('handpicked')}
          >
            ⭐ Hand Picked
          </button>
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={filters.platform}
            onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
          >
            <option value="">All Platforms</option>
            {filterOptions.platforms.map(platform => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {filterOptions.categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Campaign Feed - LinkedIn-style vertical feed */}
      <div className={styles.campaignFeed}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📭</div>
            <h3>No campaigns found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div
              key={campaign._id}
              className={styles.feedCard}
            >
              {/* Poster Info - LinkedIn style header */}
              <div className={styles.feedCardHeader}>
                <div className={styles.posterAvatar}>
                  {campaign.posterName.charAt(0).toUpperCase()}
                </div>
                <div className={styles.posterDetails}>
                  <div className={styles.posterName}>
                    {campaign.posterName}
                    {campaign.isVerified && (
                      <span className={styles.verifiedBadge}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 0L9.55 3.87 13.73 2.53 12.53 6.73 16 8 12.53 9.27 13.73 13.47 9.55 12.13 8 16 6.45 12.13 2.27 13.47 3.47 9.27 0 8 3.47 6.73 2.27 2.53 6.45 3.87 8 0z"/>
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className={styles.posterMeta}>
                    <span className={styles.posterRole}>
                      {campaign.posterRole} @ {campaign.company || campaign.brandName}
                    </span>
                    <span className={styles.separator}>•</span>
                    <span className={styles.timeAgo}>{formatTimeAgo(campaign.createdAt)}</span>
                  </div>
                </div>
                {campaign.isHandPicked && (
                  <div className={styles.handPickedBadgeInline}>⭐</div>
                )}
              </div>

              {/* Campaign Category Tag */}
              <div className={styles.categoryTag}>
                🎯 Looking for Influencer Marketing Agencies
              </div>

              {/* Campaign Description/Headline */}
              <div className={styles.campaignHeadline} onClick={() => handleCampaignClick(campaign._id)}>
                {campaign.intent}
              </div>

              {/* Campaign Details - Minimal & Clean */}
              <div className={styles.campaignDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailIcon}>🏷️</span>
                  <span className={styles.detailLabel}>Brand Name:</span>
                  <span className={styles.detailValue}>
                    {campaign.brandName || 'Available on request'}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailIcon}>🎨</span>
                  <span className={styles.detailLabel}>Campaign Type:</span>
                  <span className={styles.detailValue}>
                    {campaign.objective || 'Available on request'}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailIcon}>📱</span>
                  <span className={styles.detailLabel}>Platform:</span>
                  <span className={styles.detailValue}>
                    {campaign.platform || 'Multiple platforms'}
                  </span>
                </div>
                {campaign.followerRange && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailIcon}>👥</span>
                    <span className={styles.detailLabel}>Followers:</span>
                    <span className={styles.detailValue}>
                      {campaign.followerRange.min?.toLocaleString()} - {campaign.followerRange.max?.toLocaleString()}
                    </span>
                  </div>
                )}
                {campaign.budget && (campaign.budget.min || campaign.budget.max) && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailIcon}>💰</span>
                    <span className={styles.detailLabel}>Budget:</span>
                    <span className={styles.detailValue}>
                      {formatBudget(campaign.budget)}
                    </span>
                  </div>
                )}
              </div>

              {/* Expandable "see more" for additional details */}
              <button 
                className={styles.seeMoreBtn}
                onClick={() => handleCampaignClick(campaign._id)}
              >
                ...see more
              </button>

              {/* Tags - Location & Category */}
              <div className={styles.feedTags}>
                {campaign.locations && campaign.locations.length > 0 && (
                  <div className={styles.tag}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    {campaign.locations[0]}
                  </div>
                )}
                {campaign.category && campaign.category.length > 0 && (
                  <div className={styles.tag}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {campaign.category[0]}
                  </div>
                )}
                {campaign.creatorsNeeded && (
                  <div className={styles.tag}>
                    🎯 {campaign.creatorsNeeded} creators needed
                  </div>
                )}
              </div>

              {/* Action Buttons - LinkedIn style */}
              <div className={styles.feedActions}>
                <button 
                  className={styles.feedActionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCTAClick('call', e);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Call directly
                </button>
                <button 
                  className={styles.feedActionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCTAClick('chat', e);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Quick Chat
                </button>
              </div>

              {/* Contacting indicator */}
              {campaign.isVerified && (
                <div className={styles.contactingIndicator}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  You are contacting <strong>{campaign.posterName}</strong>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom CTA */}
      <div className={styles.bottomCta}>
        <div className={styles.ctaContent}>
          <h2>Ready to work with brands?</h2>
          <p>Login and get verified to see campaigns matched for you</p>
          <div className={styles.ctaButtons}>
            <button className={styles.ctaLoginBtn} onClick={handleLoginClick}>
              Login Now
            </button>
            <button 
              className={styles.ctaVerifyBtn} 
              onClick={() => {
                const returnUrl = encodeURIComponent(window.location.pathname);
                navigate(`/login?returnUrl=${returnUrl}`);
              }}
            >
              Get Verified
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCampaigns;
