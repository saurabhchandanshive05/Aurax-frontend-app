import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiEndpoint } from '../utils/getApiUrl';
import './MinimalWelcome.css';

const MinimalWelcome = () => {
  const navigate = useNavigate();
  const { refreshUser, currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    creatorType: '',
    instagramUsername: '',
    location: ''
  });
  const [errors, setErrors] = useState({});

  const creatorTypes = [
    'Creator',
    'Influencer',
    'Artist',
    'Actor',
    'Musician',
    'Other'
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log('🎯 MinimalWelcome mounted, currentUser:', currentUser);
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      console.log('🔍 Checking profile status in MinimalWelcome...');
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('🔑 Token found:', !!token);
      
      if (!token) {
        console.log('❌ No token, redirecting to login');
        navigate('/creator/login');
        return;
      }

      const response = await fetch(getApiEndpoint('/api/me'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ MinimalWelcome got API response:', responseData);
        // Handle nested user object (API returns {success: true, user: {...}})
        const data = responseData.user || responseData;
        console.log('📊 Extracted user data:', {
          minimalProfileCompleted: data.minimalProfileCompleted,
          fullName: data.fullName,
          creatorType: data.creatorType
        });
        
        // If minimal profile is already completed, redirect to dashboard
        if (data.minimalProfileCompleted) {
          console.log('✅ Profile already completed, redirecting to dashboard');
          navigate('/creator/dashboard');
          return;
        }

        console.log('⚠️ Profile not completed, showing welcome form');

        // Pre-fill form with any existing data
        setFormData({
          displayName: data.fullName || data.username || '',
          creatorType: data.creatorType || '',
          instagramUsername: data.instagram?.username || '',
          location: data.location || ''
        });
      } else if (response.status === 401) {
        navigate('/creator/login');
        return;
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.creatorType) {
      newErrors.creatorType = 'Creator type is required';
    }

    if (!formData.instagramUsername.trim()) {
      newErrors.instagramUsername = 'Instagram username is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      console.log('📤 Sending minimal profile data:', {
        fullName: formData.displayName,
        creatorType: formData.creatorType,
        instagramUsername: formData.instagramUsername.replace('@', ''),
        location: formData.location
      });

      const response = await fetch(getApiEndpoint('/api/creator/minimal-profile'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: formData.displayName,
          creatorType: formData.creatorType,
          instagramUsername: formData.instagramUsername.replace('@', ''),
          location: formData.location
        })
      });

      console.log('📥 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile saved successfully:', data);
        console.log('🔄 Calling refreshUser to update context...');
        
        // Refresh user data in AuthContext
        await refreshUser();
        
        console.log('✅ User refreshed, navigating to dashboard...');
        // Redirect to dashboard
        navigate('/creator/dashboard');
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        alert(errorData.message || 'Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('❌ Network/Fetch Error:', error);
      alert('Failed to connect to server. Please check if the backend is running.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="minimal-welcome-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="minimal-welcome-container">
      <div className="minimal-welcome-content">
        <div className="welcome-logo">
          <div className="logo-circle">🎨</div>
        </div>

        <div className="welcome-text">
          <h1>Welcome to AuraX</h1>
          <p className="subtitle">Let's set up your creator profile</p>
          <p className="description">
            This is a one-time setup to unlock your dashboard
          </p>
        </div>

        <form className="minimal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Display Name <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
              placeholder="How you want to be known"
              className={errors.displayName ? 'error' : ''}
            />
            {errors.displayName && (
              <span className="error-message">{errors.displayName}</span>
            )}
          </div>

          <div className="form-group">
            <label>
              Creator Type <span className="required">*</span>
            </label>
            <select
              value={formData.creatorType}
              onChange={(e) => setFormData({...formData, creatorType: e.target.value})}
              className={errors.creatorType ? 'error' : ''}
            >
              <option value="">Select your type</option>
              {creatorTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.creatorType && (
              <span className="error-message">{errors.creatorType}</span>
            )}
          </div>

          <div className="form-group">
            <label>
              Instagram Username <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.instagramUsername}
              onChange={(e) => {
                // Remove @ if user types it
                const value = e.target.value.replace('@', '');
                setFormData({...formData, instagramUsername: value});
              }}
              placeholder="your_username"
              className={errors.instagramUsername ? 'error' : ''}
            />
            {errors.instagramUsername && (
              <span className="error-message">{errors.instagramUsername}</span>
            )}
            <span className="field-hint">Enter without @ symbol</span>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="City, Country (optional)"
            />
          </div>

          <button 
            type="submit" 
            className="btn-continue"
            disabled={saving}
          >
            {saving ? 'Setting up...' : 'Continue to Dashboard →'}
          </button>

          <p className="form-note">
            <strong>Note:</strong> You can connect Instagram and create your public page later from the dashboard
          </p>
        </form>
      </div>
    </div>
  );
};

export default MinimalWelcome;
