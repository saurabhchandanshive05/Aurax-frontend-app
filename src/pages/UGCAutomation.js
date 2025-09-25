import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/UGCAutomation.module.css";

const UGCAutomation = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    document.title = "UGC Automation | AURAX AI";
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={`${styles.hero} ${isVisible ? styles.visible : ""}`}>
        <div className={styles.heroContent}>
          <div className={styles.iconContainer}>
            <span className={styles.heroIcon}>🤖</span>
          </div>
          <h1 className={styles.heroTitle}>UGC Automation</h1>
          <p className={styles.heroSubtitle}>
            Automate user-generated content creation and amplify authentic brand
            engagement at scale
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>Smart Generation</h3>
            <p>AI-powered content creation that maintains authenticity</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Performance Analytics</h3>
            <p>Real-time insights and engagement optimization</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔄</div>
            <h3>Workflow Automation</h3>
            <p>Streamlined processes from creation to distribution</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            Ready to Transform Your UGC Strategy?
          </h2>
          <p className={styles.ctaDescription}>
            Join leading brands automating their content creation workflow
          </p>
          <div className={styles.ctaButtons}>
            <button
              className={styles.primaryButton}
              onClick={() => navigate("/brand-login")}
            >
              Get Started
            </button>
            <button
              className={styles.secondaryButton}
              onClick={() => navigate("/")}
            >
              ← Back Home
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UGCAutomation;
