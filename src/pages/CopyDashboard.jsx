// Copy Environment Dashboard - Central hub for all copy environment tools and tests
import React, { useState, useEffect } from 'react';
import { copyLogger } from '../utils/copyLogger';

const CopyDashboard = () => {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState(null);

  const tools = [
    {
      id: 'deployment-guide',
      title: 'Backend Deployment Guide',
      description: 'Step-by-step guide to deploy backend-copy to Render',
      icon: '🚀',
      color: '#667eea',
      path: '/deployment-guide',
      status: 'always-available'
    },
    {
      id: 'backend-status',
      title: 'Backend Status Checker',
      description: 'Real-time backend deployment status and connectivity test',
      icon: '🔧',
      color: '#ff6b6b',
      path: '/backend-status',
      status: 'always-available'
    },
    {
      id: 'quick-api-test',
      title: 'Quick API Test',
      description: 'Fast API endpoint and database operations testing',
      icon: '⚡',
      color: '#4facfe',
      path: '/quick-api-test',
      status: backendStatus === 'online' ? 'ready' : 'needs-backend'
    },
    {
      id: 'comprehensive-test',
      title: 'Comprehensive Test Suite',
      description: 'Full copy environment validation with detailed reporting',
      icon: '🧪',
      color: '#667eea',
      path: '/comprehensive-test',
      status: 'always-available'
    },
    {
      id: 'copy-test',
      title: 'Copy Environment Test',
      description: 'Basic copy environment connectivity verification',
      icon: '🔄',
      color: '#ff9800',
      path: '/copy-test',
      status: 'always-available'
    },
    {
      id: 'test-images',
      title: 'Asset Verification',
      description: 'Test image and video asset loading from public directory',
      icon: '🖼️',
      color: '#9c27b0',
      path: '/test-images',
      status: 'always-available'
    }
  ];

  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    copyLogger.log('DASHBOARD_STATUS_CHECK', { timestamp: new Date().toISOString() });
    
    try {
      const response = await fetch('https://backend-copy.onrender.com/health', {
        method: 'GET',
        timeout: 10000
      });
      
      if (response.ok) {
        setBackendStatus('online');
        copyLogger.log('BACKEND_ONLINE', { status: 'success' });
      } else {
        setBackendStatus('deployed-error');
        copyLogger.log('BACKEND_ERROR', { status: response.status });
      }
    } catch (error) {
      setBackendStatus('offline');
      copyLogger.log('BACKEND_OFFLINE', { error: error.message });
    }
    
    setLastChecked(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    checkBackendStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    const badges = {
      'checking': { text: 'Checking...', color: '#ffc107', icon: '🔄' },
      'online': { text: 'Online', color: '#28a745', icon: '✅' },
      'deployed-error': { text: 'Error', color: '#dc3545', icon: '⚠️' },
      'offline': { text: 'Offline', color: '#6c757d', icon: '❌' }
    };
    
    const badge = badges[backendStatus];
    return (
      <span style={{
        background: badge.color,
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: 'bold'
      }}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  const getToolStatus = (tool) => {
    switch (tool.status) {
      case 'always-available':
        return { text: 'Ready', color: '#28a745', icon: '✅' };
      case 'ready':
        return { text: 'Ready', color: '#28a745', icon: '✅' };
      case 'needs-backend':
        return { text: 'Needs Backend', color: '#ffc107', icon: '⏳' };
      default:
        return { text: 'Unknown', color: '#6c757d', icon: '❓' };
    }
  };

  const openTool = (path) => {
    copyLogger.log('TOOL_OPENED', { tool: path, timestamp: new Date().toISOString() });
    window.open(path, '_blank');
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
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🛡️ Copy Environment Dashboard
            </h1>
            
            <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '2rem' }}>
              Safe testing environment for influencer marketing platform
            </p>

            {/* Status Overview */}
            <div style={{
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'inline-block',
              textAlign: 'left'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>Environment Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', minWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Frontend:</span>
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅ Running</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Backend:</span>
                  {getStatusBadge()}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Database:</span>
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅ influencer_copy</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Branch:</span>
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅ ai-copy</span>
                </div>
              </div>
              {lastChecked && (
                <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#6c757d' }}>
                  Last checked: {lastChecked}
                  <button
                    onClick={checkBackendStatus}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      marginLeft: '1rem',
                      textDecoration: 'underline'
                    }}
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tools Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {tools.map((tool) => {
              const toolStatus = getToolStatus(tool);
              return (
                <div
                  key={tool.id}
                  style={{
                    background: 'white',
                    border: `2px solid ${tool.color}`,
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  onClick={() => openTool(tool.path)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-4px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: toolStatus.color,
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {toolStatus.icon} {toolStatus.text}
                  </div>

                  {/* Tool Icon */}
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '1rem'
                  }}>
                    {tool.icon}
                  </div>

                  {/* Tool Info */}
                  <h3 style={{
                    color: tool.color,
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}>
                    {tool.title}
                  </h3>

                  <p style={{
                    color: '#666',
                    fontSize: '0.95rem',
                    lineHeight: '1.4',
                    marginBottom: '1rem'
                  }}>
                    {tool.description}
                  </p>

                  {/* Action Button */}
                  <button
                    style={{
                      background: tool.color,
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    Open Tool →
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#495057' }}>Quick Actions</h3>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {backendStatus === 'offline' && (
                <button
                  onClick={() => openTool('/deployment-guide')}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  🚀 Deploy Backend Now
                </button>
              )}
              
              {backendStatus === 'online' && (
                <>
                  <button
                    onClick={() => openTool('/comprehensive-test')}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    🧪 Run Full Tests
                  </button>
                  
                  <button
                    onClick={() => openTool('/quick-api-test')}
                    style={{
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ Quick API Test
                  </button>
                </>
              )}
              
              <button
                onClick={() => {
                  const logs = JSON.parse(localStorage.getItem('copyEnvironmentLogs') || '[]');
                  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `copy-environment-logs-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                📊 Export Logs
              </button>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#e3f2fd',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #bbdefb'
          }}>
            <p style={{ color: '#1976d2', margin: 0, fontSize: '0.9rem' }}>
              🛡️ <strong>Safe Copy Environment</strong> - All operations target copy resources only. 
              Frontend: localhost:3001 | Backend: backend-copy.onrender.com | Database: influencer_copy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyDashboard;
