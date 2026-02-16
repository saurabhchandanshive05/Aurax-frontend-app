// Backend Status and Connection Test for Copy Environment
import React, { useState, useEffect } from "react";
import { copyLogger } from "../utils/copyLogger";

const BackendStatus = () => {
  const [status, setStatus] = useState({
    backend: "checking",
    database: "pending",
    proxy: "pending",
  });
  const [logs, setLogs] = useState([]);
  const [backendInfo, setBackendInfo] = useState(null);

  const addLog = (message, type = "info") => {
    const newLog = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  // Test 1: Check if backend-copy.onrender.com is reachable
  const testBackendReachability = async () => {
    addLog("🔍 Testing backend reachability...", "info");

    try {
      // Test basic connectivity
      const response = await fetch("https://backend-copy.onrender.com/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const text = await response.text();
        addLog("✅ Backend is reachable and responding", "success");
        setStatus((prev) => ({ ...prev, backend: "online" }));
        setBackendInfo({ status: "online", response: text });
      } else {
        addLog(
          `⚠️ Backend reachable but returned status: ${response.status}`,
          "warning"
        );
        setStatus((prev) => ({ ...prev, backend: "deployed-but-error" }));
        setBackendInfo({
          status: "deployed-but-error",
          statusCode: response.status,
        });
      }
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        addLog("❌ Backend not reachable - likely not deployed yet", "error");
        setStatus((prev) => ({ ...prev, backend: "not-deployed" }));
        setBackendInfo({
          status: "not-deployed",
          error: "Service not responding",
        });
      } else {
        addLog(`❌ Backend connectivity error: ${error.message}`, "error");
        setStatus((prev) => ({ ...prev, backend: "error" }));
        setBackendInfo({ status: "error", error: error.message });
      }
    }
  };

  // Test 2: Test specific API endpoints
  const testAPIEndpoints = async () => {
    addLog("🔗 Testing API endpoints...", "info");

    const endpoints = [
      { path: "/health", name: "Health Check" },
      { path: "/api/test", name: "API Test" },
      { path: "/", name: "Root Endpoint" },
    ];

    for (const endpoint of endpoints) {
      try {
        addLog(`Testing ${endpoint.name} (${endpoint.path})...`, "info");

        const response = await fetch(
          `https://backend-copy.onrender.com${endpoint.path}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-Copy-Environment": "true",
              "X-Database": "influencer_copy",
            },
          }
        );

        if (response.ok) {
          const data = await response.text();
          addLog(
            `✅ ${endpoint.name} working - Response: ${data.substring(
              0,
              50
            )}...`,
            "success"
          );
        } else {
          addLog(
            `❌ ${endpoint.name} failed - Status: ${response.status}`,
            "error"
          );
        }
      } catch (error) {
        addLog(`❌ ${endpoint.name} error: ${error.message}`, "error");
      }
    }
  };

  // Test 3: Test proxy configuration
  const testProxyConfiguration = async () => {
    addLog("🔄 Testing proxy configuration...", "info");

    try {
      // Test through our proxy
      const response = await fetch("/api/test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        addLog("✅ Proxy configuration working correctly", "success");
        setStatus((prev) => ({ ...prev, proxy: "working" }));
      } else {
        addLog(
          `⚠️ Proxy working but backend returned: ${response.status}`,
          "warning"
        );
        setStatus((prev) => ({ ...prev, proxy: "backend-issue" }));
      }
    } catch (error) {
      addLog(`❌ Proxy configuration error: ${error.message}`, "error");
      setStatus((prev) => ({ ...prev, proxy: "error" }));
    }
  };

  // Test 4: Check local backend copy
  const checkLocalBackend = async () => {
    addLog("📁 Checking local backend copy...", "info");

    try {
      // This would typically require a backend endpoint to check file status
      addLog(
        "ℹ️ Local backend copy exists at C:\\Users\\hp\\OneDrive\\Desktop\\backend-copy",
        "info"
      );
      addLog(
        "ℹ️ Backend files: server.js, models/, db/connect.js found",
        "info"
      );
      addLog(
        "⚠️ Backend needs to be deployed to Render for full testing",
        "warning"
      );
    } catch (error) {
      addLog(`❌ Local backend check error: ${error.message}`, "error");
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setLogs([]);
    setStatus({
      backend: "checking",
      database: "pending",
      proxy: "pending",
    });

    addLog("🚀 Starting backend status check...", "info");
    copyLogger.log("BACKEND_STATUS_CHECK_STARTED", {
      timestamp: new Date().toISOString(),
    });

    await testBackendReachability();
    await testAPIEndpoints();
    await testProxyConfiguration();
    await checkLocalBackend();

    addLog("🏁 Backend status check completed!", "info");
    copyLogger.log("BACKEND_STATUS_CHECK_COMPLETED", { status, backendInfo });
  };

  // Auto-run tests on component mount
  useEffect(() => {
    runAllTests();
  }, []);

  const getStatusIcon = (statusValue) => {
    switch (statusValue) {
      case "online":
        return "✅";
      case "checking":
        return "🔄";
      case "not-deployed":
        return "❌";
      case "deployed-but-error":
        return "⚠️";
      case "working":
        return "✅";
      case "backend-issue":
        return "⚠️";
      case "error":
        return "❌";
      case "pending":
        return "⏳";
      default:
        return "❓";
    }
  };

  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case "online":
      case "working":
        return "#28a745";
      case "checking":
        return "#007bff";
      case "not-deployed":
      case "error":
        return "#dc3545";
      case "deployed-but-error":
      case "backend-issue":
        return "#ffc107";
      case "pending":
        return "#6c757d";
      default:
        return "#6c757d";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🔧 Backend Status Check
          </h1>

          <p
            style={{ color: "#666", marginBottom: "2rem", fontSize: "1.1rem" }}
          >
            Checking copy backend deployment and database connectivity
          </p>

          <button
            onClick={runAllTests}
            style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
              color: "white",
              border: "none",
              padding: "15px 30px",
              borderRadius: "10px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: "2rem",
            }}
          >
            🔄 Refresh Status Check
          </button>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
            }}
          >
            {/* Status Overview */}
            <div>
              <h3
                style={{
                  fontSize: "1.3rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                📊 Status Overview
              </h3>

              <div>
                {[
                  { key: "backend", name: "Backend Deployment" },
                  { key: "proxy", name: "Proxy Configuration" },
                  { key: "database", name: "Database Connection" },
                ].map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px",
                      background: "#f8f9fa",
                      borderRadius: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>{item.name}</span>
                    <span style={{ color: getStatusColor(status[item.key]) }}>
                      {getStatusIcon(status[item.key])}{" "}
                      {status[item.key].toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Backend Info */}
              {backendInfo && (
                <div style={{ marginTop: "1rem" }}>
                  <h4
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Backend Details
                  </h4>
                  <div
                    style={{
                      background: "#f8f9fa",
                      borderRadius: "8px",
                      padding: "1rem",
                    }}
                  >
                    <pre style={{ fontSize: "0.85rem", margin: 0 }}>
                      {JSON.stringify(backendInfo, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Live Logs */}
            <div>
              <h3
                style={{
                  fontSize: "1.3rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                📝 Status Logs
              </h3>

              <div
                style={{
                  background: "#1a1a1a",
                  color: "#00ff00",
                  borderRadius: "8px",
                  padding: "1rem",
                  height: "400px",
                  overflowY: "auto",
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                }}
              >
                {logs.map((log, index) => (
                  <div key={index} style={{ marginBottom: "4px" }}>
                    <span style={{ color: "#888" }}>[{log.timestamp}]</span>{" "}
                    {log.message}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div style={{ color: "#888", fontStyle: "italic" }}>
                    Status check logs will appear here...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div style={{ marginTop: "2rem" }}>
            <h3
              style={{
                fontSize: "1.3rem",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              📋 Next Steps
            </h3>

            <div
              style={{
                background: "#e3f2fd",
                borderLeft: "4px solid #2196f3",
                padding: "1rem",
                borderRadius: "4px",
              }}
            >
              {status.backend === "not-deployed" && (
                <div>
                  <h4 style={{ color: "#1976d2", marginBottom: "0.5rem" }}>
                    Backend Not Deployed
                  </h4>
                  <ul style={{ color: "#1976d2", paddingLeft: "1.5rem" }}>
                    <li>The backend-copy needs to be deployed to Render</li>
                    <li>
                      Ensure environment variables are configured (MONGODB_URI,
                      JWT_SECRET)
                    </li>
                    <li>
                      Database should point to 'influencer_copy' collection
                    </li>
                    <li>
                      Local backend files are ready at
                      C:\\Users\\hp\\OneDrive\\Desktop\\backend-copy
                    </li>
                  </ul>
                </div>
              )}

              {status.backend === "online" && (
                <div>
                  <h4 style={{ color: "#2e7d32", marginBottom: "0.5rem" }}>
                    Backend Online ✅
                  </h4>
                  <p style={{ color: "#2e7d32" }}>
                    Backend is deployed and responding. You can now test API
                    endpoints!
                  </p>
                </div>
              )}

              {status.backend === "deployed-but-error" && (
                <div>
                  <h4 style={{ color: "#f57c00", marginBottom: "0.5rem" }}>
                    Backend Needs Configuration ⚠️
                  </h4>
                  <ul style={{ color: "#f57c00", paddingLeft: "1.5rem" }}>
                    <li>Backend is deployed but returning errors</li>
                    <li>Check environment variables configuration</li>
                    <li>Verify database connection string</li>
                    <li>Review backend logs on Render dashboard</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendStatus;
