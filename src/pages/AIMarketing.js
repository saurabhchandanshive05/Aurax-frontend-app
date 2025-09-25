import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/AIMarketing.module.css";

const AIMarketing = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    document.title = "AI Marketing | AURAX AI";
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${isLoaded ? styles.loaded : ""}`}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroIcon}>🚀</div>
          <h1 className={styles.title}>AI Marketing</h1>
          <p className={styles.subtitle}>
            Next-generation AI-powered marketing automation for influencer
            campaigns
          </p>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>Ready to Transform?</h2>
          <p className={styles.ctaText}>
            Revolutionize your marketing campaigns with AI-driven insights and
            automation
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

export default AIMarketing;
