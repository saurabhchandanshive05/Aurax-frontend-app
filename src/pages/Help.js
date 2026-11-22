import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Help.module.css";

// Help topics: each goes to the page where you do that task, or to the contact page when there
// is no self-serve page for it. The search box filters these topics as you type.
const CATEGORIES = [
  {
    title: "Getting Started",
    blurb: "Learn the basics of our platform",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    topics: [
      { label: "Setting up your account", to: "/signup", keywords: "sign up register create join" },
      { label: "Completing your profile", to: "/creator/dashboard", keywords: "bio photo niche creator" },
      { label: "Your first steps", to: "/live/campaigns", keywords: "start begin live campaigns" },
    ],
  },
  {
    title: "Account & Security",
    blurb: "Manage your account settings",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    topics: [
      { label: "Reset your password", to: "/forgot-password", keywords: "forgot password login sign in code" },
      { label: "Account security", to: "/contact", keywords: "hacked secure logout" },
      { label: "Privacy settings", to: "/contact", keywords: "privacy data delete" },
    ],
  },
  {
    title: "Campaigns",
    blurb: "Learn about creating and managing campaigns",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    topics: [
      { label: "Creating a campaign", to: "/inquiry/form?purpose=campaign", keywords: "post requirement brief brand" },
      { label: "Managing campaigns", to: "/brand/dashboard", keywords: "dashboard brand" },
      { label: "Understanding analytics", to: "/contact", keywords: "stats numbers report" },
    ],
  },
  {
    title: "Collaboration",
    blurb: "Working with creators and brands",
    icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
    topics: [
      { label: "Finding creators", to: "/creators", keywords: "search discover influencer" },
      { label: "Collaboration tools", to: "/contact", keywords: "message chat work together" },
      { label: "Payments & billing", to: "/contact", keywords: "pay invoice price money" },
    ],
  },
];

const Help = () => {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const visible = useMemo(() => {
    if (!q) return CATEGORIES;
    return CATEGORIES.map((c) => ({
      ...c,
      topics: c.topics.filter((t) =>
        `${t.label} ${t.keywords} ${c.title}`.toLowerCase().includes(q)
      ),
    })).filter((c) => c.topics.length > 0);
  }, [q]);

  const matchCount = visible.reduce((n, c) => n + c.topics.length, 0);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Help Center</h1>
        <p className={styles.subtitle}>
          Find answers to common questions and get started quickly
        </p>

        <form className={styles.searchBox} role="search" onSubmit={(e) => e.preventDefault()}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for help topics..."
            className={styles.searchInput}
            aria-label="Search help topics"
          />
          <button type="submit" className={styles.searchButton} aria-label="Search">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </form>

        <p className={styles.searchStatus} role="status" aria-live="polite">
          {q && (matchCount === 1 ? "1 topic matches" : `${matchCount} topics match`)}
        </p>

        {visible.length > 0 ? (
          <div className={styles.helpCategories}>
            {visible.map((c) => (
              <div key={c.title} className={styles.categoryCard}>
                <div className={styles.categoryIcon}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={c.icon} />
                  </svg>
                </div>
                <h3>{c.title}</h3>
                <p>{c.blurb}</p>
                <ul className={styles.helpLinks}>
                  {c.topics.map((t) => (
                    <li key={t.label}>
                      <Link to={t.to}>{t.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <h2>No help topics match "{query.trim()}"</h2>
            <p>Try another word, or ask the AURAX team directly.</p>
            <Link to="/contact" className={styles.actionButton}>
              Contact support
            </Link>
          </div>
        )}

        <div className={styles.quickActions}>
          <h2>Need More Help?</h2>
          <div className={styles.actionButtons}>
            <Link to="/support" className={styles.actionButton}>
              Contact Support
            </Link>
            <Link to="/contact" className={styles.actionButton}>
              Schedule a Demo
            </Link>
          </div>
        </div>

        <div className={styles.backLink}>
          <Link to="/" className={styles.homeLink}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Help;
