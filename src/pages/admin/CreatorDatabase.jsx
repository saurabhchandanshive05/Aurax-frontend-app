import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateCreatorModal from '../../components/admin/CreateCreatorModal';
import './CreatorDatabase.css';

const CreatorDatabase = () => {
  const navigate = useNavigate();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minFollowers: '',
    maxFollowers: '',
    city: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchCreators();
    fetchStats();
  }, [pagination.page, searchTerm, filters]);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: filters.status || 'all',
        hasInstagram: filters.hasInstagram || 'all',
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'desc',
        minFollowers: filters.minFollowers || 0,
        maxFollowers: filters.maxFollowers || 999999999
      };

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/api/admin/creators`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params
        }
      );

      if (response.data.success) {
        setCreators(response.data.data.creators);
        setPagination({
          page: response.data.data.pagination.page,
          limit: 20,
          total: response.data.data.pagination.total,
          pages: response.data.data.pagination.pages
        });
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
      if (error.response?.status === 403) {
        alert('Admin access required');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/api/admin/creators/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatFollowers = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count;
  };

  const handleViewProfile = (creatorId) => {
    navigate(`/admin/brand-intelligence/creators/${creatorId}`);
  };

  const handleQuickChat = (creator) => {
    const message = `Hi ${creator.name}, I'm reaching out from Aurax regarding a potential collaboration opportunity.`;
    const phoneNumber = creator.socials?.instagram ? '' : ''; // Add WhatsApp number if available
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCreators();
  };

  const handleCreatorCreated = (newCreator) => {
    // Refresh the creator list
    fetchCreators();
    fetchStats();
  };

  return (
    <div className="creator-database">
      {/* Header */}
      <div className="database-header">
        <div className="header-content">
          <h1 className="database-title">List of Top Mega Influencers in Aurax 2026</h1>
          <p className="database-subtitle">
            Discover the top mega influencers in India. Find out who's leading the social media scene 
            with the largest followings and the biggest impact.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons" style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            className="create-creator-btn"
            style={{
              padding: '14px 28px',
              background: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#6d28d9';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 18px rgba(124, 58, 237, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#7c3aed';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 14px rgba(124, 58, 237, 0.3)';
            }}
          >
            <span style={{ fontSize: '22px' }}>➕</span>
            Create New Creator
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-value">{stats.totalCreators?.toLocaleString()}</div>
              <div className="stat-label">Total Creators</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.verifiedCreators?.toLocaleString()}</div>
              <div className="stat-label">Verified</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatFollowers(stats.totalFollowers)}</div>
              <div className="stat-label">Total Reach</div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="search-filter-section">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Search by name, username, city, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍 Search
          </button>
        </form>

        <div className="filter-chips">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="Beauty">Beauty</option>
            <option value="Fashion">Fashion</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Business">Business & Startups</option>
            <option value="Tech">Tech</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Fitness">Fitness</option>
          </select>

          <select
            value={filters.minFollowers}
            onChange={(e) => setFilters({ ...filters, minFollowers: e.target.value })}
            className="filter-select"
          >
            <option value="">Min Followers</option>
            <option value="10000">10K+</option>
            <option value="50000">50K+</option>
            <option value="100000">100K+</option>
            <option value="500000">500K+</option>
            <option value="1000000">1M+</option>
          </select>

          <button 
            onClick={() => {
              setFilters({ category: '', minFollowers: '', maxFollowers: '', city: '' });
              setSearchTerm('');
            }}
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Creators List */}
      <div className="creators-list">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading creators...</p>
          </div>
        ) : creators.length === 0 ? (
          <div className="empty-state">
            <p>No creators found matching your criteria</p>
          </div>
        ) : (
          creators.map((creator) => (
            <div key={creator._id} className="creator-card">
              <div className="creator-avatar">
                {creator.avatar ? (
                  <img src={creator.avatar} alt={creator.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {creator.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="creator-info">
                <div className="creator-header">
                  <h3 className="creator-name">
                    {creator.name}
                    {creator.badge === 'verified' && (
                      <span className="verified-badge" title="Verified">✓</span>
                    )}
                  </h3>
                  <p className="creator-username">
                    {creator.socials?.instagram && `@${creator.socials.instagram}`}
                  </p>
                </div>

                <div className="creator-meta">
                  {creator.location && (
                    <span className="meta-item">
                      📍 {creator.location}
                    </span>
                  )}
                </div>

                <div className="creator-tags">
                  {creator.category && (
                    <span className="tag category-tag">{creator.category}</span>
                  )}
                  {creator.tags?.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>

                <div className="creator-social-stats">
                  {creator.socials?.instagram && (
                    <div className="social-stat">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" 
                        alt="Instagram" 
                        className="social-icon"
                      />
                      <span>{formatFollowers(creator.followers)}</span>
                    </div>
                  )}
                  {creator.engagement > 0 && (
                    <div className="social-stat">
                      <span>📊 {creator.engagement}% ER</span>
                    </div>
                  )}
                  {creator.campaigns > 0 && (
                    <div className="social-stat">
                      <span>🎯 {creator.campaigns} campaigns</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="creator-actions">
                <button
                  onClick={() => handleViewProfile(creator._id)}
                  className="action-btn primary-btn"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleQuickChat(creator)}
                  className="action-btn secondary-btn"
                >
                  💬 Quick Chat
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <div className="pagination-info">
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </div>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.pages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}

      {/* Create Creator Modal */}
      <CreateCreatorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreatorCreated}
      />
    </div>
  );
};

export default CreatorDatabase;
