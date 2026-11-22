import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/ui/Icon";
import useAudienceNumbers from "./useAudienceNumbers";
import styles from "./Audience.module.css";

// For Brands: what AURAX offers brands today. Every item describes a feature that exists.
// (The previous version showed invented success stories, a "95% accuracy" claim and placeholder
// prices such as "$XX9/month"; those were removed. BrandPage.css is no longer used.)
const FEATURES = [
  {
    icon: "check-circle",
    title: "Only reviewed creators",
    text: "The AURAX team reviews every creator before they appear, so you're choosing from real, active profiles.",
  },
  {
    icon: "search",
    title: "Browse creators yourself",
    text: "Search approved creators by name, niche or city and open their public pages.",
  },
  {
    icon: "instagram",
    title: "Numbers you can trust",
    text: "Follower counts from a connected Instagram account are marked as verified; self-reported numbers are labelled as such.",
  },
  {
    icon: "live",
    title: "A LIVE board for your brief",
    text: "Your campaign can go on the LIVE board, where creators who fit can tell us they're interested.",
  },
];

const BrandsPage = () => {
  const { liveCampaigns, creators } = useAudienceNumbers();

  useEffect(() => {
    document.title = "For Brands | AURAX";
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`${styles.wrap} ${styles.heroGrid}`}>
          <div>
            <p className={styles.eyebrow}>For brands</p>
            <h1 className={styles.title}>Brief reviewed creators, not a cold list</h1>
            <p className={styles.lede}>
              Tell us your niche, city, budget and timeline. The AURAX team shortlists reviewed
              creators who fit, or you can browse and pick them yourself.
            </p>
            <div className={styles.actions}>
              <Link to="/inquiry/form?purpose=campaign" className="ax-btn ax-btn--primary">
                Post a requirement
              </Link>
              <Link to="/creators" className="ax-btn ax-btn--ghost">
                Browse creators
              </Link>
            </div>
          </div>
          {(liveCampaigns !== null || creators !== null) && (
            <dl className={styles.numbers} aria-label="AURAX right now">
              {creators !== null && (
                <div className={styles.number}>
                  <dt>Reviewed creators with a public page</dt>
                  <dd>{creators}</dd>
                </div>
              )}
              {liveCampaigns !== null && (
                <div className={styles.number}>
                  <dt>Live brand campaigns</dt>
                  <dd>{liveCampaigns}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="brand-steps">
        <div className={styles.wrap}>
          <h2 id="brand-steps" className={styles.sectionTitle}>How it works</h2>
          <p className={styles.sectionLede}>From brief to a shortlist of creators who fit.</p>
          <ol className={`${styles.steps} ${styles.three}`}>
            <li className={styles.step}>
              <h3>Post a requirement</h3>
              <p>Niche, city, budget, timeline and what you need made. It takes a couple of minutes.</p>
            </li>
            <li className={styles.step}>
              <h3>We shortlist creators</h3>
              <p>The team matches your brief against reviewed creators and gets back to you.</p>
            </li>
            <li className={styles.step}>
              <h3>You choose</h3>
              <p>Pick the creators you want to work with and we connect you.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="brand-features">
        <div className={styles.wrap}>
          <h2 id="brand-features" className={styles.sectionTitle}>What you get</h2>
          <p className={styles.sectionLede}>A smaller, better list instead of thousands of unknown profiles.</p>
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
              <h2>Pricing</h2>
              <p>
                Pricing depends on the campaign: how many creators, what they make and for how long.
                Post your requirement or talk to us and we'll send a quote.
              </p>
            </div>
            <div className={styles.actions}>
              <Link to="/inquiry/form?purpose=campaign" className="ax-btn ax-btn--primary">
                Get a quote
              </Link>
              <Link to="/contact" className="ax-btn ax-btn--ghost">
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BrandsPage;
