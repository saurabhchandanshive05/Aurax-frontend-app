import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RoleSelectionModal.css';

const RoleSelectionModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRoleSelection = async (action) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/api/auth/select-role`,
        { action },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Close modal
        if (onClose) onClose();

        // Handle redirection
        if (response.data.requiresForm) {
          // Show inquiry form
          navigate(response.data.redirectTo);
        } else {
          // Direct navigation
          navigate(response.data.redirectTo);
        }
      }
    } catch (err) {
      console.error('Role selection error:', err);
      setError(err.response?.data?.message || 'Failed to select role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-modal-overlay">
      <div className="role-modal-container">
        <div className="role-modal-header">
          <h2>What do you want to do today?</h2>
          <p className="role-modal-subtitle">Choose how you want to use AURAX</p>
        </div>

        {error && (
          <div className="role-error-message">
            {error}
          </div>
        )}

        <div className="role-options-grid">
          {/* Option 1: Connect with Creators */}
          <button
            className="role-option-card"
            onClick={() => handleRoleSelection('connect')}
            disabled={loading}
          >
            <div className="role-icon">💬</div>
            <h3>Connect with Creators</h3>
            <p>Browse creators, chat, and schedule calls</p>
            <div className="role-card-footer">
              <span className="role-badge">Requires Verification</span>
            </div>
          </button>

          {/* Option 2: Post a Campaign */}
          <button
            className="role-option-card"
            onClick={() => handleRoleSelection('post-campaign')}
            disabled={loading}
          >
            <div className="role-icon">📢</div>
            <h3>Post a Campaign</h3>
            <p>Publish your campaign to LIVE board</p>
            <div className="role-card-footer">
              <span className="role-badge">Requires Verification</span>
            </div>
          </button>

          {/* Option 3: Join as Creator */}
          <button
            className="role-option-card"
            onClick={() => handleRoleSelection('join-creator')}
            disabled={loading}
          >
            <div className="role-icon">⭐</div>
            <h3>Join as Creator</h3>
            <p>Set up your profile and get discovered</p>
            <div className="role-card-footer">
              <span className="role-badge creator">Creator Path</span>
            </div>
          </button>
        </div>

        {loading && (
          <div className="role-loading">
            <div className="spinner"></div>
            <span>Processing your selection...</span>
          </div>
        )}

        <button className="role-skip-btn" onClick={onClose} disabled={loading}>
          I'll decide later
        </button>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
