import { getApiUrl } from '../../utils/getApiUrl';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import styles from './LiveCampaignsMobile.module.css';
import { useAuth } from '../../context/AuthContext';
import { areaForUser } from '../../components/layout/appNav';

const API_URL = getApiUrl();

// ---- Presentational helpers (experimental UI layer) ----
const ICON_PATHS = {
  check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  flame: 'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z',
  sliders: 'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
  wallet: 'M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
  users: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  device: 'M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z',
  pin: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z',
  phone: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
  chat: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z',
  plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  arrowRight: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
  chevronDown: 'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z',
};

const Icon = ({ name }) => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d={ICON_PATHS[name]} />
  </svg>
);

const LinkedInLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <rect width="24" height="24" rx="2" fill="#0077B5"/>
    <path d="M7 9h2v8H7V9zm1-3c.7 0 1.3.6 1.3 1.3S8.7 8.6 8 8.6 6.7 8 6.7 7.3 7.3 6 8 6zm3 3h2v1.1c.3-.5 1-.1 1.9-1.1 2 0 2.4 1.3 2.4 3V17h-2v-4c0-.8 0-1.8-1.1-1.8-1.1 0-1.3.9-1.3 1.8v4h-2V9z" fill="white"/>
  </svg>
);

const SkeletonCard = () => (
  <div className={styles.skeletonCard} aria-hidden="true">
    <div className={styles.skeletonRow}>
      <span className={`${styles.skeleton} ${styles.skeletonPill}`} />
      <span className={`${styles.skeleton} ${styles.skeletonPill}`} />
    </div>
    <span className={`${styles.skeleton} ${styles.skeletonTitle}`} />
    <span className={`${styles.skeleton} ${styles.skeletonTitleShort}`} />
    <div className={styles.skeletonRow}>
      <span className={`${styles.skeleton} ${styles.skeletonAvatar}`} />
      <span className={`${styles.skeleton} ${styles.skeletonLine}`} />
    </div>
    <div className={styles.skeletonGrid}>
      {[0, 1, 2, 3].map((i) => <span key={i} className={`${styles.skeleton} ${styles.skeletonMetric}`} />)}
    </div>
    <span className={`${styles.skeleton} ${styles.skeletonButton}`} />
  </div>
);

