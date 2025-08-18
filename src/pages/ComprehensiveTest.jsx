// Comprehensive Copy Environment Test
// Tests all aspects of the copy environment to ensure everything works correctly

import React, { useState, useEffect } from 'react';
import { copyAPI } from '../utils/copyApiService';
import { copyLogger } from '../utils/copyLogger';

const ComprehensiveTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [newLog, ...prev]);
    console.log(`[TEST-${type.toUpperCase()}]`, message);
  };

  const updateTestResult = (testName, result, details = null) => {
    setTestResults(prev => ({
      ...prev,
      [testName]: { result, details, timestamp: new Date().toISOString() }
    }));
  };

  // Test 1: Environment Safety Check
  const testEnvironmentSafety = async () => {
    try {
      addLog('🔒 Testing environment safety...', 'info');
      
      // Verify we're in copy environment
      copyLogger.verifyCopyEnvironment();
      
      // Check current URL
      const currentUrl = window.location.origin;
      const isSafe = currentUrl.includes('localhost') || currentUrl.includes('frontend-copy');
      
      if (isSafe) {
        addLog('✅ Environment safety verified - Copy environment detected', 'success');
        updateTestResult('environmentSafety', 'PASS', { url: currentUrl });
      } else {
        addLog('❌ Environment safety failed - Not in copy environment!', 'error');
        updateTestResult('environmentSafety', 'FAIL', { url: currentUrl });
      }
    } catch (error) {
      addLog(`❌ Environment safety error: ${error.message}`, 'error');
      updateTestResult('environmentSafety', 'ERROR', { error: error.message });
    }
  };

  // Test 2: Backend Connection
  const testBackendConnection = async () => {
    try {
      addLog('🌐 Testing backend connection...', 'info');
      
      const response = await copyAPI.test();
      
      if (response && response.status === 'success') {
        addLog('✅ Backend connection successful', 'success');
        updateTestResult('backendConnection', 'PASS', response);
      } else {
        addLog('❌ Backend connection failed', 'error');
        updateTestResult('backendConnection', 'FAIL', response);
      }
    } catch (error) {
      addLog(`❌ Backend connection error: ${error.message}`, 'error');
      updateTestResult('backendConnection', 'ERROR', { error: error.message });
    }
  };

  // Test 3: Database Operations - Influencers
  const testInfluencerOperations = async () => {
    try {
      addLog('👥 Testing influencer database operations...', 'info');
      
      // Test GET influencers
      const influencers = await copyAPI.influencers.getInfluencers();
      addLog(`📊 Retrieved ${influencers?.length || 0} influencers from copy database`, 'info');
      
      // Test CREATE influencer
      const testInfluencer = {
        name: 'Test Creator',
        platform: 'Instagram',
        followers: 50000,
        engagement: 4.5,
        category: 'Tech',
        email: 'test@example.com',
        isTestData: true
      };
      
      const created = await copyAPI.influencers.createInfluencer(testInfluencer);
      if (created) {
        addLog('✅ Influencer creation successful', 'success');
        
        // Test GET by ID
        const retrieved = await copyAPI.influencers.getInfluencerById(created._id);
        if (retrieved) {
          addLog('✅ Influencer retrieval by ID successful', 'success');
          
          // Test UPDATE
          const updated = await copyAPI.influencers.updateInfluencer(created._id, {
            ...testInfluencer,
            followers: 55000,
            testUpdated: true
          });
          
          if (updated) {
            addLog('✅ Influencer update successful', 'success');
            updateTestResult('influencerOperations', 'PASS', {
              created: created._id,
              retrieved: retrieved._id,
              updated: updated._id
            });
          } else {
            throw new Error('Update failed');
          }
        } else {
          throw new Error('Retrieval by ID failed');
        }
      } else {
        throw new Error('Creation failed');
      }
    } catch (error) {
      addLog(`❌ Influencer operations error: ${error.message}`, 'error');
      updateTestResult('influencerOperations', 'ERROR', { error: error.message });
    }
  };

  // Test 4: Posts Operations
  const testPostOperations = async () => {
    try {
      addLog('📝 Testing posts database operations...', 'info');
      
      // Test GET posts
      const posts = await copyAPI.posts.getPosts();
      addLog(`📊 Retrieved ${posts?.length || 0} posts from copy database`, 'info');
      
      // Test CREATE post
      const testPost = {
        title: 'Test Campaign Post',
        content: 'This is a test post for copy environment validation',
        platform: 'Instagram',
        metrics: {
          likes: 1000,
          comments: 50,
          shares: 25
        },
        isTestData: true
      };
      
      const created = await copyAPI.posts.createPost(testPost);
      if (created) {
        addLog('✅ Post creation successful', 'success');
        
        // Test UPDATE
        const updated = await copyAPI.posts.updatePost(created._id, {
          ...testPost,
          metrics: { ...testPost.metrics, likes: 1200 },
          testUpdated: true
        });
        
        if (updated) {
          addLog('✅ Post update successful', 'success');
          updateTestResult('postOperations', 'PASS', {
            created: created._id,
            updated: updated._id
          });
        } else {
          throw new Error('Post update failed');
        }
      } else {
        throw new Error('Post creation failed');
      }
    } catch (error) {
      addLog(`❌ Post operations error: ${error.message}`, 'error');
      updateTestResult('postOperations', 'ERROR', { error: error.message });
    }
  };

  // Test 5: Analytics Operations
  const testAnalyticsOperations = async () => {
    try {
      addLog('📈 Testing analytics operations...', 'info');
      
      // Test GET analytics
      const analytics = await copyAPI.analytics.getAnalytics();
      addLog(`📊 Retrieved analytics data from copy database`, 'info');
      
      // Test SUBMIT analytics
      const testAnalytics = {
        campaignId: 'test-campaign-' + Date.now(),
        metrics: {
          impressions: 10000,
          clicks: 500,
          conversions: 25,
          revenue: 1250
        },
        platform: 'Instagram',
        date: new Date().toISOString(),
        isTestData: true
      };
      
      const submitted = await copyAPI.analytics.submitAnalytics(testAnalytics);
      if (submitted) {
        addLog('✅ Analytics submission successful', 'success');
        updateTestResult('analyticsOperations', 'PASS', { submitted: submitted._id });
      } else {
        throw new Error('Analytics submission failed');
      }
    } catch (error) {
      addLog(`❌ Analytics operations error: ${error.message}`, 'error');
      updateTestResult('analyticsOperations', 'ERROR', { error: error.message });
    }
  };

  // Test 6: Logging System
  const testLoggingSystem = async () => {
    try {
      addLog('📋 Testing logging system...', 'info');
      
      // Test custom log
      copyLogger.log('TEST_LOG_ENTRY', { test: true, timestamp: Date.now() });
      
      // Get stored logs
      const storedLogs = JSON.parse(localStorage.getItem('copyEnvironmentLogs') || '[]');
      
      if (storedLogs.length > 0) {
        addLog(`✅ Logging system working - ${storedLogs.length} logs stored`, 'success');
        updateTestResult('loggingSystem', 'PASS', { logCount: storedLogs.length });
      } else {
        addLog('❌ No logs found in storage', 'error');
        updateTestResult('loggingSystem', 'FAIL', { logCount: 0 });
      }
    } catch (error) {
      addLog(`❌ Logging system error: ${error.message}`, 'error');
      updateTestResult('loggingSystem', 'ERROR', { error: error.message });
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});
    setLogs([]);
    
    addLog('🚀 Starting comprehensive copy environment tests...', 'info');
    
    await testEnvironmentSafety();
    await testBackendConnection();
    await testInfluencerOperations();
    await testPostOperations();
    await testAnalyticsOperations();
    await testLoggingSystem();
    
    addLog('🏁 All tests completed!', 'info');
    setIsRunning(false);
  };

  const getTestStatusIcon = (result) => {
    if (!result) return '⏳';
    switch (result.result) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      case 'ERROR': return '🚨';
      default: return '⏳';
    }
  };

  const getTestStatusClass = (result) => {
    if (!result) return 'text-gray-500';
    switch (result.result) {
      case 'PASS': return 'text-green-600';
      case 'FAIL': return 'text-red-600';
      case 'ERROR': return 'text-red-800';
      default: return 'text-gray-500';
    }
  };

  const exportTestResults = () => {
    const results = {
      timestamp: new Date().toISOString(),
      environment: 'copy',
      tests: testResults,
      logs: logs,
      summary: {
        total: Object.keys(testResults).length,
        passed: Object.values(testResults).filter(r => r.result === 'PASS').length,
        failed: Object.values(testResults).filter(r => r.result === 'FAIL').length,
        errors: Object.values(testResults).filter(r => r.result === 'ERROR').length
      }
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copy-environment-test-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🧪 Copy Environment Comprehensive Test
          </h1>
          
          <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Testing all aspects of the copy environment to ensure safe operation
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={runAllTests}
              disabled={isRunning}
              style={{
                background: isRunning ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {isRunning ? '🔄 Running Tests...' : '🚀 Run All Tests'}
            </button>
            
            <button
              onClick={exportTestResults}
              disabled={Object.keys(testResults).length === 0}
              style={{
                background: Object.keys(testResults).length === 0 ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: Object.keys(testResults).length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              📊 Export Results
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Test Results */}
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                📋 Test Results
              </h2>
              
              <div style={{ space: '1rem' }}>
                {[
                  { key: 'environmentSafety', name: 'Environment Safety' },
                  { key: 'backendConnection', name: 'Backend Connection' },
                  { key: 'influencerOperations', name: 'Influencer Operations' },
                  { key: 'postOperations', name: 'Post Operations' },
                  { key: 'analyticsOperations', name: 'Analytics Operations' },
                  { key: 'loggingSystem', name: 'Logging System' }
                ].map((test) => (
                  <div key={test.key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontWeight: '500' }}>{test.name}</span>
                    <span className={getTestStatusClass(testResults[test.key])}>
                      {getTestStatusIcon(testResults[test.key])} {testResults[test.key]?.result || 'PENDING'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Logs */}
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                📝 Live Logs
              </h2>
              
              <div style={{
                background: '#1a1a1a',
                color: '#00ff00',
                borderRadius: '8px',
                padding: '1rem',
                height: '400px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              }}>
                {logs.map((log) => (
                  <div key={log.id} style={{ marginBottom: '4px' }}>
                    <span style={{ color: '#888' }}>[{log.timestamp}]</span> {log.message}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div style={{ color: '#888', fontStyle: 'italic' }}>
                    Logs will appear here when tests are running...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Test Details */}
          {Object.keys(testResults).length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                📊 Detailed Results
              </h2>
              
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <pre style={{ 
                  overflow: 'auto', 
                  fontSize: '0.9rem',
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

export default ComprehensiveTest;
