import React from "react";
import DashboardCard from "../components/dashboard/DashboardCard";
import CampaignList from "../components/dashboard/CampaignList";
import TopCreators from "../components/dashboard/TopCreators";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import QuickActions from "../components/dashboard/QuickActions";
import styles from "./BrandDashboard.module.css";

const BrandDashboard = () => {
  const stats = [
    { title: "Active Campaigns", value: 7, change: "+2", icon: "📊" },
    { title: "Pending Proposals", value: 12, change: "+3", icon: "📥" },
    { title: "Total Spend", value: "$18,250", change: "+24%", icon: "💸" },
    { title: "Avg. ROI", value: "3.2x", change: "+0.4x", icon: "📈" },
  ];

  const campaigns = [
    {
      id: 1,
      name: "Summer Collection",
      status: "active",
      creators: 8,
      progress: 60,
    },
    {
      id: 2,
      name: "Product Launch",
      status: "draft",
      creators: 0,
      progress: 0,
    },
    {
      id: 3,
      name: "Holiday Campaign",
      status: "completed",
      creators: 15,
      progress: 100,
    },
  ];

  const creators = [
    {
      id: 1,
      name: "Alex Johnson",
      platform: "Instagram",
      engagement: 8.2,
      followers: "142K",
    },
    {
      id: 2,
      name: "Taylor Smith",
      platform: "TikTok",
      engagement: 12.7,
      followers: "890K",
    },
    {
      id: 3,
      name: "Jordan Lee",
      platform: "YouTube",
      engagement: 4.8,
      followers: "325K",
    },
    {
      id: 4,
      name: "Morgan Reed",
      platform: "Instagram",
      engagement: 6.4,
      followers: "210K",
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Brand Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back, Nike Team! Campaign performance overview.
          </p>
        </div>

        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <DashboardCard key={index} stat={stat} />
          ))}
        </div>

        <div className={styles.grid}>
          <div className={styles.mainContent}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Your Campaigns</h2>
                <button className={styles.newCampaignButton}>
                  + New Campaign
                </button>
              </div>
              <CampaignList campaigns={campaigns} isBrandView={true} />
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Campaign Performance</h2>
              <PerformanceChart isBrand={true} />
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Top Performing Creators</h2>
                <button className={styles.seeAllButton}>See all</button>
              </div>
              <TopCreators creators={creators} />
            </div>

            <QuickActions isBrand={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;
