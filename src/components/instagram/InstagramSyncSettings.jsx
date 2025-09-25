import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import InstagramScheduler from "../../utils/instagramScheduler";
import styles from "./InstagramSyncSettings.module.css";

const InstagramSyncSettings = () => {
  const [settings, setSettings] = useState({
    autoSync: false,
    scheduledTime: "09:00",
    notificationsEnabled: false,
  });
  const [syncStatus, setSyncStatus] = useState(null);
  const [testingSyncStatus, setTestingSyncStatus] = useState("idle");

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem("instagramSyncSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Get current sync status
    setSyncStatus(InstagramScheduler.getSyncStatus());

    // Request notification permission if needed
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = Notification.permission;
      setSettings((prev) => ({
        ...prev,
        notificationsEnabled: permission === "granted",
      }));
    }
  };

  const handleSettingsChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Save settings immediately
    localStorage.setItem("instagramSyncSettings", JSON.stringify(newSettings));

    // Apply settings to scheduler
    InstagramScheduler.saveSettings(newSettings);

    // Update sync status
    setSyncStatus(InstagramScheduler.getSyncStatus());
  };

  const handleNotificationToggle = async () => {
    if (!settings.notificationsEnabled) {
      const granted = await InstagramScheduler.requestNotificationPermission();
      handleSettingsChange("notificationsEnabled", granted);
    } else {
      handleSettingsChange("notificationsEnabled", false);
    }
  };

  const testSyncNow = async () => {
    setTestingSyncStatus("testing");
    try {
      const result = await InstagramScheduler.performManualSync();
      if (result.status === "success") {
        setTestingSyncStatus("success");
        // Update sync status
        setSyncStatus(InstagramScheduler.getSyncStatus());
      } else {
        setTestingSyncStatus("error");
      }
    } catch (error) {
      setTestingSyncStatus("error");
    }

    // Reset status after 3 seconds
    setTimeout(() => setTestingSyncStatus("idle"), 3000);
  };

  const formatNextSyncTime = (isoString) => {
    if (!isoString) return "Not scheduled";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getTestButtonText = () => {
    switch (testingSyncStatus) {
      case "testing":
        return "⏳ Testing...";
      case "success":
        return "✅ Success!";
      case "error":
        return "❌ Failed";
      default:
        return "🔄 Test Sync Now";
    }
  };

  const getTestButtonClass = () => {
    switch (testingSyncStatus) {
      case "success":
        return `${styles.testButton} ${styles.success}`;
      case "error":
        return `${styles.testButton} ${styles.error}`;
      default:
        return styles.testButton;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={styles.settingsContainer}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>📱 Instagram Sync Settings</h2>
        <p className={styles.subtitle}>
          Configure automated Instagram insights synchronization
        </p>
      </div>

      {/* Current Status */}
      <div className={styles.statusSection}>
        <h3>📊 Current Status</h3>
        <div className={styles.statusGrid}>
          <div className={styles.statusCard}>
            <div className={styles.statusIcon}>
              {syncStatus?.isRunning ? "🟢" : "🔴"}
            </div>
            <div className={styles.statusInfo}>
              <h4>Auto Sync</h4>
              <p>{syncStatus?.isRunning ? "Active" : "Inactive"}</p>
            </div>
          </div>

          <div className={styles.statusCard}>
            <div className={styles.statusIcon}>⏰</div>
            <div className={styles.statusInfo}>
              <h4>Next Sync</h4>
              <p>{formatNextSyncTime(syncStatus?.nextSyncEstimate)}</p>
            </div>
          </div>

          <div className={styles.statusCard}>
            <div className={styles.statusIcon}>
              {syncStatus?.lastSync?.status === "success"
                ? "✅"
                : syncStatus?.lastSync?.status === "error"
                ? "❌"
                : "⏳"}
            </div>
            <div className={styles.statusInfo}>
              <h4>Last Sync</h4>
              <p>
                {syncStatus?.lastSync
                  ? new Date(syncStatus.lastSync.timestamp).toLocaleString()
                  : "Never"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className={styles.settingsForm}>
        <h3>⚙️ Configuration</h3>

        {/* Auto Sync Toggle */}
        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>
            <h4>🔄 Enable Automatic Sync</h4>
            <p>Automatically sync Instagram insights daily</p>
          </div>
          <div className={styles.toggleContainer}>
            <input
              type="checkbox"
              id="autoSync"
              checked={settings.autoSync}
              onChange={(e) =>
                handleSettingsChange("autoSync", e.target.checked)
              }
              className={styles.toggleInput}
            />
            <label htmlFor="autoSync" className={styles.toggleLabel}>
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </div>

        {/* Scheduled Time */}
        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>
            <h4>⏰ Sync Time</h4>
            <p>Choose when to sync daily</p>
          </div>
          <input
            type="time"
            value={settings.scheduledTime}
            onChange={(e) =>
              handleSettingsChange("scheduledTime", e.target.value)
            }
            className={styles.timeInput}
            disabled={!settings.autoSync}
          />
        </div>

        {/* Notifications */}
        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>
            <h4>🔔 Browser Notifications</h4>
            <p>Get notified when sync completes</p>
          </div>
          <div className={styles.toggleContainer}>
            <input
              type="checkbox"
              id="notifications"
              checked={settings.notificationsEnabled}
              onChange={handleNotificationToggle}
              className={styles.toggleInput}
            />
            <label htmlFor="notifications" className={styles.toggleLabel}>
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </div>
      </div>

      {/* Manual Test Section */}
      <div className={styles.testSection}>
        <h3>🧪 Test Connection</h3>
        <p>Test your Instagram API connection and sync process</p>
        <button
          onClick={testSyncNow}
          disabled={testingSyncStatus === "testing"}
          className={getTestButtonClass()}
        >
          {getTestButtonText()}
        </button>
      </div>

      {/* API Information */}
      <div className={styles.infoSection}>
        <h3>📋 API Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h4>🔑 Authentication</h4>
            <p>
              Using Instagram Basic Display API with your provided access token
            </p>
          </div>
          <div className={styles.infoCard}>
            <h4>📊 Metrics Collected</h4>
            <ul>
              <li>Profile views and follower count</li>
              <li>Post impressions and reach</li>
              <li>Engagement rates (likes, comments, shares, saves)</li>
              <li>Media performance analytics</li>
            </ul>
          </div>
          <div className={styles.infoCard}>
            <h4>🔄 Sync Frequency</h4>
            <p>
              Data syncs every 24 hours at your chosen time. Instagram API
              limits refresh to once daily.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className={styles.privacyNotice}>
        <h4>🔒 Privacy & Security</h4>
        <p>
          Your Instagram data is securely processed and stored in your Aurax
          dashboard. We only collect publicly available metrics and never access
          private messages or personal information. All API calls are encrypted
          and logged for your security.
        </p>
      </div>
    </motion.div>
  );
};

export default InstagramSyncSettings;
