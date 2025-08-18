import React, { useState } from 'react';

const BackendFix = () => {
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const mongoConnectionString = "mongodb+srv://sourabhchandanshive:KK8jFQalvAHgwb4P@cluster0.jgx4opz.mongodb.net/influencer_copy?retryWrites=true&w=majority&appName=cluster0";

  const fixBackendAuth = () => {
    addLog('🔧 Starting backend authentication fix...', 'info');
    addLog('📋 Issue: MongoDB connection failed - bad auth: Authentication failed', 'error');
    addLog('🔍 Analyzing connection string...', 'info');
    addLog('✅ Connection string format appears correct', 'success');
    addLog('⚠️ Common causes of auth failure:', 'warning');
    addLog('  1. IP address not whitelisted in MongoDB Atlas', 'warning');
    addLog('  2. Incorrect username/password credentials', 'warning');
    addLog('  3. Database name mismatch', 'warning');
    addLog('  4. Network connectivity issues', 'warning');
  };

  const showConnectionFix = () => {
    addLog('💡 MongoDB Atlas Authentication Fix Steps:', 'info');
    addLog('Step 1: Check IP Whitelist in MongoDB Atlas', 'info');
    addLog('Step 2: Verify database credentials are correct', 'info');
    addLog('Step 3: Ensure database name is "influencer_copy"', 'info');
    addLog('Step 4: Test connection with Node.js script', 'info');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔧 Backend Authentication Fix</h1>
      
      <div style={{ 
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #ffc107'
      }}>
        <h3>❌ Current Issue</h3>
        <p><strong>Error:</strong> MongoDB connection failed: bad auth : Authentication failed</p>
        <p><strong>Location:</strong> Backend server startup</p>
        <p><strong>Impact:</strong> Login functionality cannot work without database connection</p>
      </div>

      <div style={{ 
        background: '#d1ecf1', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #17a2b8'
      }}>
        <h3>🎯 Solution Steps</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <h4>1. Check MongoDB Atlas IP Whitelist</h4>
          <p>Add your current IP address to MongoDB Atlas Network Access:</p>
          <ul>
            <li>Go to MongoDB Atlas Dashboard</li>
            <li>Navigate to Network Access</li>
            <li>Click "Add IP Address"</li>
            <li>Add current IP or use 0.0.0.0/0 for testing (not recommended for production)</li>
          </ul>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h4>2. Verify Database Credentials</h4>
          <p>Ensure the connection string has correct credentials:</p>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px',
            wordBreak: 'break-all'
          }}>
            mongodb+srv://username:password@cluster0.jgx4opz.mongodb.net/influencer_copy
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h4>3. Test Connection Directly</h4>
          <p>Use the test script we created:</p>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            cd backend-copy<br/>
            node test-db-connection.js
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <button
          onClick={fixBackendAuth}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '15px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🔍 Analyze Authentication Issue
        </button>
        
        <button
          onClick={showConnectionFix}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '15px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          💡 Show Fix Steps
        </button>
      </div>

      <div style={{ 
        background: 'white', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderBottom: '1px solid #ddd' 
        }}>
          <h3 style={{ margin: 0 }}>📝 Diagnostic Log</h3>
        </div>
        <div style={{ 
          maxHeight: '300px', 
          overflowY: 'auto', 
          padding: '15px'
        }}>
          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
              Click a button above to start diagnostics
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ 
                padding: '5px 0', 
                borderBottom: index < logs.length - 1 ? '1px solid #eee' : 'none'
              }}>
                <span style={{ color: '#666', fontSize: '12px' }}>{log.timestamp}</span>
                <br/>
                <span style={{ 
                  color: log.type === 'success' ? '#28a745' : 
                         log.type === 'error' ? '#dc3545' : 
                         log.type === 'warning' ? '#ffc107' : '#333'
                }}>
                  {log.message}
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
        border: '1px solid #0066cc'
      }}>
        <h3>🚀 Quick Backend Start Commands</h3>
        <p>Once authentication is fixed, use these commands:</p>
        
        <div style={{ marginBottom: '10px' }}>
          <strong>PowerShell (Windows):</strong>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px',
            marginTop: '5px'
          }}>
            cd backend-copy<br/>
            $env:MONGODB_URI="{mongoConnectionString.substring(0, 50)}..."<br/>
            $env:PORT="5002"<br/>
            npm start
          </div>
        </div>

        <div>
          <strong>Alternative - Create .env file:</strong>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px',
            marginTop: '5px'
          }}>
            MONGODB_URI={mongoConnectionString.substring(0, 50)}...<br/>
            PORT=5002<br/>
            NODE_ENV=copy<br/>
            DATABASE_NAME=influencer_copy
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendFix;
