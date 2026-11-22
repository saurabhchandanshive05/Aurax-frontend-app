import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/ui/Icon";
import useAudienceNumbers from "./useAudienceNumbers";
import styles from "./Audience.module.css";

// For Creators: what AURAX offers creators today. Every item describes a feature that exists.
const FEATURES = [
  {
    icon: "link",
    title: "A public page brands can find",
    text: "Your AURAX page shows your bio, niche, city and content, with one link to put in your Instagram bio.",
  },
  {
    icon: "instagram",
    title: "Real numbers from Instagram",
    text: "Connect your Instagram professional account and brands see your verified follower count, not a self-reported one.",
  },
  {
    icon: "live",
    title: "LIVE brand campaigns",
    text: "Brands post what they need on the LIVE board. Tell us you're interested and we check the fit and connect you.",
  },
  {
    icon: "package",
    title: "Your services and rates",
    text: "List the services you offer and what they cost on your page, so brands know what to ask for.",
  },
];

const ForCreators = () => {
  const { liveCampaigns, creators } = useAudienceNumbers();

  useEffect(() => {
    document.title = "For Creators | AURAX";
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`${styles.wrap} ${styles.heroGrid}`}>
          <div>
            <p className={styles.eyebrow}>For creators</p>
            <h1 className={styles.title}>Get found by brands that fit your niche</h1>
            <p className={styles.lede}>
              Build a public page, connect Instagram so brands see real numbers, and apply to brand
              campaigns that are live right now. Every creator is reviewed by the AURAX team.
            </p>
            <div className={styles.actions}>
              <Link to="/creator/signup" className="ax-btn ax-btn--primary">
                Join as a creator
              </Link>
              <Link to="/live/campaigns" className="ax-btn ax-btn--ghost">
                See LIVE campaigns
              </Link>
            </div>
          </div>
          {(liveCampaigns !== null || creators !== null) && (
            <dl className={styles.numbers} aria-label="AURAX right now">
              {liveCampaigns !== null && (
                <div className={styles.number}>
                  <dt>Live brand campaigns</dt>
                  <dd>{liveCampaigns}</dd>
                </div>
              )}
              {creators !== null && (
                <div className={styles.number}>
                  <dt>Creators with a public page</dt>
                  <dd>{creators}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="creator-steps">
        <div className={styles.wrap}>
          <h2 id="creator-steps" className={styles.sectionTitle}>How it works</h2>
          <p className={styles.sectionLede}>From sign-up to your first brand conversation.</p>
          <ol className={styles.steps}>
            <li className={styles.step}>
              <h3>Create your account</h3>
              <p>Sign up as a creator and verify your email.</p>
            </li>
            <li className={styles.step}>
              <h3>Tell us about you</h3>
              <p>Add your niche, city and Instagram handle so the team can review your profile.</p>
            </li>
            <li className={styles.step}>
              <h3>Get reviewed</h3>
              <p>The AURAX team reviews every creator before they're shown to brands.</p>
            </li>
            <li className={styles.step}>
              <h3>Publish and apply</h3>
              <p>Publish your public page and apply to LIVE campaigns that match you.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="creator-features">
        <div className={styles.wrap}>
          <h2 id="creator-features" className={styles.sectionTitle}>What you get</h2>
          <p className={styles.sectionLede}>Free to join.</p>
          <div className={styles.features}>
            {FEATURES.map((f) => (
              <article key={f.title} className={styles.feature}>
                <span className={styles.featureIcon}>
                  <Icon name={f.icon} size={20} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.closing}>
        <div className={styles.wrap}>
          <div className={styles.closingPanel}>
            <div>
              <h2>Ready to get started?</h2>
              <p>Create your account in a minute. Already have one? Sign in to your dashboard.</p>
            </div>
            <div className={styles.actions}>
              <Link to="/creator/signup" className="ax-btn ax-btn--primary">
                Join as a creator
              </Link>
              <Link to="/creator/login" className="ax-btn ax-btn--ghost">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ForCreators;
