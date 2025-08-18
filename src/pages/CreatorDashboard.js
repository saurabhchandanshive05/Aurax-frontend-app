import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardCard from "../components/dashboard/DashboardCard";
import CampaignList from "../components/dashboard/CampaignList";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import QuickActions from "../components/dashboard/QuickActions";
import AIContentRecommender from "../components/ai/AIContentRecommender";
import AdvancedAnalytics from "../components/analytics/AdvancedAnalytics";
import AchievementSystem from "../components/gamification/AchievementSystem";
import SentimentAnalysis from "../components/data/SentimentAnalysis";
import InteractiveCard from "../components/ui/InteractiveCard";
import styles from "./CreatorDashboard.module.css";

const CreatorDashboard = () => {
  const stats = [
    { title: "Pending Offers", value: 3, change: "+1", icon: "📥" },
    { title: "Active Campaigns", value: 5, change: "+2", icon: "📊" },
    { title: "Earnings", value: "$2,450", change: "+12%", icon: "💸" },
    { title: "Avg. Engagement", value: "4.8%", change: "+0.3%", icon: "🔥" },
  ];

  const campaigns = [
    {
      id: 1,
      brand: "Nike",
      status: "active",
      deadline: "2023-06-15",
      progress: 75,
    },
    {
      id: 2,
      brand: "Apple",
      status: "pending",
      deadline: "2023-06-20",
      progress: 0,
    },
    {
      id: 3,
      brand: "Coca-Cola",
      status: "completed",
      deadline: "2023-05-30",
      progress: 100,
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.welcomeContainer}>
            <h1 className={styles.title}>Creator Dashboard</h1>
            <p className={styles.subtitle}>
              Welcome back, Sarah! Here's your campaign overview.
            </p>
          </div>
          <div className={styles.profileBadge}>
            <div className={styles.avatar}></div>
            <div className={styles.stats}>
              <span className={styles.level}>Level 5 Creator</span>
              <div className={styles.xpBar}>
                <div className={styles.xpFill}></div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <DashboardCard key={index} stat={stat} />
          ))}
        </div>

        {/* Enhanced Dashboard Grid */}
        <div className={styles.grid}>
          <div className={styles.mainContent}>
            {/* AI Content Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={styles.section}
            >
              <AIContentRecommender
                creatorData={{ id: 1, name: "Sarah" }}
                onRecommendationSelect={(rec) => console.log("Selected:", rec)}
              />
            </motion.div>

            {/* Advanced Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={styles.section}
            >
              <AdvancedAnalytics creatorId={1} />
            </motion.div>

            {/* Sentiment Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={styles.section}
            >
              <SentimentAnalysis contentId="latest-post" timeRange="7d" />
            </motion.div>

            {/* Original Campaigns Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={styles.section}
            >
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Your Campaigns</h2>
                <Link to="/campaigns" className={styles.viewAllLink}>
                  View all
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.arrowIcon}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
              <CampaignList campaigns={campaigns} />
            </motion.div>
          </div>

          <div className={styles.sidebar}>
            {/* Achievement System */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={styles.section}
            >
              <AchievementSystem userId={1} />
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={styles.section}
            >
              <QuickActions />
            </motion.div>

            {/* Messages Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className={styles.section}
            >
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Messages</h2>
                <span className={styles.notificationBadge}>3 new</span>
              </div>

              <div className={styles.messagesContainer}>
                <div className={styles.message}>
                  <div className={styles.avatarSmall}></div>
                  <div className={styles.messageContent}>
                    <div className={styles.messageHeader}>
                      <h3 className={styles.sender}>Nike Team</h3>
                      <span className={styles.time}>2h ago</span>
                    </div>
                    <p className={styles.messageText}>
                      Can we schedule a call about the campaign details?
                    </p>
                  </div>
                </div>

                <div className={styles.message}>
                  <div className={styles.avatarSmall}></div>
                  <div className={styles.messageContent}>
                    <div className={styles.messageHeader}>
                      <h3 className={styles.sender}>Apple Creative</h3>
                      <span className={styles.time}>5h ago</span>
                    </div>
                    <p className={styles.messageText}>
                      Your content has been approved!
                    </p>
                  </div>
                </div>
              </div>

              <button className={styles.viewMessagesButton}>
                View All Messages
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className={styles.floatingElement1}></div>
      <div className={styles.floatingElement2}></div>
      <div className={styles.floatingElement3}></div>
    </div>
  );
};

export default CreatorDashboard;
