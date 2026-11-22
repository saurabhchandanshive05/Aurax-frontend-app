import React, { useEffect, useState } from "react";
import Icon from "../components/ui/Icon";
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
          <span className={styles.heroIcon}><Icon name="search" size={44} /></span>
          <h1 className={styles.title}>Influencer Discovery</h1>
          <p className={styles.subtitle}>
            Search reviewed creators by name, niche or city, or let the AURAX team shortlist them for
            you
          </p>
        </section>

        {/* Features Grid */}
        <section className={styles.featuresContainer}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><Icon name="target" size={28} /></div>
              <h3 className={styles.featureTitle}>Shortlists from the team</h3>
              <p className={styles.featureDescription}>
                Tell us your niche, city and budget and the AURAX team shortlists reviewed creators
                who fit
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><Icon name="chart" size={28} /></div>
              <h3 className={styles.featureTitle}>Numbers you can check</h3>
              <p className={styles.featureDescription}>
                Follower counts from connected Instagram accounts are marked verified; self-reported
                numbers are labelled
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><Icon name="sparkle" size={28} /></div>
              <h3 className={styles.featureTitle}>Search it yourself</h3>
              <p className={styles.featureDescription}>
                Browse approved creators by name, niche or city on the Find creators page
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>
            Find creators for your brand
          </h2>
          <p className={styles.ctaDescription}>
            Browse reviewed creators yourself, or tell us what you need and we'll shortlist them.
          </p>
          <button
            className={styles.primaryButton}
            onClick={() => navigate("/brand/login")}
          >
            Get Started →
          </button>
        </section>
      </div>
    </div>
  );
};

export default InfluencerDiscovery;
