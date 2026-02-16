import { useEffect, useState } from "react";

export default function ConnectionTest() {
  const [status, setStatus] = useState("testing");
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch("/api/test");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setStatus("connected");
      } catch (err) {
        setStatus("failed");
        setError(err.message);
        console.error("Connection test failed:", err);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Backend Connection Test</h2>
      <div
        style={{
          padding: "15px",
          margin: "10px 0",
          backgroundColor:
            status === "connected"
              ? "#d4edda"
              : status === "failed"
              ? "#f8d7da"
              : "#fff3cd",
          color: "#155724",
          borderRadius: "4px",
        }}
      >
        {status === "connected" && (
          <p>✅ Successfully connected to backend at: http://localhost:5001</p>
        )}
        {status === "failed" && (
          <>
            <p>❌ Failed to connect to backend</p>
            <p>Error: {error}</p>
          </>
        )}
        {status === "testing" && <p>⏳ Testing connection to backend...</p>}
      </div>

      {status === "failed" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Troubleshooting Steps:</h3>
          <ol>
            <li>Verify backend is running (check terminal)</li>
            <li>
              Test backend directly:
              <a
                href="http://localhost:5001/api/test"
                target="_blank"
                rel="noopener noreferrer"
              >
                http://localhost:5001/api/test
              </a>
            </li>
            <li>Check browser console for errors (F12 → Console)</li>
            <li>Verify no firewall is blocking ports 3000 or 5001</li>
          </ol>
        </div>
      )}
    </div>
  );
}
