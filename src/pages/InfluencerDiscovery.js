import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/InfluencerDiscovery.module.css";

const InfluencerDiscovery = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Influencer Discovery | Our Services";
  }, []);

  const handleBackClick = () => {
    navigate("/specialization");
  };

  return (
    <div className={styles.container} style={{ paddingTop: "80px" }}>
      <div className={styles.hero}>
        <h1>Influencer Discovery</h1>
        <p className={styles.subtitle}>
          AI-powered matching with perfect creator partnerships
        </p>
      </div>

      <div className={styles.content}>
        <h2>Precision Matching</h2>
        <p>
          Our AI analyzes audience authenticity, behavioral alignment, and
          historical performance to connect you with influencers who drive real
          results.
        </p>

        <div className={styles.features}>
          <h3>Key Benefits:</h3>
          <ul>
            <li>Multi-dimensional creator filters</li>
            <li>Fake follower detection</li>
            <li>Audience overlap analysis</li>
            <li>Behavioral alignment scoring</li>
            <li>Historical performance insights</li>
          </ul>
        </div>
      </div>

      <button onClick={handleBackClick} className={styles.backButton}>
        ← Back to Specializations
      </button>
    </div>
  );
};

export default InfluencerDiscovery;
