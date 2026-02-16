// Quick API Connection Test for Copy Backend and Database
import React, { useState } from 'react';
import { copyLogger } from '../utils/copyLogger';

const QuickAPITest = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const newLog = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [newLog, ...prev.slice(0, 19)]); // Keep last 20 logs
  };

  // Test 1: Direct Backend Health Check
  const testBackendHealth = async () => {
    addLog('🔍 Testing copy backend health...', 'info');
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Copy-Environment': 'true',
          'X-Database': 'influencer_copy'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        addLog('✅ Backend health check passed', 'success');
        setTestResults(prev => ({ ...prev, backendHealth: { status: 'PASS', data } }));
      } else {
        addLog(`❌ Backend health check failed: ${data.message || 'Unknown error'}`, 'error');
        setTestResults(prev => ({ ...prev, backendHealth: { status: 'FAIL', data } }));
      }
    } catch (error) {
      addLog(`🚨 Backend health check error: ${error.message}`, 'error');
      setTestResults(prev => ({ ...prev, backendHealth: { status: 'ERROR', error: error.message } }));
    }
  };

  // Test 2: Database Connection Test
  const testDatabaseConnection = async () => {
    addLog('🗄️ Testing database connection...', 'info');
    try {
      const response = await fetch('/api/db/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Copy-Environment': 'true',
          'X-Database': 'influencer_copy'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        addLog(`✅ Database connection successful - Connected to: ${data.database || 'influencer_copy'}`, 'success');
        setTestResults(prev => ({ ...prev, databaseConnection: { status: 'PASS', data } }));
      } else {
        addLog(`❌ Database connection failed: ${data.message || 'Unknown error'}`, 'error');
        setTestResults(prev => ({ ...prev, databaseConnection: { status: 'FAIL', data } }));
      }
    } catch (error) {
      addLog(`🚨 Database connection error: ${error.message}`, 'error');
      setTestResults(prev => ({ ...prev, databaseConnection: { status: 'ERROR', error: error.message } }));
    }
  };

  // Test 3: API Endpoints Test
  const testAPIEndpoints = async () => {
    addLog('🔗 Testing API endpoints...', 'info');
    const endpoints = [
      { path: '/api/test', name: 'Test Endpoint' },
      { path: '/api/influencers', name: 'Influencers Endpoint' },
      { path: '/api/posts', name: 'Posts Endpoint' },
      { path: '/api/analytics', name: 'Analytics Endpoint' }
    ];

    const results = {};

    for (const endpoint of endpoints) {
      try {
        addLog(`🔍 Testing ${endpoint.name}...`, 'info');
        
        const response = await fetch(endpoint.path, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Copy-Environment': 'true',
            'X-Database': 'influencer_copy'
          }
        });

        const data = await response.json();

        if (response.ok) {
          addLog(`✅ ${endpoint.name} working - Status: ${response.status}`, 'success');
          results[endpoint.path] = { status: 'PASS', statusCode: response.status, data };
        } else {
          addLog(`❌ ${endpoint.name} failed - Status: ${response.status}`, 'error');
          results[endpoint.path] = { status: 'FAIL', statusCode: response.status, data };
        }
      } catch (error) {
        addLog(`🚨 ${endpoint.name} error: ${error.message}`, 'error');
        results[endpoint.path] = { status: 'ERROR', error: error.message };
      }
    }

    setTestResults(prev => ({ ...prev, apiEndpoints: results }));
  };

  // Test 4: Database CRUD Operations
  const testDatabaseOperations = async () => {
    addLog('📝 Testing database CRUD operations...', 'info');
    try {
      // Test CREATE operation
      addLog('Creating test record...', 'info');
      const createResponse = await fetch('/api/influencers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Copy-Environment': 'true',
          'X-Database': 'influencer_copy'
        },
        body: JSON.stringify({
          name: 'API Test Creator',
          platform: 'Instagram',
          followers: 10000,
          engagement: 3.5,
          category: 'Test',
          isTestData: true,
          createdAt: new Date().toISOString()
        })
      });

      if (createResponse.ok) {
        const created = await createResponse.json();
        addLog(`✅ CREATE operation successful - ID: ${created._id || created.id}`, 'success');

        // Test READ operation
        addLog('Reading test record...', 'info');
        const readResponse = await fetch(`/api/influencers/${created._id || created.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'X-Copy-Environment': 'true',
            'X-Database': 'influencer_copy'
          }
        });

        if (readResponse.ok) {
          const read = await readResponse.json();
          addLog('✅ READ operation successful', 'success');

          // Test UPDATE operation
          addLog('Updating test record...', 'info');
          const updateResponse = await fetch(`/api/influencers/${created._id || created.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-Copy-Environment': 'true',
              'X-Database': 'influencer_copy'
            },
            body: JSON.stringify({
              ...read,
              followers: 15000,
              testUpdated: true
            })
          });

          if (updateResponse.ok) {
            addLog('✅ UPDATE operation successful', 'success');
            addLog('✅ All CRUD operations completed successfully', 'success');
            setTestResults(prev => ({ ...prev, crudOperations: { status: 'PASS', recordId: created._id || created.id } }));
          } else {
            addLog('❌ UPDATE operation failed', 'error');
            setTestResults(prev => ({ ...prev, crudOperations: { status: 'FAIL', stage: 'UPDATE' } }));
          }
        } else {
          addLog('❌ READ operation failed', 'error');
          setTestResults(prev => ({ ...prev, crudOperations: { status: 'FAIL', stage: 'READ' } }));
        }
      } else {
        addLog('❌ CREATE operation failed', 'error');
        setTestResults(prev => ({ ...prev, crudOperations: { status: 'FAIL', stage: 'CREATE' } }));
      }
    } catch (error) {
      addLog(`🚨 CRUD operations error: ${error.message}`, 'error');
      setTestResults(prev => ({ ...prev, crudOperations: { status: 'ERROR', error: error.message } }));
    }
  };

  // Run All Tests
  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults({});
    setLogs([]);
    
    addLog('🚀 Starting API and Database tests...', 'info');
    copyLogger.log('QUICK_API_TEST_STARTED', { timestamp: new Date().toISOString() });

    await testBackendHealth();
    await testDatabaseConnection();
    await testAPIEndpoints();
    await testDatabaseOperations();

    addLog('🏁 All tests completed!', 'info');
    copyLogger.log('QUICK_API_TEST_COMPLETED', { results: testResults });
    setIsLoading(false);
  };

  const getStatusIcon = (result) => {
    if (!result) return '⏳';
    switch (result.status) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      case 'ERROR': return '🚨';
      default: return '⏳';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🔧 Quick API & Database Test
          </h1>
          
          <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Testing copy backend connection and database operations
          </p>

          <button
            onClick={runAllTests}
            disabled={isLoading}
            style={{
              background: isLoading ? '#ccc' : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '2rem'
            }}
          >
            {isLoading ? '🔄 Running Tests...' : '🚀 Run Quick Tests'}
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Test Results */}
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                📊 Test Results
              </h3>
              
              <div>
                {[
                  { key: 'backendHealth', name: 'Backend Health' },
                  { key: 'databaseConnection', name: 'Database Connection' },
                  { key: 'apiEndpoints', name: 'API Endpoints' },
                  { key: 'crudOperations', name: 'CRUD Operations' }
                ].map((test) => (
                  <div key={test.key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontWeight: '500' }}>{test.name}</span>
                    <span>
                      {getStatusIcon(testResults[test.key])} {testResults[test.key]?.status || 'PENDING'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Logs */}
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                📝 Live Logs
              </h3>
              
              <div style={{
                background: '#1a1a1a',
                color: '#00ff00',
                borderRadius: '8px',
                padding: '1rem',
                height: '300px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.85rem'
              }}>
                {logs.map((log, index) => (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    <span style={{ color: '#888' }}>[{log.timestamp}]</span> {log.message}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div style={{ color: '#888', fontStyle: 'italic' }}>
                    Click "Run Quick Tests" to start testing...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          {Object.keys(testResults).length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                📋 Detailed Results
              </h3>
              
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <pre style={{ 
                  overflow: 'auto', 
                  fontSize: '0.85rem',
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '4px'
                }}>
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickAPITest;
