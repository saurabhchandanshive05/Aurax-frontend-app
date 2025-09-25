import React, { useState } from "react";
import { apiClient } from "../utils/apiClient";

const AuthTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name, testFn) => {
    setLoading(true);
    try {
      const result = await testFn();
      setTestResults((prev) => ({
        ...prev,
        [name]: { success: true, data: result },
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [name]: { success: false, error: error.message },
      }));
    }
    setLoading(false);
  };

  const testBackendHealth = () => {
    testEndpoint("health", () =>
      fetch("http://localhost:5003/api/health").then((r) => r.json())
    );
  };

  const testRegistration = () => {
    const testUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@test.com`,
      phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      password: "testpass123",
      role: "creator",
    };

    testEndpoint("register", () => apiClient.register(testUser));
  };

  const testLogin = () => {
    testEndpoint("login", () =>
      apiClient.login({
        emailOrPhone: "test@test.com",
        password: "testpass123",
      })
    );
  };

  const testInstagramOAuth = () => {
    testEndpoint("instagram_oauth", () => apiClient.getInstagramOAuthURL());
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Authentication Test Page</h1>
      <p>
        Backend URL: <strong>http://localhost:5003/api</strong>
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button onClick={testBackendHealth} disabled={loading}>
          Test Backend Health
        </button>
        <button onClick={testRegistration} disabled={loading}>
          Test Registration
        </button>
        <button onClick={testLogin} disabled={loading}>
          Test Login
        </button>
        <button onClick={testInstagramOAuth} disabled={loading}>
          Test Instagram OAuth URL
        </button>
      </div>

      <div>
        <h2>Test Results:</h2>
        {Object.entries(testResults).map(([name, result]) => (
          <div
            key={name}
            style={{
              marginBottom: "15px",
              padding: "10px",
              border: `2px solid ${result.success ? "green" : "red"}`,
              borderRadius: "8px",
            }}
          >
            <h3 style={{ color: result.success ? "green" : "red" }}>
              {name.toUpperCase()}: {result.success ? "SUCCESS" : "FAILED"}
            </h3>
            {result.success ? (
              <pre
                style={{
                  backgroundColor: "#f0f8f0",
                  padding: "10px",
                  borderRadius: "4px",
                }}
              >
                {JSON.stringify(result.data, null, 2)}
              </pre>
            ) : (
              <div
                style={{
                  color: "red",
                  backgroundColor: "#fff0f0",
                  padding: "10px",
                  borderRadius: "4px",
                }}
              >
                <strong>Error:</strong> {result.error}
              </div>
            )}
          </div>
        ))}
      </div>

      {loading && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          Testing...
        </div>
      )}
    </div>
  );
};

export default AuthTest;
