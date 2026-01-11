/**
 * Production-Safe Logger for React
 * Only logs errors in production, full logging in development
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log info messages (development only)
   */
  info: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log warnings (always logged)
   */
  warn: (...args) => {
    console.warn(...args);
  },

  /**
   * Log errors (always logged)
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Log debug messages (development only)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Log success messages (development only)
   */
  success: (...args) => {
    if (isDevelopment) {
      console.log('✅', ...args);
    }
  }
};

export default logger;
