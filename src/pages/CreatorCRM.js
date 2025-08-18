import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/CreatorCRM.module.css";

const CreatorCRM = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Creator CRM Systems | Our Services";
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Creator CRM Systems</h1>
        <p className={styles.subtitle}>
          Intelligent relationship management for creators
        </p>
      </div>

      <div className={styles.content}>
        <h2>Centralized Creator Management</h2>
        <p>
          Our AI-powered CRM consolidates profiles, automates communications,
          and tracks performance - scaling influencer programs from 10 to 10,000
          creators without administrative chaos.
        </p>

        <div className={styles.features}>
          <h3>Key Benefits:</h3>
          <ul>
            <li>Automated contract and payment workflows</li>
            <li>Holistic KPI scoring (engagement, conversions, sentiment)</li>
            <li>AI-driven rebooking recommendations</li>
            <li>Centralized creator profiles and history</li>
            <li>Automated follow-ups and reminders</li>
          </ul>
        </div>
      </div>

      <button
        onClick={() => navigate("/specialization")}
        className={styles.backButton}
      >
        ← Back to Specializations
      </button>
    </div>
  );
};

export default CreatorCRM;
