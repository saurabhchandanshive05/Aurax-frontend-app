import React from "react";
import { motion } from "framer-motion";
import styles from "./CampaignList.module.css";

const CampaignList = ({ campaigns, isBrandView = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return styles.statusActive;
      case "pending":
        return styles.statusPending;
      case "draft":
        return styles.statusDraft;
      case "completed":
        return styles.statusCompleted;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <div className={styles.container}>
      {campaigns.map((campaign, index) => (
        <motion.div
          key={campaign.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={styles.campaignCard}
        >
          <div>
            <h3 className={styles.campaignTitle}>
              {isBrandView ? campaign.name : campaign.brand}
            </h3>
            <p className={styles.campaignDetail}>
              {isBrandView
                ? `${campaign.creators} creators`
                : `Deadline: ${campaign.deadline}`}
            </p>
          </div>
          <div className={styles.campaignInfo}>
            <span
              className={`${styles.statusBadge} ${getStatusColor(
                campaign.status
              )}`}
            >
              {campaign.status}
            </span>
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <motion.div
                  className={styles.progressFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${campaign.progress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                ></motion.div>
              </div>
              <span className={styles.progressText}>{campaign.progress}%</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CampaignList;
