import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/InfluencerDiscovery.module.css";

const InfluencerDiscovery = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    document.title = "Influencer Discovery | AURAX AI";
    const timer = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${isLoaded ? styles.loaded : ""}`}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <span className={styles.heroIcon}>🔍</span>
          <h1 className={styles.title}>Influencer Discovery</h1>
          <p className={styles.subtitle}>
            AI-powered creator discovery with advanced matching algorithms and
            comprehensive analytics for precision targeting
          </p>
        </section>

        {/* Features Grid */}
        <section className={styles.featuresContainer}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎯</div>
              <h3 className={styles.featureTitle}>Smart Matching</h3>
              <p className={styles.featureDescription}>
                Precision targeting with AI-driven creator recommendations based
                on audience demographics, engagement rates, and brand alignment
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3 className={styles.featureTitle}>Deep Analytics</h3>
              <p className={styles.featureDescription}>
                Comprehensive insights into creator performance, audience
                behavior, and campaign effectiveness with real-time data
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3 className={styles.featureTitle}>Instant Discovery</h3>
              <p className={styles.featureDescription}>
                Lightning-fast search across millions of creator profiles with
                advanced filtering and sorting capabilities
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>
            Ready to Transform Your Creator Discovery?
          </h2>
          <p className={styles.ctaDescription}>
            Discover and connect with the perfect creators for your brand with
            AI-powered precision matching and comprehensive analytics
          </p>
          <button
            className={styles.primaryButton}
            onClick={() => navigate("/brand-login")}
          >
            Get Started →
          </button>
        </section>
      </div>
    </div>
  );
};

export default InfluencerDiscovery;
