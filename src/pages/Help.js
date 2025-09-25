import React from "react";
import { Link } from "react-router-dom";
import styles from "./Help.module.css";

const Help = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Help Center</h1>
        <p className={styles.subtitle}>
          Find answers to common questions and get started quickly
        </p>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search for help topics..."
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        <div className={styles.helpCategories}>
          <div className={styles.categoryCard}>
            <div className={styles.categoryIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3>Getting Started</h3>
            <p>Learn the basics of our platform</p>
            <ul className={styles.helpLinks}>
              <li>
                <Link to="/help/account-setup">Setting up your account</Link>
              </li>
              <li>
                <Link to="/help/profile">Completing your profile</Link>
              </li>
              <li>
                <Link to="/help/first-steps">Your first steps</Link>
              </li>
            </ul>
          </div>

          <div className={styles.categoryCard}>
            <div className={styles.categoryIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3>Account & Security</h3>
            <p>Manage your account settings</p>
            <ul className={styles.helpLinks}>
              <li>
                <Link to="/help/password-reset">Reset your password</Link>
              </li>
              <li>
                <Link to="/help/security">Account security</Link>
              </li>
              <li>
                <Link to="/help/privacy">Privacy settings</Link>
              </li>
            </ul>
          </div>

          <div className={styles.categoryCard}>
            <div className={styles.categoryIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3>Campaigns</h3>
            <p>Learn about creating and managing campaigns</p>
            <ul className={styles.helpLinks}>
              <li>
                <Link to="/help/create-campaign">Creating a campaign</Link>
              </li>
              <li>
                <Link to="/help/campaign-management">Managing campaigns</Link>
              </li>
              <li>
                <Link to="/help/analytics">Understanding analytics</Link>
              </li>
            </ul>
          </div>

          <div className={styles.categoryCard}>
            <div className={styles.categoryIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
            </div>
            <h3>Collaboration</h3>
            <p>Working with creators and brands</p>
            <ul className={styles.helpLinks}>
              <li>
                <Link to="/help/finding-creators">Finding creators</Link>
              </li>
              <li>
                <Link to="/help/collaboration-tools">Collaboration tools</Link>
              </li>
              <li>
                <Link to="/help/payments">Payments & billing</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.quickActions}>
          <h2>Need More Help?</h2>
          <div className={styles.actionButtons}>
            <Link to="/support" className={styles.actionButton}>
              Contact Support
            </Link>
            <button className={styles.actionButton}>Schedule a Demo</button>
            <Link to="/docs" className={styles.actionButton}>
              View Documentation
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
