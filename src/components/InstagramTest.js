import React, { useState } from 'react';

const InstagramTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testInstagramConnection = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      // Test 1: Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in first.');
      }

      // Test 2: Test Instagram profile endpoint
      console.log('🧪 Testing Instagram profile endpoint...');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/instagram/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setTestResult({
          success: true,
          message: 'Instagram connected successfully!',
          profile: data.profile
        });
      } else {
        // Expected error if not connected
        setTestResult({
          success: false,
          message: data.message || 'Instagram not connected yet',
          needsConnection: data.message?.includes('not connected'),
          error: data.message
        });
      }
    } catch (error) {
      console.error('Instagram test error:', error);
      setTestResult({
        success: false,
        message: error.message,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectInstagram = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in first');
        return;
      }

      console.log('🚀 Getting Instagram auth URL...');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/instagram/auth-url`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success && data.authUrl) {
        console.log('🔗 Redirecting to Instagram OAuth...');
        window.location.href = data.authUrl;
      } else {
        alert('Failed to get Instagram auth URL: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Connect Instagram error:', error);
      alert('Failed to connect Instagram: ' + error.message);
    }
  };

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      margin: '20px',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#111827' }}>
        🧪 Instagram Integration Test
      </h3>
      
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={testInstagramConnection}
          disabled={loading}
          style={{
            padding: '12px 20px',
            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '500'
          }}
        >
          {loading ? '🔄 Testing...' : '🧪 Test Connection'}
        </button>

        <button
          onClick={handleConnectInstagram}
          style={{
            padding: '12px 20px',
            backgroundColor: '#e1306c',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          📱 Connect Instagram
        </button>
      </div>

      {testResult && (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: testResult.success ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${testResult.success ? '#bbf7d0' : '#fecaca'}`,
          color: testResult.success ? '#166534' : '#991b1b'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>
            {testResult.success ? '✅ Success' : '❌ Error'}
          </div>
          <div style={{ marginBottom: '8px' }}>
            {testResult.message}
          </div>
          
          {testResult.profile && (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '12px',
              borderRadius: '6px',
              marginTop: '8px'
            }}>
              <strong>Connected Account:</strong><br />
              @{testResult.profile.username} ({testResult.profile.accountType})
            </div>
          )}
          
          {testResult.needsConnection && (
            <div style={{
              marginTop: '12px',
              padding: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '6px',
              color: '#1e40af'
            }}>
              💡 This is expected if you haven't connected Instagram yet. Click "Connect Instagram" above!
            </div>
          )}
        </div>
      )}

      <div style={{
        marginTop: '16px',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        <strong>How to use:</strong><br />
        1. Make sure you're logged in to AURAX<br />
        2. Click "Test Connection" - should show "not connected" error (this is normal)<br />
        3. Click "Connect Instagram" to start OAuth flow<br />
        4. After connecting, test again to see your profile data
      </div>
    </div>
  );
};

export default InstagramTest;
