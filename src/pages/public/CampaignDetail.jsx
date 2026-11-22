import { getApiUrl } from '../../utils/getApiUrl';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import styles from './CampaignDetail.module.css';
import Icon from '../../components/ui/Icon';

const API_URL = getApiUrl();

// "10,000 – 50,000", "From 10,000", "Up to 50,000" or null when neither end is set
const formatRange = (range, suffix = '') => {
  const min = Number(range?.min) || 0;
  const max = Number(range?.max) || 0;
  if (!min && !max) return null;
  const f = (n) => n.toLocaleString('en-IN');
  if (min && max) return min === max ? `${f(min)}${suffix}` : `${f(min)} – ${f(max)}${suffix}`;
  return min ? `From ${f(min)}${suffix}` : `Up to ${f(max)}${suffix}`;
};

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const isSignedIn = !!(localStorage.getItem('token') || sessionStorage.getItem('token'));

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  // Auto-resume CTA action after login
  useEffect(() => {
    const resumeAction = searchParams.get('resumeAction');
    const campaignId = searchParams.get('campaignId');
    
    if (resumeAction && campaign) {
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
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
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
        `${getApiUrl()}/api/role/user-status`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const { inquirerVerified } = response.data.user;
      
      // If action requires inquirer verification
      if ((action === 'chat' || action === 'call' || action === 'post') && !inquirerVerified) {
        navigate(`/inquiry/form?purpose=${action === 'post' ? 'campaign' : 'connect'}`);
        return;
      }
      
      // User is verified, proceed with action
      switch(action) {
        case 'chat':
          navigate('/contact?type=chat');
          break;
        case 'call':
          navigate('/contact?type=call');
          break;
        case 'post':
          // Campaign briefs are submitted through the inquiry form (there is no /campaigns/create
          // page; navigating there fell through to the homepage)
          navigate('/inquiry/form?purpose=campaign');
          break;
        default:
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
        <div className={styles.errorIcon}><Icon name="alert" size={28} /></div>
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
          title="Contact the AURAX team about this campaign"
        >
          <Icon name="chat" size={18} /> Contact us
        </button>
        <button 
          type="button"
          className={styles.actionBtn} 
          onClick={(e) => handleCTAClick('call', e)} 
          title="Request a call"
        >
          <Icon name="phone" size={18} /> Request a call
        </button>
        <button 
          type="button"
          className={styles.primaryActionBtn} 
          onClick={(e) => handleCTAClick('post', e)} 
          title="Post your own campaign"
        >
          <Icon name="megaphone" size={18} /> Post a campaign
        </button>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button type="button" className={styles.backButton} onClick={() => navigate('/live/campaigns')}>
            <Icon name="arrow-left" size={18} /> LIVE board
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
            <div className={styles.handPickedBadge}><Icon name="star" size={14} /> Hand-picked</div>
          )}

          {/* Brand Info */}
          <div className={styles.brandInfo}>
            <div className={styles.brandAvatar}>
              {campaign.brandName.charAt(0).toUpperCase()}
            </div>
            <div className={styles.brandDetails}>
              <div className={styles.brandName}>
                {campaign.brandName}
                {campaign.isVerified && <span className={styles.verifiedBadge}><Icon name="check" size={14} /> Verified brand</span>}
              </div>
              <div className={styles.posterInfo}>
                Posted by {campaign.posterName}
                {(campaign.linkedinVerified || campaign.linkedinUrl) && (
                  <div className={styles.linkedinBadgeContainer}>
                    {campaign.linkedinUrl ? (
                      <a 
                        href={campaign.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.linkedinLogo}
                        title="LinkedIn Profile"
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
                        title="LinkedIn Profile"
                      >
                        {/* Clean LinkedIn Logo - Blue only, no white fill */}
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="24" height="24" rx="2" fill="#0077B5"/>
                          <path d="M7 9h2v8H7V9zm1-3c.7 0 1.3.6 1.3 1.3S8.7 8.6 8 8.6 6.7 8 6.7 7.3 7.3 6 8 6zm3 3h2v1.1c.3-.5 1-.1 1.9-1.1 2 0 2.4 1.3 2.4 3V17h-2v-4c0-.8 0-1.8-1.1-1.8-1.1 0-1.3.9-1.3 1.8v4h-2V9z" fill="white"/>
                        </svg>
                      </span>
                    )}
                    {/* Verification shield: only for posters the AURAX team verified on LinkedIn */}
                    {campaign.linkedinVerified && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`${styles.verificationShield} ${!campaign.linkedinUrl ? styles.verificationShieldDisabled : ''}`}>
                        <path d="M12 1L21 4v7c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V4l9-3z" fill="#10B981"/>
                        <path d="M10 12.5l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                )}
                {campaign.posterRole && <span className={styles.posterRole}>{campaign.posterRole}</span>}
              </div>
              <div className={styles.timeAgo}>{formatTimeAgo(campaign.createdAt)}</div>
            </div>
          </div>

          {/* Campaign Intent */}
          <h1 className={styles.campaignTitle}>{campaign.intent}</h1>

          {/* Highlight Cards */}
          <div className={styles.highlightGrid}>
            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}><Icon name="wallet" size={20} /></div>
              <div className={styles.highlightLabel}>Budget</div>
              <div className={styles.highlightValue}>{formatBudget(campaign.budget)}</div>
            </div>

            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}><Icon name="tag" size={20} /></div>
              <div className={styles.highlightLabel}>Brand</div>
              <div className={styles.highlightValue}>{campaign.company || campaign.brandName}</div>
            </div>

            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}><Icon name="smartphone" size={20} /></div>
              <div className={styles.highlightLabel}>Platform</div>
              <div className={styles.highlightValue}>{campaign.platform}</div>
            </div>
          </div>
        </div>

        {/* Campaign Details */}
        <div className={styles.detailsCard}>
          <h2 className={styles.sectionTitle}><Icon name="list" size={20} /> Campaign brief</h2>
          
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
          <h2 className={styles.sectionTitle}><Icon name="target" size={20} /> Key requirements</h2>
          
          <div className={styles.requirementsGrid}>
            {formatRange(campaign.followerRange) && (
              <div className={styles.requirementItem}>
                <div className={styles.requirementLabel}>Follower range</div>
                <div className={styles.requirementValue}>{formatRange(campaign.followerRange)}</div>
              </div>
            )}

            {formatRange(campaign.avgViews) && (
              <div className={styles.requirementItem}>
                <div className={styles.requirementLabel}>Average views</div>
                <div className={styles.requirementValue}>{formatRange(campaign.avgViews, ' per post')}</div>
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

        {/* Next step: one clear action for each visitor */}
        <div className={styles.ctaCard}>
          <div className={styles.ctaIcon}><Icon name={isSignedIn ? 'chat' : 'lock'} size={26} /></div>
          {isSignedIn ? (
            <>
              <h2 className={styles.ctaTitle}>Interested in this campaign?</h2>
              <p className={styles.ctaText}>
                Tell the AURAX team. We check that you match the brief and connect you with the brand.
              </p>
              <div className={styles.ctaButtons}>
                <button type="button" className={styles.loginBtn} onClick={(e) => handleCTAClick('chat', e)}>
                  I'm interested
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className={styles.ctaTitle}>Want to apply for this campaign?</h2>
              <p className={styles.ctaText}>
                Sign in to tell the AURAX team you're interested. We check that you match the brief
                and connect you with the brand.
              </p>
              <div className={styles.ctaButtons}>
                <button
                  type="button"
                  className={styles.loginBtn}
                  onClick={() => {
                    const returnUrl = encodeURIComponent(window.location.pathname);
                    navigate(`/login?returnUrl=${returnUrl}&campaignId=${id}`);
                  }}
                >
                  Sign in to apply
                </button>
                <button type="button" className={styles.verifyBtn} onClick={() => navigate('/signup?role=creator')}>
                  Create a creator account
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
