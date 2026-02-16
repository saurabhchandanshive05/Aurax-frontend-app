import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import AdminNav from "../../components/admin/AdminNav";
import CreatorDatabase from "./CreatorDatabase";
import CreatorContactList from "./CreatorContactList";
import styles from "./BrandIntelligence.module.css";

/**
 * Brand Intelligence Dashboard
 * 
 * Admin-only interface for high-intent brand discovery
 * 
 * Access: sourabh.chandanshive@gmail.com
 */

const BrandIntelligenceDashboard = () => {
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
  
  // Filter states
  const [filters, setFilters] = useState({
    intent: "high",
    industry: "",
    spend_bucket: "",
    is_new: false,
    is_scaling: false,
    page: 1,
    limit: 20,
  });
  
  // UI states
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";
  
  // Fetch initial data
  useEffect(() => {
    fetchDashboardData();
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
      setError(null); // Clear any previous errors
      const token = localStorage.getItem("token");
      
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      
      const [statsRes, trendingRes, industriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/brand-intelligence/stats`, { headers }).catch(err => {
          console.error("Stats fetch failed:", err);
          return { data: { success: true, data: {
            total_brands: 0,
            high_intent_brands: 0,
            active_this_week: 0,
            new_advertisers: 0,
            scaling_brands: 0,
            top_industries: []
          }}};
        }),
        axios.get(`${API_URL}/api/brand-intelligence/brands/trending`, { headers }).catch(err => {
          console.error("Trending brands fetch failed:", err);
          return { data: { success: true, data: [] }};
        }),
        axios.get(`${API_URL}/api/brand-intelligence/industries`, { headers }).catch(err => {
          console.error("Industries fetch failed:", err);
          return { data: { success: true, data: [] }};
        }),
      ]);
      
      setStats(statsRes.data.data || {
        total_brands: 0,
        high_intent_brands: 0,
        active_this_week: 0,
        new_advertisers: 0,
        scaling_brands: 0,
        top_industries: []
      });
      setTrendingBrands(trendingRes.data.data || []);
      setIndustries(industriesRes.data.data || []);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard");
      setLoading(false);
    }
  };
  
  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const params = new URLSearchParams();
      if (filters.intent) params.append("intent", filters.intent);
      if (filters.industry) params.append("industry", filters.industry);
      if (filters.spend_bucket) params.append("spend_bucket", filters.spend_bucket);
      if (filters.is_new) params.append("is_new", "true");
      if (filters.is_scaling) params.append("is_scaling", "true");
      params.append("page", filters.page);
      params.append("limit", filters.limit);
      
      const response = await axios.get(
        `${API_URL}/api/brand-intelligence/brands?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setBrands(response.data.data);
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
  
  const getIntentBadgeColor = (score) => {
    if (score >= 8) return "high";
    if (score >= 5) return "mid";
    return "low";
  };
  
  const getSpendBadgeColor = (bucket) => {
    const colors = {
      very_high: "purple",
      high: "blue",
      medium: "green",
      low: "gray",
    };
    return colors[bucket] || "gray";
  };
  
  if (loading || isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <AdminNav />
        <div className={styles.mainContent}>
          <div className={styles.container}>
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading Brand Intelligence...</p>
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
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>🧠 Brand Intelligence</h1>
          <p>High-Intent Instagram Advertisers · India</p>
        </div>
        <div className={styles.headerActions}>
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
          🏢 All Brands
        </button>
        <button
          className={activeTab === "trending" ? styles.tabActive : ""}
          onClick={() => setActiveTab("trending")}
        >
          🔥 Trending
        </button>
        <button
          className={activeTab === "creators" ? styles.tabActive : ""}
          onClick={() => setActiveTab("creators")}
        >
          👥 Creator Database
        </button>
        <button
          className={activeTab === "contacts" ? styles.tabActive : ""}
          onClick={() => setActiveTab("contacts")}
        >
          📧 Contact List
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
          
          {/* Trending Brands Preview */}
          <div className={styles.section}>
            <h2>🔥 Trending Brands</h2>
            <div className={styles.brandList}>
              {trendingBrands.slice(0, 5).map((brand) => (
                <div 
                  key={brand.brand_id} 
                  className={styles.brandCard}
                  onClick={() => viewBrandDetails(brand.brand_id)}
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
                    <span>{brand.active_ads} ads</span>
                    {brand.is_new_advertiser && <span className={styles.newBadge}>NEW</span>}
                    {brand.is_scaling && <span className={styles.scalingBadge}>📈 SCALING</span>}
                  </div>
                </div>
              ))}
            </div>
            <button 
              className={styles.viewAllBtn}
              onClick={() => setActiveTab("trending")}
            >
              View All Trending →
            </button>
          </div>
        </div>
      )}
      
      {/* Brands Tab */}
      {activeTab === "brands" && (
        <div className={styles.brandsTab}>
          {/* Filters */}
          <div className={styles.filters}>
            <select
              value={filters.intent}
              onChange={(e) => setFilters({ ...filters, intent: e.target.value, page: 1 })}
            >
              <option value="">All Intent Levels</option>
              <option value="high">High Intent (8-10)</option>
              <option value="mid">Mid Intent (5-7)</option>
              <option value="low">Low Intent (0-4)</option>
            </select>
            
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
              value={filters.spend_bucket}
              onChange={(e) => setFilters({ ...filters, spend_bucket: e.target.value, page: 1 })}
            >
              <option value="">All Spend Levels</option>
              <option value="very_high">Very High</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
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
          
          {/* Brand List */}
          <div className={styles.brandList}>
            {brands.map((brand) => (
              <div 
                key={brand.brand_id} 
                className={styles.brandCard}
                onClick={() => viewBrandDetails(brand.brand_id)}
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
                  <span>•</span>
                  <span className={`${styles.spendBadge} ${styles[getSpendBadgeColor(brand.estimated_spend_bucket)]}`}>
                    {brand.estimated_spend_bucket}
                  </span>
                </div>
                
                <div className={styles.brandTags}>
                  {brand.is_new_advertiser && <span className={styles.newBadge}>🆕 NEW</span>}
                  {brand.is_scaling && <span className={styles.scalingBadge}>📈 SCALING</span>}
                  {brand.cta_types.slice(0, 3).map((cta) => (
                    <span key={cta} className={styles.ctaBadge}>
                      {cta.replace("_", " ")}
                    </span>
                  ))}
                </div>
                
                <div className={styles.brandFooter}>
                  <span>Last active: {new Date(brand.last_active).toLocaleDateString()}</span>
                  {brand.consecutive_active_days > 0 && (
                    <span>{brand.consecutive_active_days} days streak</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {brands.length === 0 && (
            <div className={styles.emptyState}>
              <p>No brands found with selected filters</p>
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
                  onClick={() => viewBrandDetails(brand.brand_id)}
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
                </div>
              ))}
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
            
            <div className={styles.modalSection}>
              <h3>Intent Score</h3>
              <div className={`${styles.intentBadgeLarge} ${styles[getIntentBadgeColor(selectedBrand.intent_score)]}`}>
                {selectedBrand.intent_score}/10
              </div>
              <p>{selectedBrand.intent_category}</p>
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
              <p><strong>Active Ads:</strong> {selectedBrand.active_ads}</p>
              <p><strong>Ad Formats:</strong> {selectedBrand.ad_formats.join(", ")}</p>
              <p><strong>CTA Types:</strong> {selectedBrand.cta_types.join(", ")}</p>
              <p><strong>Consecutive Days:</strong> {selectedBrand.consecutive_active_days}</p>
            </div>
            
            <div className={styles.modalSection}>
              <h3>Spend Signals</h3>
              <p><strong>Estimated Bucket:</strong> {selectedBrand.estimated_spend_bucket}</p>
              <p><strong>Creative Count:</strong> {selectedBrand.creative_count_total}</p>
              <p><strong>Growth Velocity:</strong> {selectedBrand.growth_velocity}</p>
            </div>
            
            <div className={styles.modalSection}>
              <h3>Landing Page Intelligence</h3>
              <p><strong>Type:</strong> {selectedBrand.landing_page_type}</p>
              <p><strong>Funnel:</strong> {selectedBrand.funnel_maturity}</p>
              {selectedBrand.landing_page_url && (
                <p>
                  <strong>URL:</strong>{" "}
                  <a href={selectedBrand.landing_page_url} target="_blank" rel="noopener noreferrer">
                    {selectedBrand.landing_page_url}
                  </a>
                </p>
              )}
            </div>
            
            <div className={styles.modalSection}>
              <h3>Activity Timeline</h3>
              <p><strong>First Seen:</strong> {new Date(selectedBrand.first_seen).toLocaleDateString()}</p>
              <p><strong>Last Active:</strong> {new Date(selectedBrand.last_active).toLocaleDateString()}</p>
            </div>
            
            {selectedBrand.creator_collaborations > 0 && (
              <div className={styles.modalSection}>
                <h3>Creator Partnerships</h3>
                <p><strong>Collaborations:</strong> {selectedBrand.creator_collaborations}</p>
                {selectedBrand.creator_handles.length > 0 && (
                  <p><strong>Creators:</strong> {selectedBrand.creator_handles.map(h => `@${h}`).join(", ")}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Creator Database Tab */}
      {activeTab === "creators" && (
        <div className={styles.creatorDatabaseSection}>
          <CreatorDatabase key="creator-db-tab" />
        </div>
      )}
      
      {/* Contact List Tab */}
      {activeTab === "contacts" && (
        <div className={styles.contactListSection}>
          <CreatorContactList key="contact-list-tab" />
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default BrandIntelligenceDashboard;
