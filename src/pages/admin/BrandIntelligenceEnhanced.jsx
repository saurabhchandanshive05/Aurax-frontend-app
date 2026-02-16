import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import AdminNav from "../../components/admin/AdminNav";
import styles from "./BrandIntelligence.module.css";

/**
 * AURAX INTERNAL INTELLIGENCE
 * 
 * Enhanced Brand Intelligence Dashboard with:
 * - Advanced search & filtering
 * - Activity freshness indicators
 * - On-demand verification
 * - Research & outreach tools
 * 
 * Access: Admin only
 */

const BrandIntelligenceEnhanced = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Auth check
  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const hasAdminRole = currentUser?.roles?.includes('admin') || currentUser?.role === 'admin';
    if (!hasAdminRole) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, currentUser, isLoading, navigate]);
  
  // Data states
  const [stats, setStats] = useState(null);
  const [brands, setBrands] = useState([]);
  const [trendingBrands, setTrendingBrands] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [ctaTypes, setCtaTypes] = useState([]);
  const [internalTags, setInternalTags] = useState([]);
  const [pagination, setPagination] = useState(null);
  
  // Enhanced filter states
  const [filters, setFilters] = useState({
    search: "",
    intent: "",
    intent_min: "",
    intent_max: "",
    industry: "",
    spend_bucket: "",
    cta_type: "",
    activity_status: "",
    sales_readiness: "",
    internal_tag: "",
    is_new: false,
    is_scaling: false,
    sort: "intent_score",
    order: "desc",
    page: 1,
    limit: 20,
  });
  
  // UI states
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [creators, setCreators] = useState([]);
  const [loadingCreators, setLoadingCreators] = useState(false);
  const [creatorFilters, setCreatorFilters] = useState({
    search: "",
    role: "",
    verified: "",
    hasInstagram: "",
    sort: "createdAt",
    order: "desc"
  });
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [researchData, setResearchData] = useState({
    internal_notes: "",
    internal_tags: [],
    confidence_note: "",
    sales_readiness: "Needs Research",
  });
  const [addBrandData, setAddBrandData] = useState({
    brand_name: "",
    meta_page_id: "",
    meta_page_name: "",
    meta_ads_library_url: "",
    industry: "",
    active_ads_count: "",
    ad_formats: [],
    cta_types: [],
    consecutive_active_days: "",
  });
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [autoFetchError, setAutoFetchError] = useState(null);
  const [isAutoFetched, setIsAutoFetched] = useState(false);
  const [verifyingBrand, setVerifyingBrand] = useState(null);
  const [hasDemoData, setHasDemoData] = useState(false);
  const [showDemoWarning, setShowDemoWarning] = useState(true);
  
  // Screenshot Intelligence states
  const [uploadedScreenshots, setUploadedScreenshots] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedAds, setExtractedAds] = useState([]);
  const [generatedHooks, setGeneratedHooks] = useState([]);
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [showNoResultsCTA, setShowNoResultsCTA] = useState(false);
  const [aiProvider, setAiProvider] = useState('ollama'); // 'openai' | 'ollama' | 'paddleocr'
  
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";
  
  // Fetch initial data
  useEffect(() => {
    fetchDashboardData();
    fetchMetadata();
  }, []);
  
  // Fetch brands when filters change
  useEffect(() => {
    if (activeTab === "brands") {
      fetchBrands();
    }
  }, [filters, activeTab]);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      
      const [statsRes, trendingRes, industriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/brand-intelligence/stats`, { headers }),
        axios.get(`${API_URL}/api/brand-intelligence/brands/trending`, { headers }),
        axios.get(`${API_URL}/api/brand-intelligence/industries`, { headers }),
      ]);
      
      setStats(statsRes.data.data);
      setTrendingBrands(trendingRes.data.data);
      setIndustries(industriesRes.data.data);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard");
      setLoading(false);
    }
  };
  
  const fetchMetadata = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [ctaRes, tagsRes] = await Promise.all([
        axios.get(`${API_URL}/api/brand-intelligence/cta-types`, { headers }),
        axios.get(`${API_URL}/api/brand-intelligence/internal-tags`, { headers }),
      ]);
      
      setCtaTypes(ctaRes.data.data);
      setInternalTags(tagsRes.data.data);
    } catch (err) {
      console.error("Error fetching metadata:", err);
    }
  };
  
  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== false) {
          params.append(key, value.toString());
        }
      });
      
      const response = await axios.get(
        `${API_URL}/api/brand-intelligence/brands?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setBrands(response.data.data);
      setPagination(response.data.pagination);
      
      // Show "Search on Meta" CTA if no results and user is searching
      if (response.data.data.length === 0 && filters.search && filters.search.trim()) {
        setShowNoResultsCTA(true);
      } else {
        setShowNoResultsCTA(false);
      }
      
      // Check for demo data
      const hasDemo = response.data.data.some(brand => brand.is_demo_data === true);
      setHasDemoData(hasDemo);
    } catch (err) {
      console.error("Error fetching brands:", err);
      setError(err.response?.data?.message || "Failed to load brands");
    }
  };
  
  const viewBrandDetails = async (brandId) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `${API_URL}/api/brand-intelligence/brands/${brandId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setSelectedBrand(response.data.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Error fetching brand details:", err);
      alert("Failed to load brand details");
    }
  };
  
  const openResearchModal = (brand) => {
    setSelectedBrand(brand);
    setResearchData({
      internal_notes: brand.internal_notes || "",
      internal_tags: brand.internal_tags || [],
      confidence_note: brand.confidence_note || "",
      sales_readiness: brand.sales_readiness || "Needs Research",
    });
    setShowResearchModal(true);
  };
  
  // Fetch creators function
  const fetchCreators = async () => {
    try {
      setLoadingCreators(true);
      const token = localStorage.getItem("token");
      
      const params = new URLSearchParams();
      Object.entries(creatorFilters).forEach(([key, value]) => {
        if (value !== "" && value !== false) {
          params.append(key, value.toString());
        }
      });
      
      const response = await axios.get(
        `${API_URL}/api/admin/creators/users?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setCreators(response.data.data || response.data);
      setLoadingCreators(false);
    } catch (err) {
      console.error("Error fetching creators:", err);
      setError(err.response?.data?.message || "Failed to load creators");
      setLoadingCreators(false);
    }
  };
  
  // Load creators when tab changes to "creators"
  useEffect(() => {
    if (activeTab === "creators") {
      fetchCreators();
    }
  }, [activeTab, creatorFilters]);

  const saveResearchData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.patch(
        `${API_URL}/api/brand-intelligence/brands/${selectedBrand.brand_id}/research`,
        researchData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      alert("Research data saved successfully");
      setShowResearchModal(false);
      fetchBrands();
    } catch (err) {
      console.error("Error saving research data:", err);
      alert("Failed to save research data");
    }
  };
  
  const queueVerification = async (brandId) => {
    try {
      setVerifyingBrand(brandId);
      const token = localStorage.getItem("token");
      
      await axios.post(
        `${API_URL}/api/brand-intelligence/brands/${brandId}/verify`,
        { mode: "queue" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      alert("Verification queued successfully");
      fetchBrands();
    } catch (err) {
      console.error("Error queuing verification:", err);
      alert("Failed to queue verification");
    } finally {
      setVerifyingBrand(null);
    }
  };
  
  const getIntentBadgeColor = (score) => {
    if (score >= 8) return "high";
    if (score >= 5) return "mid";
    return "low";
  };
  
  const getActivityStatusColor = (status) => {
    if (status === "Active") return "green";
    if (status === "Recently Active") return "yellow";
    return "gray";
  };
  
  const getSalesReadinessColor = (readiness) => {
    if (readiness === "Ready") return "green";
    if (readiness === "Needs Research") return "yellow";
    if (readiness === "Low Priority") return "gray";
    return "red";
  };
  
  const formatFreshnessLabel = (freshnessLabel) => {
    if (freshnessLabel === "Active (verified ≤ 12h)") return "🟢 Active (≤ 12h)";
    if (freshnessLabel === "Recently Active (verified ≤ 24h)") return "🟡 Recent (≤ 24h)";
    if (freshnessLabel === "Possibly Inactive (verified ≤ 48h)") return "🟠 Stale (≤ 48h)";
    return "⚪ Never Verified";
  };
  
  const openMetaAdLibrarySearch = () => {
    const query = encodeURIComponent(filters.search.trim());
    const metaUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=IN&q=${query}&search_type=keyword_unordered`;
    window.open(metaUrl, '_blank');
  };
  
  const openAddBrandModal = () => {
    setAddBrandData({
      brand_name: filters.search || "",
      meta_page_id: "",
      meta_page_name: "",
      meta_ads_library_url: "",
      industry: "",
      active_ads_count: "",
      ad_formats: [],
      cta_types: [],
      consecutive_active_days: "",
    });
    setIsAutoFetched(false);
    setAutoFetchError(null);
    setShowAddBrandModal(true);
  };
  
  const handleAddBrand = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${API_URL}/api/brand-intelligence/verify-from-meta`,
        addBrandData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      alert(response.data.message);
      setShowAddBrandModal(false);
      
      // Refresh brand list
      fetchBrands();
      fetchDashboardData();
    } catch (err) {
      console.error("Error adding brand:", err);
      alert(err.response?.data?.message || "Failed to add brand");
    }
  };
  
  const handleAutoFetch = async () => {
    // Validate input
    if (!addBrandData.meta_page_id) {
      setAutoFetchError("Please enter a Meta Page ID first");
      return;
    }
    
    setIsAutoFetching(true);
    setAutoFetchError(null);
    
    try {
      const token = localStorage.getItem("token");
      
      // Call the new Meta Graph API integration endpoint
      const response = await axios.post(
        `${API_URL}/api/meta/ad-library/fetch`,
        {
          pageId: addBrandData.meta_page_id,
          country: 'IN',
          activeStatus: 'ACTIVE',
          limit: 25,
          forceRefresh: false
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        const { summary, ads, cached } = response.data;
        
        // Extract platforms for ad_formats
        const platforms = summary.platforms || [];
        const formattedPlatforms = platforms.map(p => {
          if (p === 'facebook') return 'Facebook';
          if (p === 'instagram') return 'Instagram';
          if (p === 'messenger') return 'Messenger';
          if (p === 'audience_network') return 'Audience Network';
          return p;
        });
        
        // Auto-fill form with data from Meta Graph API
        setAddBrandData({
          ...addBrandData,
          brand_name: addBrandData.brand_name || summary.pageName,
          meta_page_id: summary.pageId,
          meta_page_name: summary.pageName,
          meta_ads_library_url: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&view_all_page_id=${summary.pageId}`,
          active_ads_count: summary.activeAdsCount.toString(),
          ad_formats: formattedPlatforms,
          cta_types: []
        });
        
        setIsAutoFetched(true);
        
        const message = cached 
          ? `✅ Data loaded from cache (fetched ${new Date(summary.lastFetchedAt).toLocaleString()})`
          : `✅ Successfully fetched ${summary.activeAdsCount} active ads from Meta Graph API`;
        
        alert(message);
      }
      
    } catch (err) {
      console.error("Auto-fetch error:", err);
      
      const errorData = err.response?.data;
      const errorMsg = errorData?.message || "Failed to fetch data from Meta Ads Library";
      setAutoFetchError(errorMsg);
      
      // If a fallback URL is provided, offer to open it
      if (errorData?.fallbackUrl) {
        const openManual = window.confirm(
          `${errorMsg}\n\nWould you like to open the Meta Ad Library manually to view the ads?`
        );
        if (openManual) {
          window.open(errorData.fallbackUrl, '_blank');
        }
      } else {
        alert(errorMsg);
      }
    } finally {
      setIsAutoFetching(false);
    }
  };
  
  // Screenshot Intelligence Handlers
  const handleScreenshotUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and count
    const validFiles = files.filter(file => 
      file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg'
    );
    
    if (validFiles.length === 0) {
      alert('Please upload only PNG or JPG images');
      return;
    }
    
    if (validFiles.length > 20) {
      alert('Maximum 20 screenshots allowed');
      return;
    }
    
    // Create preview URLs
    const screenshotsWithPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    
    setUploadedScreenshots(screenshotsWithPreviews);
    setExtractedAds([]);
    setGeneratedHooks([]);
    setAnalysisError(null);
  };
  
  const handleAnalyzeScreenshots = async () => {
    if (uploadedScreenshots.length === 0) {
      alert('Please upload screenshots first');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const token = localStorage.getItem("token");
      
      // Different API endpoints based on AI provider
      let endpoint, requestData, headers;
      
      if (aiProvider === 'paddleocr') {
        // PaddleOCR: Send screenshot URLs (must be already uploaded to Cloudinary)
        const screenshotData = uploadedScreenshots.map(s => ({
          url: s.preview, // Cloudinary URL
          fileName: s.file.name
        }));
        
        endpoint = `${API_URL}/api/brand-intelligence/ocr-extract`;
        requestData = { screenshots: screenshotData };
        headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        const response = await axios.post(endpoint, requestData, { headers });
        
        if (response.data.success) {
          // Flatten all ads from all screenshots
          const allAds = response.data.results.flatMap(result => 
            result.ads.map(ad => ({
              ...ad,
              source: 'paddleocr',
              screenshotUrl: result.screenshotUrl,
              ocrConfidence: result.ocrConfidence,
              qualityScore: result.qualityScore
            }))
          );
          
          setExtractedAds(allAds);
          alert(`✅ Successfully extracted ${allAds.length} ads using PaddleOCR!\nTotal screenshots: ${response.data.screenshotsProcessed}`);
        }
      } else {
        // Ollama or OpenAI: Upload files via FormData
        const formData = new FormData();
        
        uploadedScreenshots.forEach(screenshot => {
          formData.append('screenshots', screenshot.file);
        });
        
        endpoint = `${API_URL}/api/brand-intelligence/screenshots/analyze?provider=${aiProvider}`;
        headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        };
        
        const response = await axios.post(endpoint, formData, { headers });
        
        if (response.data.success) {
          setExtractedAds(response.data.ads);
          alert(`✅ Successfully extracted ${response.data.ads.length} ads from screenshots!`);
        }
      }
    } catch (err) {
      console.error('Screenshot analysis error:', err);
      let errorMsg = err.response?.data?.message || 'Failed to analyze screenshots';
      
      // Special handling for PaddleOCR service unavailable
      if (err.response?.status === 503 && aiProvider === 'paddleocr') {
        errorMsg = '❌ PaddleOCR service is not running.\n\nPlease start it with:\ncd aurax-ocr-service\npython main.py';
      }
      
      setAnalysisError(errorMsg);
      alert(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleGenerateHooks = async () => {
    if (extractedAds.length === 0) {
      alert('Please analyze screenshots first');
      return;
    }
    
    setIsGeneratingHooks(true);
    
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${API_URL}/api/brand-intelligence/screenshots/generate-hooks?provider=${aiProvider}`,
        { ads: extractedAds },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setGeneratedHooks(response.data.hooks);
        alert('✅ Hooks generated successfully!');
      }
    } catch (err) {
      console.error('Hook generation error:', err);
      alert(err.response?.data?.message || 'Failed to generate hooks');
    } finally {
      setIsGeneratingHooks(false);
    }
  };
  
  const handleRemoveScreenshot = (index) => {
    setUploadedScreenshots(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    alert('✅ Copied to clipboard!');
  };
  
  const handleCopyAllHooks = () => {
    const allHooks = generatedHooks.map(h => h.hook).join('\n\n');
    navigator.clipboard.writeText(allHooks);
    alert('✅ All hooks copied to clipboard!');
  };
  
  if (loading || isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <AdminNav />
        <div className={styles.mainContent}>
          <div className={styles.container}>
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading Aurax Internal Intelligence...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <AdminNav />
        <div className={styles.mainContent}>
          <div className={styles.container}>
            <div className={styles.error}>
              <h2>⚠️ Error</h2>
              <p>{error}</p>
              <button onClick={fetchDashboardData}>Retry</button>
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
        <div className={styles.container}>
          {/* REMOVED: Demo Data Warning Banner - We only show VERIFIED brands */}
          
          {/* Header */}
          <div className={styles.header}>
            <div>
              <h1>🧠 Aurax Internal Intelligence</h1>
              <p>Verified Instagram Advertisers from Meta Ad Library · Research & Outreach Support</p>
            </div>
            <div className={styles.headerActions}>
              <button 
                className={styles.addBrandBtn} 
                onClick={openAddBrandModal}
                title="Add brand from Meta Ads Library"
              >
                ➕ Add Brand
              </button>
              <button className={styles.refreshBtn} onClick={fetchDashboardData}>
                🔄 Refresh Data
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={activeTab === "overview" ? styles.tabActive : ""}
              onClick={() => setActiveTab("overview")}
            >
              📊 Overview
            </button>
            <button
              className={activeTab === "brands" ? styles.tabActive : ""}
              onClick={() => setActiveTab("brands")}
            >
              🔍 Search & Discover
            </button>
            <button
              className={activeTab === "trending" ? styles.tabActive : ""}
              onClick={() => setActiveTab("trending")}
            >
              🔥 High-Growth Signals
            </button>
            <button
              className={activeTab === "screenshots" ? styles.tabActive : ""}
              onClick={() => setActiveTab("screenshots")}
            >
              📸 Screenshot Intelligence
            </button>
            <button
              className={activeTab === "creators" ? styles.tabActive : ""}
              onClick={() => setActiveTab("creators")}
            >
              👥 Creator Database
            </button>
          </div>
          
          {/* Overview Tab */}
          {activeTab === "overview" && stats && (
            <div className={styles.overview}>
              {/* Stats Grid */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🏢</div>
                  <div className={styles.statValue}>{stats.total_brands}</div>
                  <div className={styles.statLabel}>Total Brands</div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🎯</div>
                  <div className={styles.statValue}>{stats.high_intent_brands}</div>
                  <div className={styles.statLabel}>High-Intent (8-10)</div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>⚡</div>
                  <div className={styles.statValue}>{stats.active_this_week}</div>
                  <div className={styles.statLabel}>Active This Week</div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🆕</div>
                  <div className={styles.statValue}>{stats.new_advertisers}</div>
                  <div className={styles.statLabel}>New Advertisers</div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📈</div>
                  <div className={styles.statValue}>{stats.scaling_brands}</div>
                  <div className={styles.statLabel}>Scaling Fast</div>
                </div>
              </div>
              
              {/* Positioning Statement */}
              <div className={styles.positioningStatement}>
                <h3>💡 How We Use This</h3>
                <p>
                  Aurax Internal Intelligence helps our team identify brands already investing in 
                  Instagram advertising, so outreach, creator matching, and partnerships are faster 
                  and more targeted.
                </p>
                <ul>
                  <li>✅ Public, read-only ad transparency signals</li>
                  <li>✅ Estimated intent scores (not real-time)</li>
                  <li>✅ Internal research use only</li>
                  <li>❌ No personal data or performance metrics</li>
                </ul>
              </div>
              
              {/* Top Industries */}
              <div className={styles.section}>
                <h2>🏭 Top Industries</h2>
                <div className={styles.industryList}>
                  {stats.top_industries.map((industry, index) => (
                    <div key={index} className={styles.industryCard}>
                      <div className={styles.industryRank}>#{index + 1}</div>
                      <div className={styles.industryName}>{industry.industry}</div>
                      <div className={styles.industryCount}>{industry.count} brands</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Brands Tab - Enhanced Search & Discovery */}
          {activeTab === "brands" && (
            <div className={styles.brandsTab}>
              {/* Search Bar */}
              <div className={styles.searchBar}>
                <input
                  type="text"
                  placeholder="🔍 Search brands by name (prefix search)..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className={styles.searchInput}
                />
              </div>
              
              {/* Enhanced Filters */}
              <div className={styles.filters}>
                <div className={styles.filterRow}>
                  <select
                    value={filters.industry}
                    onChange={(e) => setFilters({ ...filters, industry: e.target.value, page: 1 })}
                  >
                    <option value="">All Industries</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={filters.activity_status}
                    onChange={(e) => setFilters({ ...filters, activity_status: e.target.value, page: 1 })}
                  >
                    <option value="">All Activity Statuses</option>
                    <option value="Active">🟢 Active (≤ 12h)</option>
                    <option value="Recently Active">🟡 Recently Active (≤ 24h)</option>
                    <option value="Possibly Inactive">🟠 Possibly Inactive (≥ 48h)</option>
                  </select>
                  
                  <select
                    value={filters.cta_type}
                    onChange={(e) => setFilters({ ...filters, cta_type: e.target.value, page: 1 })}
                  >
                    <option value="">All CTA Types</option>
                    {ctaTypes.map((cta) => (
                      <option key={cta} value={cta}>
                        {cta.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={filters.sales_readiness}
                    onChange={(e) => setFilters({ ...filters, sales_readiness: e.target.value, page: 1 })}
                  >
                    <option value="">All Readiness Levels</option>
                    <option value="Ready">🟢 Ready</option>
                    <option value="Needs Research">🟡 Needs Research</option>
                    <option value="Low Priority">⚪ Low Priority</option>
                    <option value="Not Ready">🔴 Not Ready</option>
                  </select>
                  
                  <select
                    value={filters.internal_tag}
                    onChange={(e) => setFilters({ ...filters, internal_tag: e.target.value, page: 1 })}
                  >
                    <option value="">All Tags</option>
                    {internalTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.filterRow}>
                  <div className={styles.rangeFilter}>
                    <label>Intent Score:</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      placeholder="Min"
                      value={filters.intent_min}
                      onChange={(e) => setFilters({ ...filters, intent_min: e.target.value, page: 1 })}
                      className={styles.rangeInput}
                    />
                    <span>–</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      placeholder="Max"
                      value={filters.intent_max}
                      onChange={(e) => setFilters({ ...filters, intent_max: e.target.value, page: 1 })}
                      className={styles.rangeInput}
                    />
                  </div>
                  
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
                  >
                    <option value="intent_score">Sort by: Intent Score</option>
                    <option value="last_verified">Sort by: Last Verified</option>
                    <option value="last_active">Sort by: Last Active</option>
                  </select>
                  
                  <select
                    value={filters.order}
                    onChange={(e) => setFilters({ ...filters, order: e.target.value, page: 1 })}
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                  
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={filters.is_new}
                      onChange={(e) => setFilters({ ...filters, is_new: e.target.checked, page: 1 })}
                    />
                    New Advertisers
                  </label>
                  
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={filters.is_scaling}
                      onChange={(e) => setFilters({ ...filters, is_scaling: e.target.checked, page: 1 })}
                    />
                    Scaling Fast
                  </label>
                </div>
              </div>
              
              {/* Results Count */}
              {pagination && (
                <div className={styles.resultsInfo}>
                  <p>
                    Showing {brands.length} of {pagination.total} brands · 
                    Page {pagination.page} of {pagination.pages}
                  </p>
                </div>
              )}
              
              {/* Brand List with Enhanced Cards */}
              <div className={styles.brandList}>
                {brands.map((brand) => (
                  <div 
                    key={brand.brand_id} 
                    className={styles.brandCardEnhanced}
                  >
                    <div className={styles.brandHeader}>
                      <div>
                        <h3>
                          {brand.brand_name}
                        </h3>
                        <span className={styles.industry}>{brand.industry}</span>
                        {/* Meta Page Verification Badge - ALL brands are VERIFIED */}
                        {brand.verification?.meta_page_name && (
                          <a 
                            href={brand.verification.meta_page_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.metaPageLink}
                            title={`Meta Page: ${brand.verification.meta_page_name}`}
                          >
                            ✅ {brand.verification.meta_page_name}
                          </a>
                        )}
                      </div>
                      <span className={`${styles.intentBadge} ${styles[getIntentBadgeColor(brand.intent_score)]}`}>
                        {brand.intent_score}/10
                      </span>
                    </div>
                    
                    {/* Activity Freshness */}
                    <div className={styles.freshnessIndicator}>
                      <span className={`${styles.activityStatus} ${styles[getActivityStatusColor(brand.activity_status)]}`}>
                        {formatFreshnessLabel(brand.freshness_label)}
                      </span>
                      <span className={styles.verifiedTime}>
                        Verified: {brand.verification?.verified_at 
                          ? new Date(brand.verification.verified_at).toLocaleDateString()
                          : "Unknown"} · Confidence: {brand.verification?.confidence || 0}%
                      </span>
                    </div>
                    
                    {/* Ad Intelligence */}
                    <div className={styles.adIntelligence}>
                      <span>📊 {brand.active_ads} active ads</span>
                      <span>•</span>
                      <span>{brand.ad_formats?.join(", ") || "N/A"}</span>
                      {brand.consecutive_active_days > 0 && (
                        <>
                          <span>•</span>
                          <span>🔥 {brand.consecutive_active_days} days streak</span>
                        </>
                      )}
                    </div>
                    
                    {/* Sales Readiness */}
                    <div className={styles.salesReadiness}>
                      <span className={`${styles.readinessBadge} ${styles[getSalesReadinessColor(brand.sales_readiness)]}`}>
                        {brand.sales_readiness || "Needs Research"}
                      </span>
                      {brand.confidence_note && (
                        <span className={styles.confidenceNote}>
                          💡 {brand.confidence_note}
                        </span>
                      )}
                    </div>
                    
                    {/* Internal Tags */}
                    {brand.internal_tags && brand.internal_tags.length > 0 && (
                      <div className={styles.internalTags}>
                        {brand.internal_tags.map((tag, idx) => (
                          <span key={idx} className={styles.tagBadge}>
                            🏷️ {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className={styles.brandActions}>
                      <button 
                        className={styles.btnSecondary}
                        onClick={() => viewBrandDetails(brand.brand_id)}
                      >
                        📋 View Details
                      </button>
                      {brand.verification?.meta_ads_library_url ? (
                        <a
                          href={brand.verification.meta_ads_library_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.btnMetaLibrary}
                          title="View ads in Meta Ad Library"
                        >
                          🔗 View in Meta Ad Library
                        </a>
                      ) : null}
                      <button 
                        className={styles.btnPrimary}
                        onClick={() => openResearchModal(brand)}
                      >
                        ✏️ Research Notes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className={styles.pagination}>
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                  >
                    ← Previous
                  </button>
                  <span>Page {pagination.page} of {pagination.pages}</span>
                  <button
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                  >
                    Next →
                  </button>
                </div>
              )}
              
              {brands.length === 0 && !showNoResultsCTA && (
                <div className={styles.emptyState}>
                  <p>No brands found with selected filters</p>
                </div>
              )}

              {/* No Results CTA - Search on Meta Ads Library */}
              {brands.length === 0 && showNoResultsCTA && (
                <div className={styles.noResultsContainer}>
                  <div className={styles.noResultsIcon}>🔍</div>
                  <h3>No brands found in Aurax for "{filters.search}"</h3>
                  <p className={styles.noResultsText}>
                    This brand might exist on Meta Ads Library but isn't in our database yet.
                    <br />
                    Search Meta directly or add it to Aurax.
                  </p>
                  <div className={styles.ctaButtons}>
                    <button 
                      onClick={openMetaAdLibrarySearch}
                      className={styles.btnMetaSearch}
                    >
                      🔗 Search on Meta Ads Library
                    </button>
                    <button 
                      onClick={openAddBrandModal}
                      className={styles.btnSecondary}
                    >
                      ➕ Add Brand Manually
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Trending Tab */}
          {activeTab === "trending" && (
            <div className={styles.trendingTab}>
              <div className={styles.section}>
                <h2>🔥 Brands with High Growth Signals</h2>
                <p>New advertisers or brands scaling ad spend rapidly</p>
                
                <div className={styles.brandList}>
                  {trendingBrands.map((brand) => (
                    <div 
                      key={brand.brand_id} 
                      className={styles.brandCard}
                    >
                      <div className={styles.brandHeader}>
                        <h3>{brand.brand_name}</h3>
                        <span className={`${styles.intentBadge} ${styles[getIntentBadgeColor(brand.intent_score)]}`}>
                          {brand.intent_score}/10
                        </span>
                      </div>
                      
                      <div className={styles.brandMeta}>
                        <span>{brand.industry}</span>
                        <span>•</span>
                        <span>{brand.active_ads} active ads</span>
                      </div>
                      
                      <div className={styles.brandTags}>
                        {brand.is_new_advertiser && <span className={styles.newBadge}>🆕 NEW ADVERTISER</span>}
                        {brand.is_scaling && <span className={styles.scalingBadge}>📈 SCALING FAST</span>}
                        {brand.growth_velocity === "accelerating" && (
                          <span className={styles.acceleratingBadge}>🚀 ACCELERATING</span>
                        )}
                      </div>
                      
                      <div className={styles.brandActions}>
                        <button 
                          className={styles.btnSecondary}
                          onClick={() => viewBrandDetails(brand.brand_id)}
                        >
                          📋 View Details
                        </button>
                        <button 
                          className={styles.btnPrimary}
                          onClick={() => openResearchModal(brand)}
                        >
                          ✏️ Research Notes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Screenshot Intelligence Tab */}
          {activeTab === "screenshots" && (
            <div className={styles.screenshotTab}>
              <div className={styles.section}>
                <h2>📸 Daily Ad Library Screenshot Intelligence</h2>
                <p>Upload Meta Ad Library screenshots to extract ad data and generate hooks</p>
                
                {/* AI Provider Selector */}
                <div className={styles.providerSelection}>
                  <label>
                    🤖 AI Provider:
                  </label>
                  <div className={styles.providerButtons}>
                    <button
                      className={`${styles.providerBtn} ${aiProvider === 'ollama' ? styles.providerBtnActive : ''}`}
                      onClick={() => setAiProvider('ollama')}
                    >
                      <span className={styles.providerIcon}>🏠</span>
                      <div className={styles.providerInfo}>
                        <span className={styles.providerName}>Ollama (Local)</span>
                        <span className={styles.providerTag}>FREE • Creative Analysis</span>
                      </div>
                    </button>
                    <button
                      className={`${styles.providerBtn} ${aiProvider === 'paddleocr' ? styles.providerBtnActive : ''}`}
                      onClick={() => setAiProvider('paddleocr')}
                    >
                      <span className={styles.providerIcon}>📝</span>
                      <div className={styles.providerInfo}>
                        <span className={styles.providerName}>PaddleOCR (Local)</span>
                        <span className={styles.providerTag}>FREE • Best Text Extraction</span>
                      </div>
                    </button>
                    <button
                      className={`${styles.providerBtn} ${aiProvider === 'openai' ? styles.providerBtnActive : ''}`}
                      onClick={() => setAiProvider('openai')}
                    >
                      <span className={styles.providerIcon}>☁️</span>
                      <div className={styles.providerInfo}>
                        <span className={styles.providerName}>OpenAI (Cloud)</span>
                        <span className={styles.providerTag}>PAID • Best Results</span>
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Upload Section */}
                <div className={styles.uploadSection}>
                  <div className={styles.uploadCard}>
                    <div className={styles.uploadIcon}>📤</div>
                    <h3>Upload Screenshots</h3>
                    <p>Select 1-20 screenshots from Meta Ad Library (PNG/JPG)</p>
                    
                    <input
                      type="file"
                      id="screenshot-upload"
                      multiple
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleScreenshotUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="screenshot-upload" className={styles.btnUpload}>
                      📁 Choose Files
                    </label>
                    
                    {uploadedScreenshots.length > 0 && (
                      <div className={styles.uploadInfo}>
                        <span>✅ {uploadedScreenshots.length} screenshot{uploadedScreenshots.length > 1 ? 's' : ''} selected</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Screenshot Previews */}
                  {uploadedScreenshots.length > 0 && (
                    <div className={styles.previewGrid}>
                      {uploadedScreenshots.map((screenshot, index) => (
                        <div key={index} className={styles.previewItem}>
                          <img src={screenshot.preview} alt={screenshot.name} />
                          <button 
                            className={styles.removePreview}
                            onClick={() => handleRemoveScreenshot(index)}
                          >
                            ✕
                          </button>
                          <div className={styles.previewName}>{screenshot.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Analyze Button */}
                  {uploadedScreenshots.length > 0 && (
                    <button
                      className={styles.btnAnalyze}
                      onClick={handleAnalyzeScreenshots}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? '🔄 Analyzing Screenshots...' : '🤖 Analyze Ads'}
                    </button>
                  )}
                  
                  {analysisError && (
                    <div className={styles.errorAlert}>
                      ⚠️ {analysisError}
                    </div>
                  )}
                </div>
                
                {/* Extracted Ads Section */}
                {extractedAds.length > 0 && (
                  <div className={styles.extractedAdsSection}>
                    <div className={styles.sectionHeader}>
                      <h3>📊 Extracted Ads ({extractedAds.length})</h3>
                      <button
                        className={styles.btnGenerateHooks}
                        onClick={handleGenerateHooks}
                        disabled={isGeneratingHooks}
                      >
                        {isGeneratingHooks ? '🔄 Generating...' : '✨ Generate Hooks'}
                      </button>
                    </div>
                    
                    {/* Group ads by month */}
                    {Object.entries(
                      extractedAds.reduce((acc, ad) => {
                        const date = new Date(ad.start_date);
                        const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                        if (!acc[monthYear]) acc[monthYear] = [];
                        acc[monthYear].push(ad);
                        return acc;
                      }, {})
                    ).map(([monthYear, ads]) => (
                      <div key={monthYear} className={styles.monthGroup}>
                        <h4 className={styles.monthHeader}>🗓️ Launched in {monthYear}</h4>
                        <div className={styles.adsGrid}>
                          {ads.map((ad, index) => (
                            <div key={index} className={styles.adCard}>
                              <div className={styles.adHeader}>
                                <span className={styles.brandName}>{ad.brand_name}</span>
                                <span className={`${styles.statusBadge} ${ad.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                                  {ad.status}
                                </span>
                              </div>
                              
                              <div className={styles.adMeta}>
                                <div className={styles.metaRow}>
                                  <span className={styles.metaLabel}>Library ID:</span>
                                  <span className={styles.metaValue}>{ad.library_id || 'N/A'}</span>
                                </div>
                                <div className={styles.metaRow}>
                                  <span className={styles.metaLabel}>Start Date:</span>
                                  <span className={styles.metaValue}>{new Date(ad.start_date).toLocaleDateString()}</span>
                                </div>
                                <div className={styles.metaRow}>
                                  <span className={styles.metaLabel}>Format:</span>
                                  <span className={styles.metaValue}>{ad.format || 'Image'}</span>
                                </div>
                                <div className={styles.metaRow}>
                                  <span className={styles.metaLabel}>CTA:</span>
                                  <span className={styles.metaValue}>{ad.cta || 'N/A'}</span>
                                </div>
                                {ad.platforms && ad.platforms.length > 0 && (
                                  <div className={styles.metaRow}>
                                    <span className={styles.metaLabel}>Platforms:</span>
                                    <span className={styles.metaValue}>{ad.platforms.join(', ')}</span>
                                  </div>
                                )}
                              </div>
                              
                              {ad.primary_text && (
                                <div className={styles.adText}>
                                  <div className={styles.adTextLabel}>Ad Copy:</div>
                                  <div className={styles.adTextContent}>{ad.primary_text}</div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Generated Hooks Section */}
                {generatedHooks.length > 0 && (
                  <div className={styles.hooksSection}>
                    <div className={styles.sectionHeader}>
                      <h3>✨ Generated Hooks & Angles ({generatedHooks.length})</h3>
                      <button
                        className={styles.btnCopyAll}
                        onClick={handleCopyAllHooks}
                      >
                        📋 Copy All
                      </button>
                    </div>
                    
                    <div className={styles.hooksGrid}>
                      {generatedHooks.map((hook, index) => (
                        <div key={index} className={styles.hookCard}>
                          <div className={styles.hookHeader}>
                            <span className={styles.hookNumber}>#{index + 1}</span>
                            <button
                              className={styles.btnCopy}
                              onClick={() => handleCopyText(hook.hook)}
                            >
                              📋 Copy
                            </button>
                          </div>
                          <div className={styles.hookContent}>
                            <div className={styles.hookText}>{hook.hook}</div>
                            {hook.angle && (
                              <div className={styles.hookAngle}>
                                <span className={styles.angleLabel}>Angle:</span> {hook.angle}
                              </div>
                            )}
                            {hook.reel_opener && (
                              <div className={styles.reelOpener}>
                                <span className={styles.openerLabel}>Reel Opener:</span> {hook.reel_opener}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Creator Database Tab */}
          {activeTab === "creators" && (
            <div className={styles.creatorsSection}>
              <div className={styles.sectionHeader}>
                <h2>👥 Creator Database</h2>
                <p>Manage and view all registered creators on the platform</p>
              </div>
              
              {/* Creator Filters */}
              <div className={styles.filterBar}>
                <input
                  type="text"
                  placeholder="🔍 Search creators by name, email, or username..."
                  value={creatorFilters.search}
                  onChange={(e) => setCreatorFilters({ ...creatorFilters, search: e.target.value })}
                  className={styles.searchInput}
                />
                
                <select
                  value={creatorFilters.role}
                  onChange={(e) => setCreatorFilters({ ...creatorFilters, role: e.target.value })}
                  className={styles.select}
                >
                  <option value="">All Roles</option>
                  <option value="creator">Creator</option>
                  <option value="admin">Admin</option>
                  <option value="inquirer">Inquirer</option>
                </select>
                
                <select
                  value={creatorFilters.verified}
                  onChange={(e) => setCreatorFilters({ ...creatorFilters, verified: e.target.value })}
                  className={styles.select}
                >
                  <option value="">All Status</option>
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>
                
                <select
                  value={creatorFilters.hasInstagram}
                  onChange={(e) => setCreatorFilters({ ...creatorFilters, hasInstagram: e.target.value })}
                  className={styles.select}
                >
                  <option value="">Instagram Status</option>
                  <option value="true">Connected</option>
                  <option value="false">Not Connected</option>
                </select>
                
                <button
                  className={styles.btnRefresh}
                  onClick={() => fetchCreators()}
                  disabled={loadingCreators}
                >
                  {loadingCreators ? '🔄 Loading...' : '🔄 Refresh'}
                </button>
              </div>
              
              {/* Creators Table */}
              {loadingCreators ? (
                <div className={styles.loading}>
                  <div className={styles.spinner}></div>
                  <p>Loading creators...</p>
                </div>
              ) : creators.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>👤</div>
                  <h3>No Creators Found</h3>
                  <p>No creators match your current filters.</p>
                </div>
              ) : (
                <div className={styles.tableContainer}>
                  <table className={styles.creatorsTable}>
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Instagram</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creators.map((creator) => (
                        <tr key={creator._id}>
                          <td>
                            <div className={styles.creatorInfo}>
                              <div className={styles.creatorAvatar}>
                                {creator.username?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className={styles.creatorName}>{creator.username}</div>
                                {creator.fullName && (
                                  <div className={styles.creatorFullName}>{creator.fullName}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{creator.email}</td>
                          <td>
                            <span className={`${styles.badge} ${styles[creator.role]}`}>
                              {creator.role}
                            </span>
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${creator.isVerified ? styles.verified : styles.unverified}`}>
                              {creator.isVerified ? '✅ Verified' : '⏳ Pending'}
                            </span>
                          </td>
                          <td>
                            {creator.hasInstagram ? (
                              <span className={styles.igConnected}>🟢 Connected</span>
                            ) : (
                              <span className={styles.igNotConnected}>⚪ Not Connected</span>
                            )}
                          </td>
                          <td>{new Date(creator.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              className={styles.btnView}
                              onClick={() => window.open(`/creator/${creator.username}`, '_blank')}
                            >
                              👁️ View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Creator Stats */}
              <div className={styles.creatorStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total Creators:</span>
                  <span className={styles.statValue}>{creators.length}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Verified:</span>
                  <span className={styles.statValue}>
                    {creators.filter(c => c.isVerified).length}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Instagram Connected:</span>
                  <span className={styles.statValue}>
                    {creators.filter(c => c.hasInstagram).length}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Research Modal */}
          {showResearchModal && selectedBrand && (
            <div className={styles.modal} onClick={() => setShowResearchModal(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button 
                  className={styles.modalClose}
                  onClick={() => setShowResearchModal(false)}
                >
                  ✕
                </button>
                
                <h2>Research & Outreach Notes</h2>
                <h3>{selectedBrand.brand_name}</h3>
                
                <div className={styles.modalSection}>
                  <label>Internal Notes</label>
                  <textarea
                    value={researchData.internal_notes}
                    onChange={(e) => setResearchData({ ...researchData, internal_notes: e.target.value })}
                    placeholder="Add internal research notes, outreach attempts, contact info, etc."
                    rows={6}
                    className={styles.textarea}
                  />
                </div>
                
                <div className={styles.modalSection}>
                  <label>Internal Tags</label>
                  <div className={styles.tagSelector}>
                    {internalTags.map((tag) => (
                      <label key={tag} className={styles.tagCheckbox}>
                        <input
                          type="checkbox"
                          checked={researchData.internal_tags.includes(tag)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setResearchData({
                                ...researchData,
                                internal_tags: [...researchData.internal_tags, tag]
                              });
                            } else {
                              setResearchData({
                                ...researchData,
                                internal_tags: researchData.internal_tags.filter(t => t !== tag)
                              });
                            }
                          }}
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className={styles.modalSection}>
                  <label>Confidence Note</label>
                  <input
                    type="text"
                    value={researchData.confidence_note}
                    onChange={(e) => setResearchData({ ...researchData, confidence_note: e.target.value })}
                    placeholder="e.g., 'High engagement on recent posts', 'Limited budget signals'"
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.modalSection}>
                  <label>Sales Readiness</label>
                  <select
                    value={researchData.sales_readiness}
                    onChange={(e) => setResearchData({ ...researchData, sales_readiness: e.target.value })}
                    className={styles.select}
                  >
                    <option value="Ready">🟢 Ready</option>
                    <option value="Needs Research">🟡 Needs Research</option>
                    <option value="Low Priority">⚪ Low Priority</option>
                    <option value="Not Ready">🔴 Not Ready</option>
                  </select>
                </div>
                
                <div className={styles.modalActions}>
                  <button 
                    className={styles.btnSecondary}
                    onClick={() => setShowResearchModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className={styles.btnPrimary}
                    onClick={saveResearchData}
                  >
                    💾 Save Research Data
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Brand Detail Modal */}
          {showDetailModal && selectedBrand && (
            <div className={styles.modal} onClick={() => setShowDetailModal(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button 
                  className={styles.modalClose}
                  onClick={() => setShowDetailModal(false)}
                >
                  ✕
                </button>
                
                <h2>{selectedBrand.brand_name}</h2>
                
                {/* Data Freshness Alert */}
                <div className={styles.dataFreshnessAlert}>
                  <span className={styles.alertIcon}>ℹ️</span>
                  <div>
                    <strong>Campaign data snapshot:</strong> Last updated {selectedBrand.verification?.verified_at ? new Date(selectedBrand.verification.verified_at).toLocaleDateString() : 'Unknown'}. 
                    For real-time ad counts and current campaigns, view on Meta Ads Library.
                  </div>
                </div>
                
                {selectedBrand.verification?.meta_ads_library_url && (
                  <a
                    href={selectedBrand.verification.meta_ads_library_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnMetaLibraryFull}
                  >
                    🔗 View Real-Time Data on Meta Ads Library
                  </a>
                )}
                
                <div className={styles.modalSection}>
                  <h3>Intent Score</h3>
                  <div className={`${styles.intentBadgeLarge} ${styles[getIntentBadgeColor(selectedBrand.intent_score)]}`}>
                    {selectedBrand.intent_score}/10
                  </div>
                  <p>{selectedBrand.intent_category}</p>
                </div>
                
                <div className={styles.modalSection}>
                  <h3>Activity Status</h3>
                  <p><strong>Status:</strong> {selectedBrand.activity_status}</p>
                  <p><strong>Last Verified:</strong> {selectedBrand.last_verified 
                    ? new Date(selectedBrand.last_verified).toLocaleString()
                    : "Never"}</p>
                  <p><strong>Verification Status:</strong> {selectedBrand.verification_status}</p>
                </div>
                
                <div className={styles.modalSection}>
                  <h3>Classification</h3>
                  <p><strong>Industry:</strong> {selectedBrand.industry}</p>
                  <p><strong>Country:</strong> {selectedBrand.country}</p>
                  {selectedBrand.instagram_handle && (
                    <p><strong>Instagram:</strong> @{selectedBrand.instagram_handle}</p>
                  )}
                </div>
                
                <div className={styles.modalSection}>
                  <h3>Ad Campaign Intelligence</h3>
                  
                  {/* Alert when data looks incomplete */}
                  {(!selectedBrand.ad_formats || selectedBrand.ad_formats.length === 0 || 
                    !selectedBrand.cta_types || selectedBrand.cta_types.length === 0 ||
                    selectedBrand.active_ads === 0 || selectedBrand.active_ads === 1) && (
                    <div className={styles.updateDataAlert}>
                      <span className={styles.warningIcon}>⚠️</span>
                      <div>
                        <strong>Incomplete Campaign Data</strong>
                        <p>This brand has default/placeholder data. To update with accurate Meta Ad Library metrics:</p>
                        <button 
                          className={styles.btnUpdateData}
                          onClick={() => {
                            setShowDetailModal(false);
                            openAddBrandModal();
                            setAddBrandData({
                              ...addBrandData,
                              brand_name: selectedBrand.brand_name,
                              meta_page_id: selectedBrand.verification?.meta_page_id || "",
                              meta_page_name: selectedBrand.verification?.meta_page_name || "",
                            });
                          }}
                        >
                          ✏️ Update Campaign Data from Meta
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <p><strong>Active Ads:</strong> {selectedBrand.active_ads || 0}</p>
                  <p><strong>Ad Formats:</strong> {selectedBrand.ad_formats?.join(", ") || "N/A"}</p>
                  <p><strong>CTA Types:</strong> {selectedBrand.cta_types?.join(", ") || "N/A"}</p>
                  <p><strong>Consecutive Days:</strong> {selectedBrand.consecutive_active_days || 0}</p>
                </div>
                
                <div className={styles.modalSection}>
                  <h3>Internal Research</h3>
                  <p><strong>Sales Readiness:</strong> {selectedBrand.sales_readiness || "Needs Research"}</p>
                  {selectedBrand.internal_notes && (
                    <p><strong>Notes:</strong> {selectedBrand.internal_notes}</p>
                  )}
                  {selectedBrand.confidence_note && (
                    <p><strong>Confidence:</strong> {selectedBrand.confidence_note}</p>
                  )}
                  {selectedBrand.internal_tags && selectedBrand.internal_tags.length > 0 && (
                    <p><strong>Tags:</strong> {selectedBrand.internal_tags.join(", ")}</p>
                  )}
                </div>
                
                <div className={styles.modalSection}>
                  <h3>Spend Signals</h3>
                  <p><strong>Estimated Bucket:</strong> {selectedBrand.estimated_spend_bucket}</p>
                  <p><strong>Creative Count:</strong> {selectedBrand.creative_count_total}</p>
                  <p><strong>Growth Velocity:</strong> {selectedBrand.growth_velocity}</p>
                </div>
                
                <div className={styles.modalSection}>
                  <h3>Activity Timeline</h3>
                  <p><strong>First Seen:</strong> {new Date(selectedBrand.first_seen).toLocaleDateString()}</p>
                  <p><strong>Last Active:</strong> {new Date(selectedBrand.last_active).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Add Brand Modal */}
          {showAddBrandModal && (
            <div className={styles.modal} onClick={() => setShowAddBrandModal(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button 
                  className={styles.modalClose}
                  onClick={() => setShowAddBrandModal(false)}
                >
                  ✕
                </button>
                
                <h2>➕ Add Brand from Meta Ads Library</h2>
                <p className={styles.modalSubtitle}>
                  Discover a brand on Meta Ads Library? Add it to Aurax with complete verification.
                </p>
                
                <form onSubmit={handleAddBrand}>
                  <div className={styles.modalSection}>
                    <label>Brand Name *</label>
                    <input
                      type="text"
                      value={addBrandData.brand_name}
                      onChange={(e) => setAddBrandData({...addBrandData, brand_name: e.target.value})}
                      placeholder="e.g., Nykaa, CRED, Zomato"
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.modalSection}>
                    <label>Meta Page ID *</label>
                    <input
                      type="text"
                      value={addBrandData.meta_page_id}
                      onChange={(e) => setAddBrandData({...addBrandData, meta_page_id: e.target.value})}
                      placeholder="e.g., 147164935301978"
                      required
                      className={styles.input}
                    />
                    <small className={styles.helpText}>
                      Find this in the Meta Ad Library URL (view_all_page_id=...). We'll fetch live data from Meta Graph API.
                    </small>
                  </div>

                  <div className={styles.modalSection}>
                    <label>Meta Page Name</label>
                    <input
                      type="text"
                      value={addBrandData.meta_page_name}
                      onChange={(e) => setAddBrandData({...addBrandData, meta_page_name: e.target.value})}
                      placeholder="Official page name on Meta"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.modalSection}>
                    <label>Meta Ads Library URL (optional)</label>
                    <input
                      type="url"
                      value={addBrandData.meta_ads_library_url}
                      onChange={(e) => setAddBrandData({...addBrandData, meta_ads_library_url: e.target.value})}
                      placeholder="https://www.facebook.com/ads/library/?view_all_page_id=..."
                      className={styles.input}
                      disabled={isAutoFetched}
                    />
                    <small className={styles.helpText}>
                      Or we'll auto-generate from Page ID
                    </small>
                  </div>

                  {/* Auto Fetch Button */}
                  <div className={styles.autoFetchSection}>
                    <button
                      type="button"
                      onClick={handleAutoFetch}
                      disabled={isAutoFetching || !addBrandData.meta_page_id}
                      className={styles.btnAutoFetch}
                    >
                      {isAutoFetching ? (
                        <>🔄 Fetching from Meta Graph API...</>
                      ) : isAutoFetched ? (
                        <>✅ Data Fetched from Meta API - Edit if Needed</>
                      ) : (
                        <>🚀 Auto Fetch using Meta Graph API</>
                      )}
                    </button>
                    
                    {autoFetchError && (
                      <div className={styles.autoFetchError}>
                        ⚠️ {autoFetchError}
                      </div>
                    )}
                    
                    {isAutoFetched && (
                      <div className={styles.autoFetchSuccess}>
                        ✅ Campaign data auto-filled! Review and submit below.
                      </div>
                    )}
                  </div>

                  <div className={styles.modalSection}>
                    <label>Industry</label>
                    <select
                      value={addBrandData.industry}
                      onChange={(e) => setAddBrandData({...addBrandData, industry: e.target.value})}
                      className={styles.select}
                    >
                      <option value="">Select Industry</option>
                      {industries && industries.length > 0 ? industries.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      )) : null}
                    </select>
                  </div>

                  <div className={styles.modalSection}>
                    <label>Active Ads Count (optional) {isAutoFetched && <span className={styles.autoFilledBadge}>Auto-filled</span>}</label>
                    <input
                      type="number"
                      value={addBrandData.active_ads_count}
                      onChange={(e) => setAddBrandData({...addBrandData, active_ads_count: e.target.value})}
                      placeholder="Count from Meta Ad Library"
                      min="0"
                      className={styles.input}
                      readOnly={isAutoFetched}
                      title={isAutoFetched ? "Click 'Edit' to modify" : ""}
                    />
                  </div>

                  <div className={styles.modalSection}>
                    <label>Ad Formats (optional) {isAutoFetched && <span className={styles.autoFilledBadge}>Auto-filled</span>}</label>
                    <div className={styles.checkboxGroup}>
                      {['image', 'video', 'carousel', 'collection'].map(format => (
                        <label key={format} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={addBrandData.ad_formats && addBrandData.ad_formats.includes(format)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAddBrandData({
                                  ...addBrandData,
                                  ad_formats: [...(addBrandData.ad_formats || []), format]
                                });
                              } else {
                                setAddBrandData({
                                  ...addBrandData,
                                  ad_formats: (addBrandData.ad_formats || []).filter(f => f !== format)
                                });
                              }
                            }}
                          />
                          {format.charAt(0).toUpperCase() + format.slice(1)}
                        </label>
                      ))}
                    </div>
                    <small className={styles.helpText}>Check formats you see on Meta Ad Library</small>
                  </div>

                  <div className={styles.modalSection}>
                    <label>CTA Types (optional) {isAutoFetched && <span className={styles.autoFilledBadge}>Auto-filled</span>}</label>
                    <div className={styles.checkboxGroup}>
                      {['Shop Now', 'Learn More', 'Sign Up', 'Download', 'Book Now', 'Get Quote', 'Contact Us', 'Apply Now'].map(cta => (
                        <label key={cta} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={addBrandData.cta_types && addBrandData.cta_types.includes(cta)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAddBrandData({
                                  ...addBrandData,
                                  cta_types: [...(addBrandData.cta_types || []), cta]
                                });
                              } else {
                                setAddBrandData({
                                  ...addBrandData,
                                  cta_types: (addBrandData.cta_types || []).filter(c => c !== cta)
                                });
                              }
                            }}
                          />
                          {cta}
                        </label>
                      ))}
                    </div>
                    <small className={styles.helpText}>Check CTAs you observe in their ads</small>
                  </div>

                  <div className={styles.modalSection}>
                    <label>Consecutive Active Days (optional)</label>
                    <input
                      type="number"
                      value={addBrandData.consecutive_active_days}
                      onChange={(e) => setAddBrandData({...addBrandData, consecutive_active_days: e.target.value})}
                      placeholder="How many days running continuously?"
                      min="0"
                      className={styles.input}
                    />
                    <small className={styles.helpText}>Check 'Started running on' date on Meta</small>
                  </div>

                  <div className={styles.modalActions}>
                    <button 
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => setShowAddBrandModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className={styles.btnPrimary}
                    >
                      ✅ Add Brand
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandIntelligenceEnhanced;
