import React, { useEffect, useState } from "react";
import Icon from "../components/ui/Icon";
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
            <span className={styles.heroIcon}><Icon name="image" size={44} /></span>
          </div>
          <h1 className={styles.heroTitle}>UGC Automation</h1>
          <p className={styles.heroSubtitle}>
            User-generated content made by reviewed creators, briefed and coordinated by the
            AURAX team
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><Icon name="sparkle" size={28} /></div>
            <h3>Real creators</h3>
            <p>Content is made by reviewed creators, not generated</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><Icon name="chart" size={28} /></div>
            <h3>Clear briefs</h3>
            <p>What you need, by when, and in which format, agreed up front</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><Icon name="refresh" size={28} /></div>
            <h3>One point of contact</h3>
            <p>The AURAX team coordinates every creator on your campaign</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            Get UGC made by reviewed creators
          </h2>
          <p className={styles.ctaDescription}>
            Tell us what content you need and we'll find creators to make it.
          </p>
          <div className={styles.ctaButtons}>
            <button
              className={styles.primaryButton}
              onClick={() => navigate("/brand/login")}
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
