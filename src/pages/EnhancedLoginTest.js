// Enhanced Login Component Test Page
import React from "react";
import EnhancedLogin from "./EnhancedLogin";
import "./Login.module.css";

const EnhancedLoginTest = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          paddingTop: "50px",
        }}
      >
        <h1
          style={{
            color: "white",
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
        >
          🚀 Aurax AI Login
        </h1>

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          }}
        >
          <EnhancedLogin />
        </div>

        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "white",
          }}
        >
          <h3>🧪 Test Instructions:</h3>
          <ul style={{ lineHeight: "1.6" }}>
            <li>Toggle between Password and OTP login methods</li>
            <li>Test OTP request functionality</li>
            <li>Verify form validation</li>
            <li>Check responsive design</li>
            <li>Test countdown timer for OTP</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoginTest;
