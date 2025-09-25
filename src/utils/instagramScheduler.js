// Instagram Insights Scheduler Service
import InstagramAPI from "./instagramAPI";
import { copyLogger } from "./copyLogger";

class InstagramSchedulerService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.scheduledTime = "09:00"; // 9 AM by default
    this.syncInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  // Start the automated daily sync
  startDailySync(scheduledTime = "09:00") {
    if (this.isRunning) {
      console.warn("Instagram sync scheduler is already running");
      return;
    }

    this.scheduledTime = scheduledTime;
    this.isRunning = true;

    copyLogger.log("INSTAGRAM_SCHEDULER_STARTED", {
      scheduledTime: this.scheduledTime,
      interval: "24 hours",
    });

    // Calculate initial delay to scheduled time
    const initialDelay = this.calculateInitialDelay(scheduledTime);

    // Set timeout for first sync
    setTimeout(() => {
      this.performScheduledSync();

      // Set interval for subsequent syncs
      this.intervalId = setInterval(() => {
        this.performScheduledSync();
      }, this.syncInterval);
    }, initialDelay);

    console.log(`Instagram insights sync scheduled for ${scheduledTime} daily`);
  }

  // Stop the automated sync
  stopDailySync() {
    if (!this.isRunning) {
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;

    copyLogger.log("INSTAGRAM_SCHEDULER_STOPPED");
    console.log("Instagram sync scheduler stopped");
  }

  // Calculate delay until next scheduled time
  calculateInitialDelay(scheduledTime) {
    const now = new Date();
    const [hours, minutes] = scheduledTime.split(":").map(Number);

    const scheduledDate = new Date();
    scheduledDate.setHours(hours, minutes, 0, 0);

    // If scheduled time has passed today, schedule for tomorrow
    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    return scheduledDate.getTime() - now.getTime();
  }

  // Perform the scheduled sync
  async performScheduledSync() {
    copyLogger.log("SCHEDULED_INSTAGRAM_SYNC_INITIATED", {
      timestamp: new Date().toISOString(),
      type: "automated",
    });

    try {
      const result = await InstagramAPI.performFullSync();

      if (result.status === "success") {
        copyLogger.log("SCHEDULED_INSTAGRAM_SYNC_SUCCESS", {
          timestamp: result.timestamp,
          insights: {
            totalImpressions: result.insights.metrics.total_impressions,
            totalReach: result.insights.metrics.total_reach,
            avgEngagementRate: result.insights.metrics.avg_engagement_rate,
          },
        });

        // Store last sync info
        localStorage.setItem(
          "lastInstagramSync",
          JSON.stringify({
            timestamp: result.timestamp,
            status: "success",
            type: "automated",
          })
        );

        // Notify user (if notifications are enabled)
        this.sendNotification("Instagram insights synced successfully!", {
          tag: "instagram-sync",
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        });
      } else {
        copyLogger.log("SCHEDULED_INSTAGRAM_SYNC_ERROR", {
          error: result.error,
          timestamp: result.timestamp,
        });

        // Store error info
        localStorage.setItem(
          "lastInstagramSync",
          JSON.stringify({
            timestamp: result.timestamp,
            status: "error",
            error: result.error,
            type: "automated",
          })
        );
      }
    } catch (error) {
      copyLogger.log("SCHEDULED_INSTAGRAM_SYNC_CRITICAL_ERROR", {
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Send browser notification
  async sendNotification(message, options = {}) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Aurax Instagram Sync", {
        body: message,
        icon: "/favicon.ico",
        tag: "instagram-sync",
        requireInteraction: false,
        ...options,
      });
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }

  // Get sync status
  getSyncStatus() {
    const lastSync = localStorage.getItem("lastInstagramSync");
    return {
      isRunning: this.isRunning,
      scheduledTime: this.scheduledTime,
      lastSync: lastSync ? JSON.parse(lastSync) : null,
      nextSyncEstimate: this.getNextSyncTime(),
    };
  }

  // Calculate next sync time
  getNextSyncTime() {
    if (!this.isRunning) return null;

    const [hours, minutes] = this.scheduledTime.split(":").map(Number);
    const nextSync = new Date();
    nextSync.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (nextSync <= new Date()) {
      nextSync.setDate(nextSync.getDate() + 1);
    }

    return nextSync.toISOString();
  }

  // Manual sync with logging
  async performManualSync() {
    copyLogger.log("MANUAL_INSTAGRAM_SYNC_INITIATED", {
      timestamp: new Date().toISOString(),
      type: "manual",
    });

    const result = await InstagramAPI.performFullSync();

    // Update last sync info
    localStorage.setItem(
      "lastInstagramSync",
      JSON.stringify({
        timestamp: result.timestamp,
        status: result.status,
        error: result.error || null,
        type: "manual",
      })
    );

    return result;
  }

  // Update schedule time
  updateScheduleTime(newTime) {
    if (this.isRunning) {
      this.stopDailySync();
      this.startDailySync(newTime);
    } else {
      this.scheduledTime = newTime;
    }

    copyLogger.log("INSTAGRAM_SCHEDULER_TIME_UPDATED", {
      newScheduledTime: newTime,
    });
  }

  // Initialize with saved settings
  initialize() {
    const savedSettings = localStorage.getItem("instagramSyncSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.autoSync && settings.scheduledTime) {
        this.startDailySync(settings.scheduledTime);
      }
    }
  }

  // Save settings
  saveSettings(settings) {
    localStorage.setItem("instagramSyncSettings", JSON.stringify(settings));

    if (settings.autoSync) {
      this.startDailySync(settings.scheduledTime);
    } else {
      this.stopDailySync();
    }
  }
}

export default new InstagramSchedulerService();
