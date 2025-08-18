import React from "react";
import { motion } from "framer-motion";
import styles from "./TopCreators.module.css";

const TopCreators = ({ creators }) => {
  return (
    <div className={styles.container}>
      {creators.map((creator, index) => (
        <motion.div
          key={creator.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={styles.creatorCard}
        >
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}></div>
            <div className={styles.onlineIndicator}></div>
          </div>

          <div className={styles.creatorInfo}>
            <div className={styles.namePlatform}>
              <h3 className={styles.name}>{creator.name}</h3>
              <span className={styles.platform}>{creator.platform}</span>
            </div>
            <div className={styles.followers}>
              {creator.followers} followers
            </div>
            <div className={styles.engagementContainer}>
              <div className={styles.engagementBar}>
                <motion.div
                  className={styles.engagementFill}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(creator.engagement * 10, 100)}%`,
                  }}
                  transition={{ duration: 1, delay: 0.3 }}
                ></motion.div>
              </div>
              <span className={styles.engagementValue}>
                {creator.engagement}%
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TopCreators;
