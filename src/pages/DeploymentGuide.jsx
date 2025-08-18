// Backend Deployment Guide for Copy Environment
import React, { useState } from 'react';
import { copyLogger } from '../utils/copyLogger';

const DeploymentGuide = () => {
  const [step, setStep] = useState(1);
  const [deploymentStatus, setDeploymentStatus] = useState('ready');

  const steps = [
    {
      id: 1,
      title: "Prepare Backend for Deployment",
      content: (
        <div>
          <h4 style={{ color: '#2e7d32', marginBottom: '1rem' }}>✅ Backend Files Ready</h4>
          <p>Your backend-copy is located at:</p>
          <code style={{ background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px', display: 'block', margin: '1rem 0' }}>
            C:\Users\hp\OneDrive\Desktop\backend-copy\
          </code>
          <ul>
            <li>✅ server.js - Main server file</li>
            <li>✅ package.json - Dependencies configured</li>
            <li>✅ models/ - Database models (Creator, Brand, User, Contact)</li>
            <li>✅ db/connect.js - Database connection</li>
            <li>✅ middleware/ - Authentication middleware</li>
          </ul>
        </div>
      )
    },
    {
      id: 2,
      title: "Deploy to Render",
      content: (
        <div>
          <h4 style={{ color: '#1976d2', marginBottom: '1rem' }}>🚀 Render Deployment Steps</h4>
          <ol style={{ paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              Go to <a href="https://render.com" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>render.com</a> and sign in
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Click "New +" → "Web Service"
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Connect your GitHub repository or upload backend-copy folder
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Service Name: <code>backend-copy</code>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Build Command: <code>npm install</code>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Start Command: <code>npm start</code>
            </li>
          </ol>
        </div>
      )
    },
    {
      id: 3,
      title: "Configure Environment Variables",
      content: (
        <div>
          <h4 style={{ color: '#f57c00', marginBottom: '1rem' }}>⚙️ Environment Variables</h4>
          <p>Add these environment variables in Render dashboard:</p>
          <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            MONGODB_URI=mongodb+srv://copyUser:MySecret123@cluster0.abcd.mongodb.net/influencer_copy<br/>
            JWT_SECRET=copy_jwt_secret_key_2024_safe_environment<br/>
            NODE_ENV=copy<br/>
            PORT=10000<br/>
            ENVIRONMENT=copy<br/>
            DATABASE_NAME=influencer_copy<br/>
            IS_COPY_ENV=true<br/>
            CORS_ORIGINS=https://frontend-copy.netlify.app,http://localhost:3001
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Verify Deployment",
      content: (
        <div>
          <h4 style={{ color: '#7b1fa2', marginBottom: '1rem' }}>🔍 Verification Steps</h4>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>✅ Service should be available at: <code>https://backend-copy.onrender.com</code></li>
            <li>✅ Health check: <code>https://backend-copy.onrender.com/health</code></li>
            <li>✅ API test: <code>https://backend-copy.onrender.com/api/test</code></li>
            <li>✅ Database connection verified</li>
          </ul>
          <button 
            onClick={() => window.open('/backend-status', '_blank')}
            style={{
              background: '#7b1fa2',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            🔧 Open Backend Status Checker
          </button>
        </div>
      )
    },
    {
      id: 5,
      title: "Test Copy Environment",
      content: (
        <div>
          <h4 style={{ color: '#2e7d32', marginBottom: '1rem' }}>🧪 Testing Complete Setup</h4>
          <p>Once backend is deployed, test the full copy environment:</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <button 
              onClick={() => window.open('/quick-api-test', '_blank')}
              style={{
                background: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🚀 Quick API Test
            </button>
            <button 
              onClick={() => window.open('/comprehensive-test', '_blank')}
              style={{
                background: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🧪 Comprehensive Test
            </button>
            <button 
              onClick={() => window.open('/copy-test', '_blank')}
              style={{
                background: '#ff9800',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🔄 Copy Environment Test
            </button>
          </div>
        </div>
      )
    }
  ];

  const testCurrentStatus = async () => {
    setDeploymentStatus('testing');
    copyLogger.log('DEPLOYMENT_STATUS_CHECK', { timestamp: new Date().toISOString() });
    
    try {
      const response = await fetch('https://backend-copy.onrender.com/health');
      if (response.ok) {
        setDeploymentStatus('deployed');
        copyLogger.log('BACKEND_DEPLOYED', { status: 'success' });
      } else {
        setDeploymentStatus('deployed-error');
        copyLogger.log('BACKEND_DEPLOYED_ERROR', { status: response.status });
      }
    } catch (error) {
      setDeploymentStatus('not-deployed');
      copyLogger.log('BACKEND_NOT_DEPLOYED', { error: error.message });
    }
  };

  const getStatusIcon = () => {
    switch (deploymentStatus) {
      case 'deployed': return '✅';
      case 'testing': return '🔄';
      case 'deployed-error': return '⚠️';
      case 'not-deployed': return '❌';
      default: return '⏳';
    }
  };

  const getStatusMessage = () => {
    switch (deploymentStatus) {
      case 'deployed': return 'Backend is deployed and responding!';
      case 'testing': return 'Testing backend status...';
      case 'deployed-error': return 'Backend deployed but has errors';
      case 'not-deployed': return 'Backend not deployed yet';
      default: return 'Ready to check deployment status';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🚀 Backend Deployment Guide
          </h1>
          
          <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Deploy your copy backend to complete the safe copy environment
          </p>

          {/* Deployment Status */}
          <div style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Current Deployment Status</h3>
            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              {getStatusIcon()} {getStatusMessage()}
            </div>
            <button
              onClick={testCurrentStatus}
              disabled={deploymentStatus === 'testing'}
              style={{
                background: deploymentStatus === 'testing' ? '#ccc' : '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: deploymentStatus === 'testing' ? 'not-allowed' : 'pointer'
              }}
            >
              {deploymentStatus === 'testing' ? '🔄 Testing...' : '🔍 Check Status'}
            </button>
          </div>

          {/* Steps Navigation */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            {steps.map((s) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                style={{
                  background: step === s.id ? '#667eea' : '#e9ecef',
                  color: step === s.id ? 'white' : '#6c757d',
                  border: 'none',
                  padding: '10px 15px',
                  margin: '0 5px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: step === s.id ? 'bold' : 'normal'
                }}
              >
                {s.id}
              </button>
            ))}
          </div>

          {/* Current Step Content */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '2rem',
            minHeight: '400px'
          }}>
            <h2 style={{ 
              fontSize: '1.8rem', 
              marginBottom: '1.5rem',
              color: '#495057'
            }}>
              Step {step}: {steps[step - 1].title}
            </h2>
            
            {steps[step - 1].content}
          </div>

          {/* Navigation */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: '2rem'
          }}>
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              style={{
                background: step === 1 ? '#ccc' : '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: step === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ← Previous
            </button>

            <span style={{ color: '#6c757d' }}>
              Step {step} of {steps.length}
            </span>

            <button
              onClick={() => setStep(Math.min(steps.length, step + 1))}
              disabled={step === steps.length}
              style={{
                background: step === steps.length ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: step === steps.length ? 'not-allowed' : 'pointer'
              }}
            >
              Next →
            </button>
          </div>

          {/* Quick Actions */}
          {deploymentStatus === 'deployed' && (
            <div style={{
              background: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '8px',
              padding: '1rem',
              marginTop: '2rem'
            }}>
              <h4 style={{ color: '#155724', marginBottom: '1rem' }}>🎉 Backend Deployed Successfully!</h4>
              <p style={{ color: '#155724', marginBottom: '1rem' }}>
                Your copy environment is now fully operational. Test all features:
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => window.open('/backend-status', '_blank')}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  📊 Backend Status
                </button>
                <button 
                  onClick={() => window.open('/comprehensive-test', '_blank')}
                  style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🧪 Full Test Suite
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeploymentGuide;
