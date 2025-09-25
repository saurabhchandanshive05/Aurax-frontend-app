// Safe Copy Environment Logger
// All actions are logged to ensure we only interact with copy resources
class CopyLogger {
  constructor() {
    this.environment = "copy";
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
        database: "influencer_copy",
        backend: "https://influencer-backend-etq5.onrender.com",
        frontend: "https://aaurax.netlify.app",
      },
    };
    this.logs.push(logEntry);
    // Console log for development - Fixed syntax
    console.log("[COPY-ENV]:", details);
    // Store in localStorage for persistence
    const storedLogs = JSON.parse(
      localStorage.getItem("copyEnvironmentLogs") || "[]"
    );
    storedLogs.push(logEntry);
    // Keep only last 100 logs
    if (storedLogs.length > 100) {
      storedLogs.splice(0, storedLogs.length - 100);
    }
    localStorage.setItem("copyEnvironmentLogs", JSON.stringify(storedLogs));
    return logEntry;
  }
  logAPICall(endpoint, method, response, error = null) {
    return this.log("API_CALL", {
      endpoint,
      method,
      success: !error,
      responseStatus: response?.status,
      responseData: response?.data,
      error: error?.message,
      timestamp: new Date().toISOString(),
    });
  }
  logDatabaseOperation(operation, collection, data, result, error = null) {
    return this.log("DATABASE_OPERATION", {
      operation,
      collection,
      database: "influencer_copy",
      dataPreview: JSON.stringify(data).substring(0, 100),
      success: !error,
      result: result,
      error: error?.message,
    });
  }
  logUserAction(action, userId, details = {}) {
    return this.log("USER_ACTION", {
      action,
      userId,
      ...details,
    });
  }

  // Standard logging methods
  info(message, details = {}) {
    return this.log("INFO", { message, ...details });
  }

  error(message, details = {}) {
    return this.log("ERROR", { message, ...details });
  }

  warn(message, details = {}) {
    return this.log("WARNING", { message, ...details });
  }

  debug(message, details = {}) {
    return this.log("DEBUG", { message, ...details });
  }
  getLogs(filter = null) {
    const allLogs = JSON.parse(
      localStorage.getItem("copyEnvironmentLogs") || "[]"
    );
    if (filter) {
      return allLogs.filter(
        (log) =>
          log.action.includes(filter.toUpperCase()) ||
          JSON.stringify(log.details)
            .toLowerCase()
            .includes(filter.toLowerCase())
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
      logs,
    };
    return JSON.stringify(exportData, null, 2);
  }
  clearLogs() {
    localStorage.removeItem("copyEnvironmentLogs");
    this.logs = [];
    this.log("LOGS_CLEARED", { reason: "Manual clear" });
  }
  // Safety check - ensures we're only working with copy resources
  verifyCopyEnvironment() {
    const currentDomain = window.location.hostname;
    const allowedDomains = [
      "frontend-copy",
      "localhost",
      "127.0.0.1",
      "aaurax.netlify.app", // Add your production domain
    ];

    if (!allowedDomains.includes(currentDomain)) {
      throw new Error("NOT IN COPY ENVIRONMENT");
    }

    return true;
  }
}
// Create singleton instance
export const copyLogger = new CopyLogger();
// Auto-verify environment on load
try {
  copyLogger.verifyCopyEnvironment();
  copyLogger.log("LOGGER_INITIALIZED", {
    message: "Copy environment logger started safely",
  });
} catch (error) {
  console.error("Environment verification failed:", error);
}
export default copyLogger;
