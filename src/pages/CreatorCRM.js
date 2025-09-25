import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/CreatorCRM.module.css";

const CreatorCRM = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    document.title = "Creator CRM | AURAX AI";
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${isLoaded ? styles.loaded : ""}`}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroIcon}>👥</div>
          <h1 className={styles.title}>Creator CRM</h1>
          <p className={styles.subtitle}>
            Enterprise-grade relationship management for scaling creator
            partnerships
          </p>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>Ready to Transform?</h2>
          <p className={styles.ctaText}>
            Start managing creator relationships at scale with AI-powered
            insights
          </p>
          <div className={styles.buttonGroup}>
            <button
              className={styles.primaryButton}
              onClick={() => navigate("/brand-login")}
            >
              Get Started
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => navigate("/")}
            >
              ← Back Home
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CreatorCRM;
