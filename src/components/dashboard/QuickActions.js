import React from "react";
import { motion } from "framer-motion";
import styles from "./QuickActions.module.css";

const QuickActions = ({ isBrand = false }) => {
  const actions = isBrand
    ? [
        { icon: "🔍", label: "Find Creators", path: "/creators" },
        { icon: "📝", label: "Create Brief", path: "/briefs/create" },
        { icon: "💌", label: "Send Invites", path: "/invites" },
        { icon: "📊", label: "View Reports", path: "/analytics" },
      ]
    : [
        { icon: "📝", label: "Update Profile", path: "/creator/profile" },
        { icon: "📊", label: "View Analytics", path: "/analytics" },
        { icon: "💌", label: "Check Messages", path: "/messages" },
        { icon: "💸", label: "Payment Settings", path: "/payments" },
      ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Quick Actions</h2>
      <div className={styles.actionsGrid}>
        {actions.map((action, index) => (
          <motion.a
            key={index}
            href={action.path}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.actionCard}
          >
            <div className={styles.icon}>{action.icon}</div>
            <span className={styles.label}>{action.label}</span>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
