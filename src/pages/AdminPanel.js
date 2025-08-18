import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLocalItem, setLocalItem } from '../components/common/StorageUtils';

const AdminPanel = () => {
  const [creators, setCreators] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState('creators');

  useEffect(() => {
    setCreators(getLocalItem('creators') || []);
    setCampaigns(getLocalItem('campaigns') || []);
  }, []);

  const deleteCreator = (id) => {
    if (window.confirm('Are you sure you want to delete this creator?')) {
      const updated = creators.filter(c => c.id !== id);
      setCreators(updated);
      setLocalItem('creators', updated);
    }
  };

  const deleteCampaign = (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      const updated = campaigns.filter(c => c.id !== id);
      setCampaigns(updated);
      setLocalItem('campaigns', updated);
    }
  };

  return (
    <div className="admin-panel">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'creators' ? 'active' : ''}
          onClick={() => setActiveTab('creators')}
        >
          Manage Creators ({creators.length})
        </button>
        <button 
          className={activeTab === 'campaigns' ? 'active' : ''}
          onClick={() => setActiveTab('campaigns')}
        >
          Manage Campaigns ({campaigns.length})
        </button>
      </div>
      
      {activeTab === 'creators' ? (
        <div className="creators-management">
          <div className="table-header">
            <h2>Creators</h2>
            <Link to="/add-talent" className="btn">+ Add New Creator</Link>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Niche</th>
                <th>Email</th>
                <th>Engagement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {creators.map(creator => (
                <tr key={creator.id}>
                  <td>{creator.name}</td>
                  <td>{creator.niche}</td>
                  <td>{creator.email}</td>
                  <td>{creator.engagementRate}%</td>
                  <td className="actions">
                    <Link to={`/creator/${creator.id}`} className="btn small">View</Link>
                    <Link to={`/edit-talent/${creator.id}`} className="btn small">Edit</Link>
                    <button 
                      className="btn small danger"
                      onClick={() => deleteCreator(creator.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {creators.length === 0 && (
            <div className="empty-state">
              <p>No creators found. Add your first creator!</p>
              <Link to="/add-talent" className="btn">Add Creator</Link>
            </div>
          )}
        </div>
      ) : (
        <div className="campaigns-management">
          <div className="table-header">
            <h2>Campaigns</h2>
            <Link to="/campaigns" className="btn">+ Create Campaign</Link>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Brand</th>
                <th>Status</th>
                <th>Creators</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(campaign => (
                <tr key={campaign.id}>
                  <td>{campaign.name}</td>
                  <td>{campaign.brand}</td>
                  <td>{campaign.status}</td>
                  <td>{campaign.creators.length}</td>
                  <td className="actions">
                    <Link to={`/campaign/${campaign.id}`} className="btn small">View</Link>
                    <button 
                      className="btn small danger"
                      onClick={() => deleteCampaign(campaign.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {campaigns.length === 0 && (
            <div className="empty-state">
              <p>No campaigns found. Create your first campaign!</p>
              <Link to="/campaigns" className="btn">Create Campaign</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;