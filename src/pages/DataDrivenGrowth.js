import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/DataDrivenGrowth.module.css";

const DataDrivenGrowth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Data-Driven Growth | Our Services";
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
        <div className={styles.hero}>
          <h1>Data-Driven Growth</h1>
          <p className={styles.subtitle}>
            Growth strategies powered by neural analytics
          </p>
        </div>

        <div className={styles.content}>
          <h2>Actionable Insights</h2>
          <p>
            Our unified dashboards track ROI, conversions, and engagement in
            real time, providing the insights you need to refine campaigns and
            fuel growth. With AI-powered analytics, every decision is backed by
            data.
          </p>

          <div className={styles.features}>
            <h3>Key Benefits:</h3>
            <ul>
              <li>Cross-platform analytics consolidation</li>
              <li>Real-time ROI tracking</li>
              <li>Adaptive learning algorithms</li>
              <li>Direct sales attribution</li>
              <li>Performance benchmarking</li>
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
    </div>
  );
};

export default DataDrivenGrowth;
