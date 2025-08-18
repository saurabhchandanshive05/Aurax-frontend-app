import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/AIMarketing.module.css";

const AIMarketing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "AI-Powered Marketing | Our Services";
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>AI-Powered Marketing</h1>
        <p className={styles.subtitle}>
          Autonomous optimization for influencer campaigns
        </p>
      </div>

      <div className={styles.content}>
        <h2>Dynamic Campaign Optimization</h2>
        <p>
          Our AI applies machine learning to analyze real-time engagement
          metrics, dynamically adjusting posting schedules, budgets, and
          messaging to maximize impact.
        </p>

        <div className={styles.features}>
          <h3>Key Benefits:</h3>
          <ul>
            <li>Real-time budget reallocation</li>
            <li>Audience-specific messaging</li>
            <li>Predictive performance optimization</li>
            <li>Continuous learning algorithms</li>
            <li>Automated A/B testing</li>
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

export default AIMarketing;
