import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { copyAPI } from '../utils/copyApiService';
import { copyLogger } from '../utils/copyLogger';

const CopyEnvironmentTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [testResults, setTestResults] = useState([]);
  const [logs, setLogs] = useState([]);
  const [influencers, setInfluencers] = useState([]);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const results = [];
    
    try {
      // Test 1: Environment verification
      copyLogger.verifyCopyEnvironment();
      results.push({
        test: 'Environment Verification',
        status: 'passed',
        message: 'Successfully verified copy environment'
      });
      
      // Test 2: Backend connection
      const connectionTest = await copyAPI.test();
      results.push({
        test: 'Backend Connection',
        status: connectionTest.status === 'success' ? 'passed' : 'failed',
        message: connectionTest.message,
        details: connectionTest
      });
      
      if (connectionTest.status === 'success') {
        setConnectionStatus('connected');
        
        // Test 3: Get influencers from copy database
        try {
          const influencersData = await copyAPI.influencers.getInfluencers();
          setInfluencers(influencersData.data || []);
          results.push({
            test: 'Database Query - Influencers',
            status: 'passed',
            message: `Retrieved ${influencersData.data?.length || 0} influencers from copy database`,
            details: influencersData
          });
        } catch (error) {
          results.push({
            test: 'Database Query - Influencers',
            status: 'failed',
            message: error.message,
            details: error
          });
        }
        
        // Test 4: Get analytics from copy database
        try {
          const analyticsData = await copyAPI.analytics.getAnalytics();
          results.push({
            test: 'Database Query - Analytics',
            status: 'passed',
            message: `Retrieved analytics data from copy database`,
            details: analyticsData
          });
        } catch (error) {
          results.push({
            test: 'Database Query - Analytics',
            status: 'failed',
            message: error.message,
            details: error
          });
        }
      } else {
        setConnectionStatus('failed');
      }
      
    } catch (error) {
      results.push({
        test: 'Environment Verification',
        status: 'failed',
        message: error.message
      });
      setConnectionStatus('failed');
    }
    
    setTestResults(results);
    setLogs(copyLogger.getLogs());
  };

  const testCreateInfluencer = async () => {
    try {
      const testInfluencer = {
        name: `Test Influencer ${Date.now()}`,
        platform: 'instagram',
        followers: 10000,
        engagement_rate: 0.05,
        category: 'lifestyle',
        location: 'Test City',
        email: `test${Date.now()}@example.com`
      };
      
      const result = await copyAPI.influencers.createInfluencer(testInfluencer);
      
      alert(`Successfully created test influencer: ${result.name}`);
      runTests(); // Refresh the data
    } catch (error) {
      alert(`Failed to create influencer: ${error.message}`);
    }
  };

  const exportLogs = () => {
    const logsData = copyLogger.exportLogs();
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copy-environment-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-6">
            🔒 Copy Environment Test Dashboard
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              connectionStatus === 'connected' ? 'bg-green-500 text-white' :
              connectionStatus === 'failed' ? 'bg-red-500 text-white' :
              'bg-yellow-500 text-black'
            }`}>
              {connectionStatus === 'connected' ? '✅ Connected to Copy Environment' :
               connectionStatus === 'failed' ? '❌ Connection Failed' :
               '⏳ Testing Connection...'}
            </div>
            
            <button
              onClick={runTests}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              🔄 Re-run Tests
            </button>
            
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              📁 Export Logs
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Results */}
            <div className="bg-black/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">🧪 Test Results</h2>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className={`p-3 rounded-lg ${
                    result.status === 'passed' ? 'bg-green-500/20 border border-green-500/50' :
                    'bg-red-500/20 border border-red-500/50'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {result.status === 'passed' ? '✅' : '❌'}
                      </span>
                      <span className="font-medium text-white">{result.test}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{result.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Actions */}
            <div className="bg-black/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">⚡ Live Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={testCreateInfluencer}
                  disabled={connectionStatus !== 'connected'}
                  className="w-full p-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  ➕ Create Test Influencer
                </button>
                
                <div className="p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                  <p className="text-white font-medium">Database: influencer_copy</p>
                  <p className="text-gray-300 text-sm">Backend: backend-copy.onrender.com</p>
                  <p className="text-gray-300 text-sm">Frontend: frontend-copy.netlify.app</p>
                </div>
              </div>
            </div>
          </div>

          {/* Influencers Data */}
          {influencers.length > 0 && (
            <div className="mt-6 bg-black/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                👥 Influencers in Copy Database ({influencers.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {influencers.slice(0, 6).map((influencer, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-4">
                    <h3 className="font-medium text-white">{influencer.name}</h3>
                    <p className="text-gray-300 text-sm">{influencer.platform}</p>
                    <p className="text-gray-300 text-sm">
                      {influencer.followers?.toLocaleString()} followers
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Logs */}
          <div className="mt-6 bg-black/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">📊 Recent Logs ({logs.length})</h2>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {logs.slice(-10).reverse().map((log, index) => (
                <div key={index} className="bg-white/5 rounded p-3 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-green-400 font-medium">{log.action}</span>
                  </div>
                  <p className="text-gray-300">{JSON.stringify(log.details, null, 2)}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CopyEnvironmentTest;
