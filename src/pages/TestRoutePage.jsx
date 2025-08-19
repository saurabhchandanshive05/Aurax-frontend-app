import React from "react";
import { Link } from "react-router-dom";

const TestRoutePage = () => {
  return (
    <div
      style={{
        padding: "50px",
        textAlign: "center",
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      }}
    >
      <h1 style={{ color: "#fff", marginBottom: "30px" }}>
        Route Testing Page
      </h1>
      <p style={{ color: "#fff", marginBottom: "30px" }}>
        If you can see this page, routing is working correctly!
      </p>

      <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
        <Link
          to="/about"
          style={{
            padding: "15px 30px",
            background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
            color: "white",
            borderRadius: "30px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Go to About Page
        </Link>

        <Link
          to="/"
          style={{
            padding: "15px 30px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "2px solid #00ffff",
            color: "#00ffff",
            borderRadius: "30px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default TestRoutePage;
