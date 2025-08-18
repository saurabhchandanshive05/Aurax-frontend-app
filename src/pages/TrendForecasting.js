import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/TrendForecasting.module.css';

const TrendForecasting = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Trend Forecasting | Our Services";
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Trend Forecasting</h1>
        <p className={styles.subtitle}>Predictive analytics for emerging creator opportunities</p>
      </div>

      <div className={styles.content}>
        <h2>Proactive Trend Intelligence</h2>
        <p>
          Our AI scans millions of social signals to detect emerging trends, empowering your brand 
          to lead rather than follow. With seasonal trend maps and competitor insights, you'll always 
          be one step ahead.
        </p>
        
        <div className={styles.features}>
          <h3>Key Benefits:</h3>
          <ul>
            <li>Early viral trend detection</li>
            <li>Seasonal trend mapping</li>
            <li>Competitor gap analysis</li>
            <li>Emerging niche identification</li>
            <li>Cultural moment prediction</li>
          </ul>
        </div>
      </div>

      <button onClick={() => navigate('/specialization')} className={styles.backButton}>
        ← Back to Specializations
      </button>
    </div>
  );
};

export default TrendForecasting;