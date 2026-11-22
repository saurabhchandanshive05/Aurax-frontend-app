import React, { useEffect, useState } from "react";
import Icon from "../components/ui/Icon";
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
          <div className={styles.heroIcon}><Icon name="users" size={44} /></div>
          <h1 className={styles.title}>Creator CRM</h1>
          <p className={styles.subtitle}>
            One place for the creators you work with: their public pages, verified stats and contact
            through AURAX
          </p>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>Talk to the AURAX team</h2>
          <p className={styles.ctaText}>
            Tell us what you need and the AURAX team will shortlist reviewed creators for it.
          </p>
          <div className={styles.buttonGroup}>
            <button
              className={styles.primaryButton}
              onClick={() => navigate("/brand/login")}
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
