import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Audience.module.css";

// Careers. (This page used to be a generic "Coming Soon" placeholder saying the creator dashboard
// and login were "70% complete"; both have shipped. ComingSoonPage.css is no longer used here.)
function CareersPage() {
  useEffect(() => {
    document.title = "Careers | AURAX";
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Careers</p>
          <h1 className={styles.title}>Work with AURAX</h1>
          <p className={styles.lede}>
            There are no open roles listed right now. If you'd like to work with us in creator
            partnerships, brand success or engineering, write to us and tell us what you'd like to do.
          </p>
          <div className={styles.actions}>
            <a
              href="mailto:hello@auraxai.in?subject=Working%20with%20AURAX"
              className="ax-btn ax-btn--primary"
            >
              Email hello@auraxai.in
            </a>
            <Link to="/about" className="ax-btn ax-btn--ghost">
              About AURAX
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default CareersPage;
