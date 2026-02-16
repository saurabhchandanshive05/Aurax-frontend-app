import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreatorContactList.css';

const CreatorContactList = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [selectedCreators, setSelectedCreators] = useState(new Set());

  useEffect(() => {
    fetchCreatorContacts();
  }, []);

  const fetchCreatorContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/api/admin/creators`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 1000, sortBy: 'name', sortOrder: 'asc' }
        }
      );

      if (response.data.success) {
        setCreators(response.data.data.creators);
      }
    } catch (error) {
      console.error('Error fetching creator contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCreators = creators.filter(creator => {
    const searchLower = searchTerm.toLowerCase();
    return (
      creator.name?.toLowerCase().includes(searchLower) ||
      creator.email?.toLowerCase().includes(searchLower) ||
      creator.socials?.instagram?.toLowerCase().includes(searchLower)
    );
  });

  const copyAllToClipboard = () => {
    const contactList = filteredCreators
      .filter(c => c.email)
      .map(c => `${c.name} <${c.email}>`)
      .join(', ');
    
    navigator.clipboard.writeText(contactList).then(() => {
      setCopyStatus('✅ Copied to clipboard!');
      setTimeout(() => setCopyStatus(''), 3000);
    });
  };

  const copyAsCSV = () => {
    const csvHeader = 'Name,Handle,Email,Followers,Category\n';
    const csvData = filteredCreators
      .filter(c => c.email)
      .map(c => 
        `"${c.name}","${c.socials?.instagram || ''}","${c.email}","${c.followers || 0}","${c.category || ''}"`
      )
      .join('\n');
    
    const csv = csvHeader + csvData;
    navigator.clipboard.writeText(csv).then(() => {
      setCopyStatus('✅ CSV copied to clipboard!');
      setTimeout(() => setCopyStatus(''), 3000);
    });
  };

  const downloadCSV = () => {
    const csvHeader = 'Name,Handle,Email,Followers,Category\n';
    const csvData = filteredCreators
      .filter(c => c.email)
      .map(c => 
        `"${c.name}","${c.socials?.instagram || ''}","${c.email}","${c.followers || 0}","${c.category || ''}"`
      )
      .join('\n');
    
    const csv = csvHeader + csvData;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurax-creator-contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleSelectCreator = (creatorId) => {
    const newSelected = new Set(selectedCreators);
    if (newSelected.has(creatorId)) {
      newSelected.delete(creatorId);
    } else {
      newSelected.add(creatorId);
    }
    setSelectedCreators(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedCreators.size === filteredCreators.length) {
      setSelectedCreators(new Set());
    } else {
      setSelectedCreators(new Set(filteredCreators.map(c => c._id)));
    }
  };

  const copySelected = () => {
    const selectedEmails = filteredCreators
      .filter(c => selectedCreators.has(c._id) && c.email)
      .map(c => `${c.name} <${c.email}>`)
      .join(', ');
    
    if (selectedEmails) {
      navigator.clipboard.writeText(selectedEmails).then(() => {
        setCopyStatus(`✅ Copied ${selectedCreators.size} contacts!`);
        setTimeout(() => setCopyStatus(''), 3000);
      });
    }
  };

  const formatFollowers = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (loading) {
    return (
      <div className="contact-list-loading">
        <div className="spinner"></div>
        <p>Loading creator contacts...</p>
      </div>
    );
  }

  const creatorsWithEmail = filteredCreators.filter(c => c.email);
  const creatorsWithoutEmail = filteredCreators.filter(c => !c.email);

  return (
    <div className="contact-list-container">
      {/* Header */}
      <div className="contact-list-header">
        <div className="header-text">
          <h2>📧 Creator Contact List</h2>
          <p>
            {creatorsWithEmail.length} creators with email addresses
            {creatorsWithoutEmail.length > 0 && ` · ${creatorsWithoutEmail.length} without email`}
          </p>
        </div>

        <div className="header-actions">
          {copyStatus && <span className="copy-status">{copyStatus}</span>}
          
          {selectedCreators.size > 0 && (
            <button onClick={copySelected} className="action-btn primary">
              📋 Copy Selected ({selectedCreators.size})
            </button>
          )}
          
          <button onClick={copyAllToClipboard} className="action-btn secondary">
            📋 Copy All Emails
          </button>
          
          <button onClick={copyAsCSV} className="action-btn secondary">
            📊 Copy as CSV
          </button>
          
          <button onClick={downloadCSV} className="action-btn primary">
            ⬇️ Download CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="contact-list-search">
        <input
          type="text"
          placeholder="Search by name, email, or handle..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="search-count">
          {filteredCreators.length} of {creators.length} creators
        </span>
      </div>

      {/* Contacts Table */}
      <div className="contacts-table-wrapper">
        <table className="contacts-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedCreators.size === filteredCreators.length && filteredCreators.length > 0}
                  onChange={toggleSelectAll}
                  className="checkbox"
                />
              </th>
              <th>Creator Name</th>
              <th>Handle</th>
              <th>Email Address</th>
              <th>Followers</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {creatorsWithEmail.map((creator) => (
              <tr key={creator._id} className={selectedCreators.has(creator._id) ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedCreators.has(creator._id)}
                    onChange={() => toggleSelectCreator(creator._id)}
                    className="checkbox"
                  />
                </td>
                <td className="creator-name-cell">
                  <div className="creator-name-wrapper">
                    {creator.avatar ? (
                      <img src={creator.avatar} alt={creator.name} className="creator-avatar-small" />
                    ) : (
                      <div className="avatar-placeholder-small">
                        {creator.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <span className="creator-name-text">
                      {creator.name}
                      {creator.badge === 'verified' && (
                        <span className="verified-badge-small" title="Verified">✓</span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="handle-cell">
                  {creator.socials?.instagram ? (
                    <a
                      href={`https://instagram.com/${creator.socials.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="instagram-handle"
                    >
                      @{creator.socials.instagram}
                    </a>
                  ) : (
                    <span className="no-handle">—</span>
                  )}
                </td>
                <td className="email-cell">
                  <a href={`mailto:${creator.email}`} className="email-link">
                    {creator.email}
                  </a>
                </td>
                <td className="followers-cell">
                  {formatFollowers(creator.followers)}
                </td>
                <td className="category-cell">
                  {creator.category ? (
                    <span className="category-badge">{creator.category}</span>
                  ) : (
                    <span className="no-category">—</span>
                  )}
                </td>
                <td className="actions-cell">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(creator.email);
                      setCopyStatus(`✅ Copied ${creator.name}'s email!`);
                      setTimeout(() => setCopyStatus(''), 2000);
                    }}
                    className="copy-btn-small"
                    title="Copy email"
                  >
                    📋
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCreators.length === 0 && (
          <div className="empty-state">
            <p>No creators found matching your search.</p>
          </div>
        )}

        {creatorsWithEmail.length === 0 && filteredCreators.length > 0 && (
          <div className="empty-state">
            <p>No creators have email addresses on record.</p>
          </div>
        )}
      </div>

      {/* Creators without Email (collapsed by default) */}
      {creatorsWithoutEmail.length > 0 && (
        <details className="no-email-section">
          <summary>
            ⚠️ {creatorsWithoutEmail.length} Creators Without Email
          </summary>
          <div className="no-email-list">
            {creatorsWithoutEmail.map((creator) => (
              <div key={creator._id} className="no-email-item">
                <span className="creator-name">{creator.name}</span>
                {creator.socials?.instagram && (
                  <span className="creator-handle">@{creator.socials.instagram}</span>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default CreatorContactList;
