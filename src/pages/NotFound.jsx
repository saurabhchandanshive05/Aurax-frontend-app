import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./NotFound.module.css";

// Shown for any URL that doesn't match a page (it used to redirect silently to the homepage,
// which made mistyped or outdated links look like the site had lost the visitor's place).
const NotFound = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const previous = document.title;
    document.title = "Page not found | AURAX";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="not-found-title">
        <p className={styles.code} aria-hidden="true">404</p>
        <h1 id="not-found-title" className={styles.title}>
          This page doesn't exist
        </h1>
        <p className={styles.text}>
          <code className={styles.path}>{pathname}</code> isn't a page on AURAX. The link may be
          mistyped or out of date.
        </p>
        <div className={styles.actions}>
          <Link to="/" className="ax-btn ax-btn--primary">
            Go to the homepage
          </Link>
          <Link to="/live/campaigns" className="ax-btn ax-btn--ghost">
            See LIVE campaigns
          </Link>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
