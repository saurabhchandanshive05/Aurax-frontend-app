import React from "react";
import { Link } from "react-router-dom";
import styles from "./Support.module.css";

const Support = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Support Center</h1>
        <p className={styles.subtitle}>
          We're here to help! Get the support you need to succeed.
        </p>

        <div className={styles.supportOptions}>
          <div className={styles.supportCard}>
            <div className={styles.icon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3>Email Support</h3>
            <p>Get help via email within 24 hours</p>
            <a href="mailto:support@yourplatform.com" className={styles.button}>
              Contact via Email
            </a>
          </div>

          <div className={styles.supportCard}>
            <div className={styles.icon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3>Live Chat</h3>
            <p>Chat with our support team in real-time</p>
            <button className={styles.button}>Start Live Chat</button>
          </div>

          <div className={styles.supportCard}>
            <div className={styles.icon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3>Documentation</h3>
            <p>Browse our comprehensive help guides</p>
            <Link to="/docs" className={styles.button}>
              View Documentation
            </Link>
          </div>
        </div>

        <div className={styles.commonIssues}>
          <h2>Common Issues</h2>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary>I forgot my password</summary>
              <p>
                You can reset your password using the "Forgot Password" link on
                the login page.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>How do I update my profile?</summary>
              <p>
                Go to your dashboard and click on "Profile Settings" to update
                your information.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>I'm having trouble logging in</summary>
              <p>
                Make sure your email and password are correct. Clear your
                browser cache if issues persist.
              </p>
            </details>
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

export default Support;
