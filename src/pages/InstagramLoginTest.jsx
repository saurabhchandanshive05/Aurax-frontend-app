import React, { useState } from "react";
import { motion } from "framer-motion";
import InstagramAPI from "../utils/instagramAPI";
import styles from "./InstagramLoginTest.module.css";

const InstagramLoginTest = () => {
  const [testStatus, setTestStatus] = useState("idle");
  const [testResults, setTestResults] = useState(null);
  const [quickTestResults, setQuickTestResults] = useState(null);

  const runQuickTest = async () => {
    setTestStatus("testing-quick");
    setQuickTestResults(null);

    try {
      const result = await InstagramAPI.quickAuthTest();
      setQuickTestResults(result);
      setTestStatus("idle");
    } catch (error) {
      setQuickTestResults({
        success: false,
        error: error.message,
        message: "Test execution failed",
      });
      setTestStatus("idle");
    }
  };

  const runFullTest = async () => {
    setTestStatus("testing-full");
    setTestResults(null);

    try {
      const result = await InstagramAPI.testConnection();
      setTestResults(result);
      setTestStatus("idle");
    } catch (error) {
      setTestResults({
        status: "error",
        message: "Test execution failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      setTestStatus("idle");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "testing-quick":
      case "testing-full":
        return "🔄";
      case "success":
        return "✅";
      case "error":
        return "❌";
      default:
        return "🧪";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={styles.testContainer}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>🧪 Instagram API Login Test</h1>
        <p className={styles.subtitle}>
          Test your Instagram API authentication and connection
        </p>
      </div>

      {/* API Token Display */}
      <div className={styles.tokenSection}>
        <h3>🔑 Current Access Token</h3>
        <div className={styles.tokenDisplay}>
          <code>
            {InstagramAPI.accessToken
              ? `${InstagramAPI.accessToken.substring(
                  0,
                  20
                )}...${InstagramAPI.accessToken.substring(
                  InstagramAPI.accessToken.length - 10
                )}`
              : "No token configured"}
          </code>
        </div>
        <p className={styles.tokenNote}>
          {InstagramAPI.accessToken
            ? "✅ Token is configured"
            : "❌ Token not found - check your .env file"}
        </p>
      </div>

      {/* Test Buttons */}
      <div className={styles.testButtons}>
        <button
          onClick={runQuickTest}
          disabled={testStatus === "testing-quick"}
          className={`${styles.testButton} ${styles.quickTest}`}
        >
          {testStatus === "testing-quick"
            ? "🔄 Testing..."
            : "⚡ Quick Auth Test"}
        </button>

        <button
          onClick={runFullTest}
          disabled={testStatus === "testing-full"}
          className={`${styles.testButton} ${styles.fullTest}`}
        >
          {testStatus === "testing-full"
            ? "🔄 Testing..."
            : "🔍 Full Connection Test"}
        </button>
      </div>

      {/* Quick Test Results */}
      {quickTestResults && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${styles.resultSection} ${
            quickTestResults.success ? styles.success : styles.error
          }`}
        >
          <h3>{quickTestResults.success ? "✅" : "❌"} Quick Test Results</h3>

          {quickTestResults.success ? (
            <div className={styles.successDetails}>
              <p>
                <strong>🎉 Authentication Successful!</strong>
              </p>
              <div className={styles.accountInfo}>
                <p>
                  <strong>Username:</strong> @{quickTestResults.data.username}
                </p>
                <p>
                  <strong>Account Type:</strong>{" "}
                  {quickTestResults.data.account_type}
                </p>
                <p>
                  <strong>User ID:</strong> {quickTestResults.data.id}
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.errorDetails}>
              <p>
                <strong>❌ Authentication Failed</strong>
              </p>
              <p>
                <strong>Error:</strong> {quickTestResults.error}
              </p>
              {quickTestResults.statusCode && (
                <p>
                  <strong>Status Code:</strong> {quickTestResults.statusCode}
                </p>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Full Test Results */}
      {testResults && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${styles.resultSection} ${
            testResults.status === "success" ? styles.success : styles.error
          }`}
        >
          <h3>{getStatusIcon(testResults.status)} Full Test Results</h3>

          {testResults.status === "success" ? (
            <div className={styles.successDetails}>
              <p>
                <strong>🎉 All Tests Passed!</strong>
              </p>

              {testResults.details && (
                <div className={styles.detailsGrid}>
                  <div className={styles.detailCard}>
                    <h4>📡 API Connectivity</h4>
                    <p>{testResults.details.apiConnectivity}</p>
                  </div>

                  <div className={styles.detailCard}>
                    <h4>🔑 Authentication</h4>
                    <p>{testResults.details.authentication}</p>
                  </div>

                  <div className={styles.detailCard}>
                    <h4>👤 Profile Access</h4>
                    <p>{testResults.details.profileAccess}</p>
                  </div>
                </div>
              )}

              {testResults.details?.accountInfo && (
                <div className={styles.accountInfo}>
                  <h4>📊 Account Information</h4>
                  <p>
                    <strong>Username:</strong> @
                    {testResults.details.accountInfo.username}
                  </p>
                  <p>
                    <strong>Account Type:</strong>{" "}
                    {testResults.details.accountInfo.accountType}
                  </p>
                  <p>
                    <strong>Followers:</strong>{" "}
                    {testResults.details.accountInfo.followers?.toLocaleString()}
                  </p>
                  <p>
                    <strong>Posts:</strong>{" "}
                    {testResults.details.accountInfo.posts}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.errorDetails}>
              <p>
                <strong>❌ Test Failed</strong>
              </p>
              <p>
                <strong>Error:</strong> {testResults.error}
              </p>

              {testResults.troubleshooting &&
                testResults.troubleshooting.length > 0 && (
                  <div className={styles.troubleshooting}>
                    <h4>🔧 Troubleshooting Steps</h4>
                    <ul>
                      {testResults.troubleshooting.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          <div className={styles.timestamp}>
            <small>
              Tested at: {new Date(testResults.timestamp).toLocaleString()}
            </small>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className={styles.instructions}>
        <h3>📋 Instructions</h3>
        <ol>
          <li>
            <strong>Quick Test:</strong> Validates your access token and basic
            authentication
          </li>
          <li>
            <strong>Full Test:</strong> Comprehensive test including profile
            data and media access
          </li>
          <li>If tests fail, check the troubleshooting steps provided</li>
          <li>
            Make sure your Instagram account is connected to a Facebook Page
          </li>
          <li>
            Ensure you have a Business or Creator Instagram account for insights
          </li>
        </ol>
      </div>

      {/* Console Instructions */}
      <div className={styles.consoleSection}>
        <h3>🖥️ Browser Console Test</h3>
        <p>You can also test directly in the browser console:</p>
        <div className={styles.codeBlock}>
          <code>
            {`// Quick test
InstagramAPI.quickAuthTest().then(console.log);

// Full test  
InstagramAPI.testConnection().then(console.log);`}
          </code>
        </div>
        <p>
          <small>
            Open Developer Tools (F12) → Console tab → Paste and run
          </small>
        </p>
      </div>
    </motion.div>
  );
};

export default InstagramLoginTest;