const LiveCampaignsMobile = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
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
  const filterTriggerRef = useRef(null);
  const firstFilterRef = useRef(null);
  const filterPanelRef = useRef(null);
  const filterWasOpen = useRef(false);

  // Desktop shows the filters as an inline bar; mobile shows them as a modal sheet
  const desktopQuery = '(min-width: 768px)';
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(desktopQuery).matches
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia(desktopQuery);
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
    return () => (mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange));
  }, []);
  const isFilterModal = showFilterPanel && !isDesktop;

  // Filter sheet (mobile modal): focus in when opened, trap Tab, close on Escape, restore focus on close
  useEffect(() => {
    if (isFilterModal) {
      filterWasOpen.current = true;
      // The sheet only becomes focusable once its visibility style applies,
      // so retry on each frame (max ~20 frames) until focus lands inside it
      let raf;
      let tries = 0;
      const focusFirst = () => {
        const el = firstFilterRef.current;
        if (el) el.focus();
        if (document.activeElement !== el && tries++ < 20) raf = requestAnimationFrame(focusFirst);
      };
      raf = requestAnimationFrame(focusFirst);
      const focusables = () =>
        filterPanelRef.current
          ? [...filterPanelRef.current.querySelectorAll('select, button, [href], input, [tabindex]:not([tabindex="-1"])')]
              .filter((el) => !el.disabled && el.getClientRects().length > 0)
          : [];
      const onKey = (e) => {
        if (e.key === 'Escape') {
          setShowFilterPanel(false);
          return;
        }
        if (e.key !== 'Tab') return;
        const items = focusables();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        const inside = filterPanelRef.current.contains(document.activeElement);
        if (e.shiftKey && (document.activeElement === first || !inside)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
          e.preventDefault();
          first.focus();
        }
      };
      document.addEventListener('keydown', onKey);
      return () => {
        cancelAnimationFrame(raf);
        document.removeEventListener('keydown', onKey);
      };
    }
    if (filterWasOpen.current) {
      filterWasOpen.current = false;
      filterTriggerRef.current?.focus();
    }
    return undefined;
  }, [isFilterModal]);

  // If the viewport grows to desktop while the sheet is open, the inline bar takes over
  useEffect(() => {
    if (isDesktop && showFilterPanel) setShowFilterPanel(false);
  }, [isDesktop, showFilterPanel]);

  // Auto-resume CTA action after login
  useEffect(() => {
    const resumeAction = searchParams.get('resumeAction');
    if (resumeAction) {
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

    // Use the node observed now; the ref may point elsewhere by the time cleanup runs
    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => observer.disconnect();
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
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      const ctaAction = encodeURIComponent(action);
      navigate(`/creator/login?returnUrl=${returnUrl}&action=${ctaAction}`);
      return;
    }

    // Signed in: chat opens AURAX messages; brands create campaigns themselves
    if (action === 'chat') {
      navigate('/messages?new=1');
      return;
    }
    if (action === 'post' && areaForUser(currentUser) === 'brand') {
      navigate('/campaigns/create');
      return;
    }
    
    try {
      const response = await axios.get(
        `${API_URL}/api/role/user-status`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const { inquirerVerified } = response.data.user;
      
      if ((action === 'chat' || action === 'call' || action === 'post') && !inquirerVerified) {
        navigate(`/inquiry/form?purpose=${action === 'post' ? 'campaign' : 'connect'}`);
        return;
      }
      switch(action) {
        case 'call':
          navigate('/contact?type=call');
          break;
        case 'post':
          // Non-brand accounts send a campaign brief through the inquiry form
          navigate('/inquiry/form?purpose=campaign');
          break;
        default:
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
      {/* Filter Panel Overlay (mobile) */}
      <div
        className={`${styles.filterPanelOverlay} ${showFilterPanel ? styles.open : ''}`}
        onClick={() => setShowFilterPanel(false)}
        aria-hidden="true"
      />

      {/* Hero Section */}
      <header className={styles.hero}>
        <p className={styles.heroEyebrow}>
          <span className={styles.liveDot} aria-hidden="true" />
          Live marketplace
        </p>
        <h1 className={styles.heroTitle}>
          Discover <span className={styles.heroHighlight}>Live</span> Brand Campaigns
        </h1>
        <p className={styles.heroSubtitle}>
          Real brands looking for creators right now
        </p>
        <dl className={styles.heroStats}>
          <div className={styles.statCard}>
            <dt className={styles.statLabel}>Live Now</dt>
            <dd className={styles.statNumber}>{stats.totalLiveCampaigns}</dd>
          </div>
          <div className={styles.statCard}>
            <dt className={styles.statLabel}>Hand-Picked</dt>
            <dd className={styles.statNumber}>{stats.handPickedCampaigns}</dd>
          </div>
        </dl>
      </header>

      {/* View Switcher + Filter Trigger */}
      <div className={styles.viewSwitcher} role="group" aria-label="Sort campaigns">
        <button
          type="button"
          className={`${styles.viewTab} ${sortBy === 'recent' ? styles.active : ''}`}
          onClick={() => setSortBy('recent')}
          aria-pressed={sortBy === 'recent'}
        >
          <Icon name="flame" /> Recent
        </button>
        <button
          type="button"
          className={`${styles.viewTab} ${sortBy === 'handpicked' ? styles.active : ''}`}
          onClick={() => setSortBy('handpicked')}
          aria-pressed={sortBy === 'handpicked'}
        >
          <Icon name="star" /> Hand Picked
        </button>
        <button
          type="button"
          ref={filterTriggerRef}
          className={styles.filterTrigger}
          onClick={() => setShowFilterPanel(true)}
          aria-label="Filter campaigns"
          aria-haspopup="dialog"
          aria-expanded={showFilterPanel}
          aria-controls="live-filter-panel"
        >
          <Icon name="sliders" />
        </button>
      </div>

      {/* Filter Panel (slide-up on mobile, inline bar on desktop) */}
      <div
        id="live-filter-panel"
        className={`${styles.filterPanel} ${showFilterPanel ? styles.open : ''}`}
        ref={filterPanelRef}
        {...(isDesktop
          ? { role: 'group', 'aria-label': 'Filter campaigns' }
          : { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'live-filter-title' })}
      >
        <div className={styles.filterPanelHandle} aria-hidden="true" />
        <h2 id="live-filter-title" className={styles.filterPanelTitle}>Filter Campaigns</h2>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="live-filter-platform">Platform</label>
          <select
            id="live-filter-platform"
            ref={firstFilterRef}
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
          <label className={styles.filterLabel} htmlFor="live-filter-category">Category</label>
          <select
            id="live-filter-category"
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

        <button type="button" className={styles.filterApply} onClick={applyFilters}>
          Apply Filters
        </button>
      </div>

      {/* Campaign Feed - Vertical Infinite Scroll */}
      <section
        className={styles.campaignFeed}
        aria-label="Live campaigns"
        aria-busy={loading || loadingMore}
      >
        {loading ? (
          <div role="status" className={styles.skeletonList}>
            <span className={styles.srOnly}>Loading campaigns…</span>
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : campaigns.length === 0 ? (
          <div className={styles.empty} role="status">
            <div className={styles.emptyIcon} aria-hidden="true">📭</div>
            <h2>No campaigns found</h2>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {campaigns.map((campaign) => {
              const isExpanded = expandedCards[campaign._id];
              const titleId = `campaign-title-${campaign._id}`;
              const descId = `campaign-desc-${campaign._id}`;
              const brand = campaign.company || campaign.brandName;
              const hasBudget = campaign.budget && (campaign.budget.min || campaign.budget.max);
              const hasDescription = campaign.description && campaign.description !== 'Details will be shared with shortlisted creators';

              return (
                <article key={campaign._id} className={styles.feedCard} aria-labelledby={titleId}>
                  {/* Status row: badges + time */}
                  <div className={styles.cardTopRow}>
                    <ul className={styles.badgeRow} aria-label="Campaign status">
                      <li className={`${styles.badge} ${styles.badgeLive}`}>
                        <span className={styles.liveDot} aria-hidden="true" />
                        Live
                      </li>
                      <li className={`${styles.badge} ${styles.badgeVerified}`} title="Verified by AURAX">
                        <Icon name="check" />
                        Verified<span className={styles.srOnly}> by AURAX</span>
                      </li>
                      {campaign.isHandPicked && (
                        <li className={`${styles.badge} ${styles.badgeHandPicked}`}>
                          <Icon name="star" />
                          Hand Picked
                        </li>
                      )}
                    </ul>
                    <time className={styles.timeAgo} dateTime={campaign.createdAt}>
                      {formatTimeAgo(campaign.createdAt)}
                    </time>
                  </div>

                  {/* Campaign title */}
                  <h2 id={titleId} className={styles.campaignIntent}>
                    {campaign.intent}
                  </h2>

                  {/* Brand profile */}
                  <div className={styles.posterIdentity}>
                    <div className={styles.posterAvatar} aria-hidden="true">
                      {campaign.posterName.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.posterInfo}>
                      <div className={styles.posterName}>
                        <span className={styles.posterNameText}>{campaign.posterName}</span>
                        {(campaign.linkedinVerified || campaign.linkedinUrl) && (
                          <div className={styles.linkedinBadgeContainer}>
                            {campaign.linkedinUrl ? (
                              <a
                                href={campaign.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.linkedinLogo}
                                title="LinkedIn Profile"
                                aria-label={`${campaign.posterName} on LinkedIn (opens in a new tab)`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <LinkedInLogo />
                              </a>
                            ) : (
                              <span
                                className={`${styles.linkedinLogo} ${styles.linkedinLogoDisabled}`}
                                title="LinkedIn Profile"
                                role="img"
                                aria-label="LinkedIn profile"
                              >
                                <LinkedInLogo />
                              </span>
                            )}
                            {campaign.linkedinVerified && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`${styles.verificationShield} ${!campaign.linkedinUrl ? styles.verificationShieldDisabled : ''}`}>
                                <path d="M12 1L21 4v7c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V4l9-3z" fill="#10B981"/>
                                <path d="M10 12.5l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                      <p className={styles.posterMeta}>
                        {campaign.posterRole && <span className={styles.posterRole}>{campaign.posterRole}</span>}
                        {campaign.posterRole && brand && <span className={styles.metaDivider} aria-hidden="true">·</span>}
                        {brand && <span className={styles.posterCompany}>{brand}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Description - collapsible */}
                  {hasDescription && (
                    <div className={styles.descriptionBlock}>
                      <p id={descId} className={`${styles.campaignDescription} ${!isExpanded ? styles.collapsed : ''}`}>
                        {campaign.description}
                      </p>
                      {!isExpanded && campaign.description.length > 150 && (
                        <button
                          type="button"
                          className={styles.seeMoreBtn}
                          aria-expanded="false"
                          aria-controls={descId}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(campaign._id);
                          }}
                        >
                          Read more
                          <Icon name="chevronDown" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Key metrics */}
                  <dl className={styles.metricsGrid}>
                    <div className={styles.metric}>
                      <dt className={styles.metricLabel}><Icon name="wallet" />Budget</dt>
                      <dd className={styles.metricValue}>{hasBudget ? formatBudget(campaign.budget) : 'Not disclosed'}</dd>
                    </div>
                    <div className={styles.metric}>
                      <dt className={styles.metricLabel}><Icon name="users" />Creators</dt>
                      <dd className={styles.metricValue}>{campaign.creatorsNeeded ? `${campaign.creatorsNeeded} needed` : 'Not specified'}</dd>
                    </div>
                    <div className={styles.metric}>
                      <dt className={styles.metricLabel}><Icon name="device" />Type</dt>
                      <dd className={styles.metricValue}>{campaign.platform || 'Not specified'}</dd>
                    </div>
                    <div className={styles.metric}>
                      <dt className={styles.metricLabel}><Icon name="pin" />Location</dt>
                      <dd className={styles.metricValue}>{campaign.locations?.[0] || 'Not specified'}</dd>
                    </div>
                  </dl>

                  {/* Category tags */}
                  {campaign.category?.length > 0 && (
                    <ul className={styles.feedTags} aria-label="Categories">
                      {campaign.category.slice(0, 3).map((cat) => (
                        <li key={cat} className={styles.tag}>{cat}</li>
                      ))}
                    </ul>
                  )}

                  {/* Actions: primary first */}
                  <div className={styles.feedActions}>
                    <button
                      type="button"
                      className={`${styles.feedActionBtn} ${styles.primary}`}
                      aria-describedby={titleId}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCampaignClick(campaign._id);
                      }}
                    >
                      View Details
                      <Icon name="arrowRight" />
                    </button>
                    <button
                      type="button"
                      className={`${styles.feedActionBtn} ${styles.secondaryAction}`}
                      aria-describedby={titleId}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCTAClick('call', e);
                      }}
                    >
                      <Icon name="phone" />
                      Call
                    </button>
                  </div>

                  {/* Contacting Indicator */}
                  {campaign.isVerified && (
                    <p className={styles.contactingIndicator}>
                      <Icon name="check" />
                      <span>You are contacting <strong>{campaign.posterName}</strong></span>
                    </p>
                  )}
                </article>
              );
            })}

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div ref={observerTarget} className={styles.infiniteLoader}>
                {loadingMore && (
                  <div role="status">
                    <span className={styles.srOnly}>Loading more campaigns…</span>
                    <SkeletonCard />
                  </div>
                )}
              </div>
            )}

            {!hasMore && campaigns.length > 0 && (
              <div className={styles.endMessage}>
                <p>You've seen all campaigns</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Sticky Bottom CTA Bar */}
      <div className={styles.bottomCtaBar}>
        <div className={styles.ctaBarContent}>
          <button
            type="button"
            className={`${styles.ctaBarBtn} ${styles.secondary}`}
            onClick={(e) => handleCTAClick('chat', e)}
          >
            <Icon name="chat" /> Chat
          </button>
          <button
            type="button"
            className={`${styles.ctaBarBtn} ${styles.primary}`}
            onClick={(e) => handleCTAClick('post', e)}
          >
            <Icon name="plus" /> Post Campaign
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveCampaignsMobile;
