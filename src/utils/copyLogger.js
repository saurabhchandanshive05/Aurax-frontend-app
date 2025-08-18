// Safe Copy Environment Logger
// All actions are logged to ensure we only interact with copy resources

class CopyLogger {
  constructor() {
    this.environment = 'copy';
    this.logs = [];
    this.startTime = new Date().toISOString();
  }

  log(action, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      action,
      details: {
        ...details,
        database: 'influencer_copy',
        backend: 'https://backend-copy.onrender.com',
        frontend: 'https://frontend-copy.netlify.app'
      }
    };

    this.logs.push(logEntry);
    
    // Console log for development
    console.log(`[COPY-ENV] ${action}:`, details);
    
    // Store in localStorage for persistence
    const storedLogs = JSON.parse(localStorage.getItem('copyEnvironmentLogs') || '[]');
    storedLogs.push(logEntry);
    
    // Keep only last 100 logs
    if (storedLogs.length > 100) {
      storedLogs.splice(0, storedLogs.length - 100);
    }
    
    localStorage.setItem('copyEnvironmentLogs', JSON.stringify(storedLogs));
    
    return logEntry;
  }

  logAPICall(endpoint, method, response, error = null) {
    return this.log('API_CALL', {
      endpoint,
      method,
      success: !error,
      responseStatus: response?.status,
      responseData: response?.data,
      error: error?.message,
      timestamp: new Date().toISOString()
    });
  }

  logDatabaseOperation(operation, collection, data, result, error = null) {
    return this.log('DATABASE_OPERATION', {
      operation,
      collection,
      database: 'influencer_copy',
      dataPreview: JSON.stringify(data).substring(0, 100),
      success: !error,
      result: result,
      error: error?.message
    });
  }

  logUserAction(action, userId, details = {}) {
    return this.log('USER_ACTION', {
      action,
      userId,
      ...details
    });
  }

  getLogs(filter = null) {
    const allLogs = JSON.parse(localStorage.getItem('copyEnvironmentLogs') || '[]');
    
    if (filter) {
      return allLogs.filter(log => 
        log.action.includes(filter.toUpperCase()) ||
        JSON.stringify(log.details).toLowerCase().includes(filter.toLowerCase())
      );
    }
    
    return allLogs;
  }

  exportLogs() {
    const logs = this.getLogs();
    const exportData = {
      environment: this.environment,
      exportTime: new Date().toISOString(),
      totalLogs: logs.length,
      logs
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  clearLogs() {
    localStorage.removeItem('copyEnvironmentLogs');
    this.logs = [];
    this.log('LOGS_CLEARED', { reason: 'Manual clear' });
  }

  // Safety check - ensures we're only working with copy resources
  verifyCopyEnvironment() {
    const currentUrl = window.location.origin;
    const isCopyEnvironment = 
      currentUrl.includes('frontend-copy') || 
      currentUrl.includes('localhost') ||
      currentUrl.includes('127.0.0.1');
    
    if (!isCopyEnvironment) {
      console.error('❌ NOT IN COPY ENVIRONMENT! Current URL:', currentUrl);
      throw new Error('Not in copy environment - preventing production access');
    }
    
    this.log('ENVIRONMENT_VERIFIED', { currentUrl, verified: true });
    return true;
  }
}

// Create singleton instance
export const copyLogger = new CopyLogger();

// Auto-verify environment on load
try {
  copyLogger.verifyCopyEnvironment();
  copyLogger.log('LOGGER_INITIALIZED', { 
    message: 'Copy environment logger started safely' 
  });
} catch (error) {
  console.error('Environment verification failed:', error);
}

export default copyLogger;
