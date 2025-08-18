import React from "react";
import { motion } from "framer-motion";
import styles from "./DashboardCard.module.css";

const DashboardCard = ({ stat }) => {
  return (
    <motion.div whileHover={{ y: -5 }} className={styles.card}>
      <div className={styles.glowEffect}></div>

      <div className={styles.content}>
        <div>
          <h3 className={styles.title}>{stat.title}</h3>
          <div className={styles.values}>
            <span className={styles.value}>{stat.value}</span>
            <span className={styles.change}>{stat.change}</span>
          </div>
        </div>
        <div className={styles.iconContainer}>{stat.icon}</div>
      </div>

      <div className={styles.progressBar}>
        <motion.div
          className={styles.progressFill}
          initial={{ width: 0 }}
          animate={{ width: "70%" }}
          transition={{ duration: 1, delay: 0.3 }}
        ></motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardCard;
