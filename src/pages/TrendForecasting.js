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
        <p className={styles.subtitle}>What brands are asking for right now, from the briefs live on AURAX</p>
      </div>

      <div className={styles.content}>
        <h2>Read demand from real briefs</h2>
        <p>
          Every campaign on the AURAX LIVE board is a real brief from a brand. Looking across them
          shows which categories, platforms and creator sizes brands want right now, and the AURAX
          team uses that when matching creators to new briefs.
        </p>
        
        <div className={styles.features}>
          <h3>Key Benefits:</h3>
          <ul>
            <li>See the categories brands are posting in</li>
            <li>See which platforms they want content for</li>
            <li>Spot hand-picked campaigns from the AURAX team</li>
            <li>Apply to briefs that fit you</li>
          </ul>
        </div>
      </div>

      <button onClick={() => navigate('/', { state: { scrollToServices: true } })} className={styles.backButton}>
        ← Back to Specializations
      </button>
    </div>
  );
};

export default TrendForecasting;