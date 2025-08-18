import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/UGCAutomation.module.css";

const UGCAutomation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "UGC Automation | Our Services";
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>UGC Automation</h1>
        <p className={styles.subtitle}>
          Automated content creation with human-like authenticity
        </p>
      </div>

      <div className={styles.content}>
        <h2>Platform-Optimized Content</h2>
        <p>
          Our AI generates automated briefs aligned with trending themes and
          edits influencer content into platform-specific formats while
          maintaining brand safety and authenticity.
        </p>

        <div className={styles.features}>
          <h3>Key Benefits:</h3>
          <ul>
            <li>AI-generated captions and hashtags for maximum reach</li>
            <li>Automated video editing for cross-platform posting</li>
            <li>Real-time identification of top-performing UGC</li>
            <li>Brand safety filters for compliant content</li>
            <li>Trend-aligned content briefs</li>
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

export default UGCAutomation;
