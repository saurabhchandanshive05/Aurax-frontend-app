import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import styles from './LiveCampaignsMobile.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const LiveCampaignsMobile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('recent');
  const [stats, setStats] = useState({ totalLiveCampaigns: 0, handPickedCampaigns: 0 });
  const [filters, setFilters] = useState({ platform: '', category: '' });
  const [filterOptions, setFilterOptions] = useState({ platforms: [], categories: [] });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const observerTarget = useRef(null);

  // Auto-resume CTA action after login
  useEffect(() => {
    const resumeAction = searchParams.get('resumeAction');
    if (resumeAction) {
      console.log('🔄 Resuming CTA action after login:', resumeAction);
      searchParams.delete('resumeAction');
      setSearchParams(searchParams);
      handleCTAClick(resumeAction, null);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    // Reset campaigns and page when filters change
    setCampaigns([]);
    setPage(1);
    setHasMore(true);
    fetchCampaigns(1, true);
  }, [sortBy, filters]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreCampaigns();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, loadingMore, page]);

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

  const fetchCampaigns = async (pageNum = 1, reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      params.append('sort', sortBy);
      params.append('page', pageNum);
      params.append('limit', 10);
      if (filters.platform) params.append('platform', filters.platform);
      if (filters.category) params.append('category', filters.category);

      const response = await axios.get(`${API_URL}/api/public/campaigns?${params.toString()}`);
      if (response.data.success) {
        const newCampaigns = response.data.data;
        
        if (reset) {
          setCampaigns(newCampaigns);
        } else {
          setCampaigns(prev => [...prev, ...newCampaigns]);
        }

        // If we got less than 10 campaigns, no more to load
        setHasMore(newCampaigns.length === 10);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreCampaigns = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCampaigns(nextPage, false);
  };

  const handleCampaignClick = (campaignId) => {
    navigate(`/live/campaigns/${campaignId}`);
  };

  const handleCTAClick = async (action, event) => {
    console.log('🔥 Button clicked!', action, event);
    
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      const returnUrl = encodeURIComponent(window.location.pathname);
      const ctaAction = encodeURIComponent(action);
      navigate(`/creator/login?returnUrl=${returnUrl}&action=${ctaAction}`);
      return;
    }
    
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/user-status`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const { inquirerVerified } = response.data.user;
      
      if ((action === 'chat' || action === 'call' || action === 'post') && !inquirerVerified) {
        console.log('User not verified, redirecting to inquiry form');
        navigate(`/inquiry/form?purpose=${action === 'post' ? 'campaign' : 'connect'}`);
        return;
      }
      
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
      navigate(`/inquiry/form?purpose=${action === 'post' ? 'campaign' : 'connect'}`);
    }
  };

  const toggleExpanded = (campaignId) => {
    setExpandedCards(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
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

  const applyFilters = () => {
    setShowFilterPanel(false);
  };

  return (
    <div className={styles.container}>
      {/* Filter Panel Overlay */}
      <div 
        className={`${styles.filterPanelOverlay} ${showFilterPanel ? styles.open : ''}`}
        onClick={() => setShowFilterPanel(false)}
      />
      
      {/* Filter Panel (Slide-up on mobile) */}
      <div className={`${styles.filterPanel} ${showFilterPanel ? styles.open : ''}`}>
        <div className={styles.filterPanelHandle} />
        <h3 className={styles.filterPanelTitle}>Filter Campaigns</h3>
        
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Platform</label>
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
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Category</label>
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

        <button className={styles.filterApply} onClick={applyFilters}>
          Apply Filters
        </button>
      </div>

      {/* Hero Section */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Discover <span className={styles.heroHighlight}>Live</span> Brand Campaigns
        </h1>
        <p className={styles.heroSubtitle}>
          Real brands looking for creators right now
        </p>
        <div className={styles.heroStats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.totalLiveCampaigns}</div>
            <div className={styles.statLabel}>Live Now</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.handPickedCampaigns}</div>
            <div className={styles.statLabel}>Hand-Picked</div>
          </div>
        </div>
      </div>

      {/* View Switcher + Filter Trigger */}
      <div className={styles.viewSwitcher}>
        <button
          className={`${styles.viewTab} ${sortBy === 'recent' ? styles.active : ''}`}
          onClick={() => setSortBy('recent')}
        >
          🔥 Recent
        </button>
        <button
          className={`${styles.viewTab} ${sortBy === 'handpicked' ? styles.active : ''}`}
          onClick={() => setSortBy('handpicked')}
        >
          ⭐ Hand Picked
        </button>
        <button
          className={styles.filterTrigger}
          onClick={() => setShowFilterPanel(true)}
        >
          ⚙️
        </button>
      </div>

      {/* Campaign Feed - Vertical Infinite Scroll */}
      <div className={styles.campaignFeed}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📭</div>
            <h3>No campaigns found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {campaigns.map((campaign) => {
              const isExpanded = expandedCards[campaign._id];
              
              return (
                <div key={campaign._id} className={styles.feedCard}>
                  {/* Trust Header - Always Visible */}
                  <div className={styles.trustHeader}>
                    <div className={styles.verifiedLabel}>
                      <svg className={styles.verifiedIcon} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      Verified by AURAX
                    </div>
                    {campaign.isHandPicked && (
                      <div className={styles.handPickedLabel}>
                        ⭐ Hand Picked
                      </div>
                    )}
                  </div>

                  {/* Poster Identity */}
                  <div className={styles.posterIdentity}>
                    <div className={styles.posterAvatar}>
                      {campaign.posterName.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.posterInfo}>
                      <div className={styles.posterName}>
                        {campaign.posterName}
                      </div>
                      <span className={styles.posterRole}>
                        {campaign.posterRole}
                      </span>
                      <span className={styles.posterCompany}>
                        @ {campaign.company || campaign.brandName}
                      </span>
                      <span className={styles.timeAgo}>
                        {formatTimeAgo(campaign.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Campaign Intent */}
                  <div className={styles.campaignIntent}>
                    {campaign.intent}
                  </div>

                  {/* Campaign Description - Collapsible */}
                  {campaign.description && campaign.description !== 'Details will be shared with shortlisted creators' && (
                    <>
                      <div className={`${styles.campaignDescription} ${!isExpanded ? styles.collapsed : ''}`}>
                        {campaign.description}
                      </div>
                      {!isExpanded && campaign.description.length > 150 && (
                        <button 
                          className={styles.seeMoreBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(campaign._id);
                          }}
                        >
                          ...see more →
                        </button>
                      )}
                    </>
                  )}

                  {/* Campaign Highlights */}
                  <div className={styles.campaignHighlights}>
                    <div className={styles.highlight}>
                      <span className={styles.highlightIcon}>📱</span>
                      {campaign.platform}
                    </div>
                    {campaign.budget && (campaign.budget.min || campaign.budget.max) && (
                      <div className={styles.highlight}>
                        <span className={styles.highlightIcon}>💰</span>
                        {formatBudget(campaign.budget)}
                      </div>
                    )}
                    {campaign.creatorsNeeded && (
                      <div className={styles.highlight}>
                        <span className={styles.highlightIcon}>🎯</span>
                        {campaign.creatorsNeeded} creators
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {(campaign.locations?.length > 0 || campaign.category?.length > 0) && (
                    <div className={styles.feedTags}>
                      {campaign.locations?.[0] && (
                        <div className={styles.tag}>
                          📍 {campaign.locations[0]}
                        </div>
                      )}
                      {campaign.category?.[0] && (
                        <div className={styles.tag}>
                          #{campaign.category[0]}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className={styles.feedActions}>
                    <button 
                      className={styles.feedActionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCTAClick('call', e);
                      }}
                    >
                      📞 Call
                    </button>
                    <button 
                      className={`${styles.feedActionBtn} ${styles.primary}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCampaignClick(campaign._id);
                      }}
                    >
                      View Details →
                    </button>
                  </div>

                  {/* Contacting Indicator */}
                  {campaign.isVerified && (
                    <div className={styles.contactingIndicator}>
                      ✓ You are contacting <strong>{campaign.posterName}</strong>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div ref={observerTarget} className={styles.infiniteLoader}>
                {loadingMore && <div className={styles.spinner}></div>}
              </div>
            )}

            {!hasMore && campaigns.length > 0 && (
              <div className={styles.endMessage}>
                <p>🎉 You've seen all campaigns</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky Bottom CTA Bar */}
      <div className={styles.bottomCtaBar}>
        <div className={styles.ctaBarContent}>
          <button 
            className={`${styles.ctaBarBtn} ${styles.secondary}`}
            onClick={(e) => handleCTAClick('chat', e)}
          >
            💬 Chat
          </button>
          <button 
            className={`${styles.ctaBarBtn} ${styles.primary}`}
            onClick={(e) => handleCTAClick('post', e)}
          >
            📝 Post Campaign
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveCampaignsMobile;
