import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import styles from './CampaignDetail.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  // Auto-resume CTA action after login
  useEffect(() => {
    const resumeAction = searchParams.get('resumeAction');
    const campaignId = searchParams.get('campaignId');
    
    if (resumeAction && campaign) {
      console.log('🔄 Resuming CTA action after login:', resumeAction, 'for campaign:', campaignId || id);
      // Clear the params
      searchParams.delete('resumeAction');
      searchParams.delete('campaignId');
      setSearchParams(searchParams);
      // Execute the action (no event object needed for auto-resume)
      handleCTAClick(resumeAction, null);
    }
  }, [campaign]); // Run when campaign is loaded

  const fetchCampaign = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/public/campaigns/${id}`);
      if (response.data.success) {
        setCampaign(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
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
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const handleCTAClick = async (action, event) => {
    console.log('🔥 CTA Button clicked!', action, event);
    
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      // Preserve CTA intent and campaign context via URL parameters
      const returnUrl = encodeURIComponent(window.location.pathname);
      const ctaAction = encodeURIComponent(action);
      const campaignId = encodeURIComponent(id || '');
      navigate(`/login?returnUrl=${returnUrl}&action=${ctaAction}&campaignId=${campaignId}`);
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading campaign...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>❌</div>
        <h2>Campaign not found</h2>
        <p>This campaign may have expired or been removed</p>
        <button className={styles.backBtn} onClick={() => navigate('/live/campaigns')}>
          Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Floating CTA Toolbar */}
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

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backButton} onClick={() => navigate('/live/campaigns')}>
            ← Back
          </button>
          
          <div className={styles.headerRight}>
            <div className={styles.liveIndicator}>
              <span className={styles.liveDot}></span>
              LIVE
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Campaign Summary */}
        <div className={styles.summaryCard}>
          {campaign.isHandPicked && (
            <div className={styles.handPickedBadge}>⭐ Hand Picked</div>
          )}

          {/* Brand Info */}
          <div className={styles.brandInfo}>
            <div className={styles.brandAvatar}>
              {campaign.brandName.charAt(0).toUpperCase()}
            </div>
            <div className={styles.brandDetails}>
              <div className={styles.brandName}>
                {campaign.brandName}
                {campaign.isVerified && <span className={styles.verifiedBadge}>✓ Verified Brand</span>}
              </div>
              <div className={styles.posterInfo}>
                Posted by {campaign.posterName} • {campaign.posterRole}
              </div>
              <div className={styles.timeAgo}>{formatTimeAgo(campaign.createdAt)}</div>
            </div>
          </div>

          {/* Campaign Intent */}
          <h1 className={styles.campaignTitle}>{campaign.intent}</h1>

          {/* Highlight Cards */}
          <div className={styles.highlightGrid}>
            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>💰</div>
              <div className={styles.highlightLabel}>Budget</div>
              <div className={styles.highlightValue}>{formatBudget(campaign.budget)}</div>
            </div>

            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>🏷</div>
              <div className={styles.highlightLabel}>Brand</div>
              <div className={styles.highlightValue}>{campaign.company || campaign.brandName}</div>
            </div>

            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>📱</div>
              <div className={styles.highlightLabel}>Platform</div>
              <div className={styles.highlightValue}>{campaign.platform}</div>
            </div>
          </div>
        </div>

        {/* Campaign Details */}
        <div className={styles.detailsCard}>
          <h2 className={styles.sectionTitle}>📋 Campaign Brief</h2>
          
          {/* Objective */}
          <div className={styles.detailSection}>
            <h3 className={styles.detailLabel}>Objective</h3>
            <p className={styles.detailText}>{campaign.objective}</p>
          </div>

          {/* Description */}
          {campaign.description && (
            <div className={styles.detailSection}>
              <h3 className={styles.detailLabel}>Description</h3>
              <p className={styles.detailText}>{campaign.description}</p>
            </div>
          )}

          {/* Deliverables */}
          {campaign.deliverables && campaign.deliverables.length > 0 && (
            <div className={styles.detailSection}>
              <h3 className={styles.detailLabel}>Deliverables</h3>
              <ul className={styles.deliverablesList}>
                {campaign.deliverables.map((deliverable, index) => (
                  <li key={index}>{deliverable}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Requirements */}
        <div className={styles.detailsCard}>
          <h2 className={styles.sectionTitle}>🎯 Key Requirements</h2>
          
          <div className={styles.requirementsGrid}>
            {campaign.followerRange && (
              <div className={styles.requirementItem}>
                <div className={styles.requirementLabel}>Follower Range</div>
                <div className={styles.requirementValue}>
                  {campaign.followerRange.min?.toLocaleString()} - {campaign.followerRange.max?.toLocaleString()}
                </div>
              </div>
            )}

            {campaign.avgViews && (
              <div className={styles.requirementItem}>
                <div className={styles.requirementLabel}>Average Views</div>
                <div className={styles.requirementValue}>
                  {campaign.avgViews.min?.toLocaleString()} - {campaign.avgViews.max?.toLocaleString()} per post
                </div>
              </div>
            )}

            {campaign.creatorsNeeded && (
              <div className={styles.requirementItem}>
                <div className={styles.requirementLabel}>Creators Needed</div>
                <div className={styles.requirementValue}>{campaign.creatorsNeeded}</div>
              </div>
            )}

            {campaign.category && campaign.category.length > 0 && (
              <div className={styles.requirementItem}>
                <div className={styles.requirementLabel}>Category</div>
                <div className={styles.requirementValue}>
                  {campaign.category.join(', ')}
                </div>
              </div>
            )}

            {campaign.locations && campaign.locations.length > 0 && (
              <div className={`${styles.requirementItem} ${styles.fullWidth}`}>
                <div className={styles.requirementLabel}>Locations</div>
                <div className={styles.requirementValue}>
                  {campaign.locations.join(', ')}
                </div>
              </div>
            )}

            {campaign.timeline && (
              <div className={styles.requirementItem}>
                <div className={styles.requirementLabel}>Timeline</div>
                <div className={styles.requirementValue}>{campaign.timeline}</div>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className={styles.ctaCard}>
          <div className={styles.ctaIcon}>🔒</div>
          <h2 className={styles.ctaTitle}>Want to apply for this campaign?</h2>
          <p className={styles.ctaText}>
            Login and get verified to see if you match this campaign's requirements and connect with the brand
          </p>
          
          <div className={styles.ctaButtons}>
            <button 
              className={styles.loginBtn}
              onClick={() => {
                const returnUrl = encodeURIComponent(window.location.pathname);
                navigate(`/login?returnUrl=${returnUrl}&campaignId=${id}`);
              }}
            >
              Login Now
            </button>
            <button 
              className={styles.verifyBtn}
              onClick={() => {
                const returnUrl = encodeURIComponent(window.location.pathname);
                navigate(`/login?returnUrl=${returnUrl}&campaignId=${id}`);
              }}
            >
              Get Verified
            </button>
          </div>

          <div className={styles.ctaNote}>
            💡 Verified creators get priority access and can apply directly
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
