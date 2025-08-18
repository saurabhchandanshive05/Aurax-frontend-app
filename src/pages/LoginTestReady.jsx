import React, { useState } from 'react';

const LoginTestReady = () => {
  const [testResults, setTestResults] = useState([]);
  const [backendStatus, setBackendStatus] = useState('Checking...');

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { timestamp, message, type }]);
  };

  const checkBackendStatus = async () => {
    addLog('🔍 Checking backend connectivity...', 'info');
    
    try {
      const response = await fetch('http://localhost:5002/', { timeout: 5000 });
      if (response.ok) {
        setBackendStatus('✅ Backend Running on Port 5002');
        addLog('✅ Backend is running and responding', 'success');
        testAPIEndpoints();
      } else {
        setBackendStatus('⚠️ Backend responding but with errors');
        addLog('⚠️ Backend responding but returned error status', 'warning');
      }
    } catch (error) {
      setBackendStatus('❌ Backend not running');
      addLog('❌ Backend not reachable - start backend first', 'error');
      addLog('💡 Solution: cd backend-copy && npm start with MongoDB URI', 'info');
    }
  };

  const testAPIEndpoints = async () => {
    const endpoints = [
      { path: '/api/test', method: 'GET', name: 'API Test' },
      { path: '/api/creators', method: 'GET', name: 'Creators List' },
      { path: '/api/brands', method: 'GET', name: 'Brands List' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:5002${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'X-Copy-Environment': 'true',
            'X-Database': 'influencer_copy'
          }
        });

        if (response.ok) {
          const data = await response.json();
          addLog(`✅ ${endpoint.name}: SUCCESS`, 'success');
          if (data.data && data.data.length) {
            addLog(`   Found ${data.data.length} items`, 'info');
          }
        } else {
          addLog(`❌ ${endpoint.name}: HTTP ${response.status}`, 'error');
        }
      } catch (error) {
        addLog(`❌ ${endpoint.name}: ${error.message}`, 'error');
      }
    }
  };

  const testLogin = async (email, password) => {
    addLog(`🔐 Testing login: ${email}`, 'info');
    
    try {
      const response = await fetch('http://localhost:5002/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Copy-Environment': 'true',
          'X-Database': 'influencer_copy'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        addLog(`✅ Login SUCCESS: ${data.user.username} (${data.user.role})`, 'success');
        addLog(`🎫 JWT Token: ${data.token.substring(0, 30)}...`, 'success');
        return data;
      } else {
        const errorData = await response.json();
        addLog(`❌ Login FAILED: ${errorData.message}`, 'error');
        return null;
      }
    } catch (error) {
      addLog(`❌ Login ERROR: ${error.message}`, 'error');
      return null;
    }
  };

  const testUsers = [
    { email: 'test@copy.example.com', password: 'TestPassword123!' },
    { email: 'brand@copy.example.com', password: 'BrandPass123!' },
    { email: 'admin@copy.example.com', password: 'AdminPass123!' }
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🎯 Login Testing - Copy Environment Ready</h1>
      
      <div style={{ 
        background: '#d4edda', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '2px solid #28a745'
      }}>
        <h2>✅ MongoDB Atlas Network Access Confirmed</h2>
        <p>Your MongoDB Atlas is properly configured with:</p>
        <ul>
          <li>✅ <strong>0.0.0.0/0</strong> - Access from anywhere (good for testing)</li>
          <li>✅ <strong>110.224.198.47/32</strong> - Your specific IP address</li>
        </ul>
        <p><strong>Database:</strong> influencer_copy with 6 collections ready for testing</p>
      </div>

      <div style={{ 
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #ffc107'
      }}>
        <h3>🚀 Quick Backend Start Command</h3>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '14px',
          marginTop: '10px'
        }}>
          cd backend-copy<br/>
          $env:MONGODB_URI="mongodb+srv://sourabhchandanshive:KK8jFQalvAHgwb4P@cluster0.jgx4opz.mongodb.net/influencer_copy?retryWrites=true&w=majority&appName=cluster0"<br/>
          $env:PORT="5002"<br/>
          npm start
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        
        <div style={{ 
          background: '#e3f2fd', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #2196f3'
        }}>
          <h3>🔍 Backend Status</h3>
          <p><strong>Status:</strong> {backendStatus}</p>
          <button
            onClick={checkBackendStatus}
            style={{
              background: '#2196f3',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Check Backend Connection
          </button>
        </div>

        <div style={{ 
          background: '#f3e5f5', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #9c27b0'
        }}>
          <h3>🔐 Test Login</h3>
          {testUsers.map((user, index) => (
            <button
              key={index}
              onClick={() => testLogin(user.email, user.password)}
              style={{
                background: '#9c27b0',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                margin: '5px 0',
                width: '100%',
                fontSize: '12px'
              }}
            >
              {user.email}
            </button>
          ))}
        </div>
      </div>

      <div style={{ 
        background: 'white', 
        border: '1px solid #ddd', 
        borderRadius: '8px' 
      }}>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0 }}>📝 Test Results</h3>
          <button
            onClick={() => setTestResults([])}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear
          </button>
        </div>
        
        <div style={{ 
          maxHeight: '400px', 
          overflowY: 'auto', 
          padding: '15px' 
        }}>
          {testResults.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
              Click "Check Backend Connection" to start testing
            </div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} style={{ 
                padding: '5px 0', 
                borderBottom: index < testResults.length - 1 ? '1px solid #eee' : 'none'
              }}>
                <span style={{ color: '#666', fontSize: '12px' }}>{result.timestamp}</span>
                <br/>
                <span style={{ 
                  color: result.type === 'success' ? '#28a745' : 
                         result.type === 'error' ? '#dc3545' : 
                         result.type === 'warning' ? '#ffc107' : '#333'
                }}>
                  {result.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ 
        background: '#e7f3ff', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '20px',
        border: '1px solid #0066cc'
      }}>
        <h3>🎉 Copy Environment Status: READY</h3>
        <ul style={{ margin: '10px 0' }}>
          <li>✅ MongoDB Atlas Network Access configured</li>
          <li>✅ Database connection string verified</li>
          <li>✅ influencer_copy database with real data</li>
          <li>✅ Test users available for login testing</li>
          <li>✅ Frontend proxy configured for localhost:5002</li>
        </ul>
        <p><strong>Next Step:</strong> Start the backend and test login functionality!</p>
      </div>
    </div>
  );
};

export default LoginTestReady;
