import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import InstagramAPI from "../../utils/instagramAPI";
import { useTheme } from "../../context/ThemeContext";
import styles from "./InstagramInsights.module.css";

const InstagramInsights = ({ creatorId, autoSync = true }) => {
  const { currentTheme } = useTheme();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState("idle");

  // Load insights on component mount
  useEffect(() => {
    if (autoSync) {
      handleSync();
    }
    // Set up periodic sync every 6 hours
    const interval = setInterval(() => {
      if (autoSync) {
        handleSync();
      }
    }, 6 * 60 * 60 * 1000); // 6 hours

    return () => clearInterval(interval);
  }, [autoSync]);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setSyncStatus("syncing");

    try {
      const result = await InstagramAPI.performFullSync();

      if (result.status === "success") {
        setInsights(result.insights);
        setLastSync(new Date().toLocaleString());
        setSyncStatus("success");
      } else {
        setError(result.error);
        setSyncStatus("error");
      }
    } catch (err) {
      setError(err.message);
      setSyncStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num?.toString() || "0";
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case "syncing":
        return "🔄";
      case "success":
        return "✅";
      case "error":
        return "❌";
      default:
        return "📱";
    }
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case "syncing":
        return "#ffa500";
      case "success":
        return "#00ff88";
      case "error":
        return "#ff4757";
      default:
        return "#6c7293";
    }
  };

  // Chart configurations
  const engagementChartData = insights
    ? {
        labels: insights.recent_posts.map((post, index) => `Post ${index + 1}`),
        datasets: [
          {
            label: "Engagement Rate (%)",
            data: insights.recent_posts.map((post) => post.engagement_rate),
            borderColor: "#E1306C",
            backgroundColor: "rgba(225, 48, 108, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      }
    : null;

  const metricsDistributionData = insights
    ? {
        labels: ["Likes", "Comments", "Shares", "Saves"],
        datasets: [
          {
            data: [
              insights.metrics.total_likes,
              insights.metrics.total_comments,
              insights.metrics.total_shares,
              insights.metrics.total_saves,
            ],
            backgroundColor: ["#E1306C", "#405DE6", "#5B51D8", "#833AB4"],
            borderWidth: 0,
          },
        ],
      }
    : null;

  const impressionsReachData = insights
    ? {
        labels: insights.recent_posts.map((post, index) => `Post ${index + 1}`),
        datasets: [
          {
            label: "Impressions",
            data: insights.recent_posts.map((post) => post.impressions),
            backgroundColor: "#E1306C",
          },
          {
            label: "Reach",
            data: insights.recent_posts.map((post) => post.reach),
            backgroundColor: "#405DE6",
          },
        ],
      }
    : null;

  if (loading && !insights) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}>
          <div className={styles.instagramLoader}></div>
          <p>Fetching Instagram insights...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={styles.instagramInsights}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>📱 Instagram Insights</h2>
          <div
            className={styles.syncStatus}
            style={{ color: getSyncStatusColor() }}
          >
            {getSyncStatusIcon()}{" "}
            {syncStatus.charAt(0).toUpperCase() + syncStatus.slice(1)}
          </div>
        </div>
        <div className={styles.controls}>
          {lastSync && (
            <span className={styles.lastSync}>Last sync: {lastSync}</span>
          )}
          <button
            onClick={handleSync}
            disabled={loading}
            className={styles.syncButton}
          >
            {loading ? "🔄 Syncing..." : "🔄 Sync Now"}
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          ❌ {error}
          <button onClick={handleSync} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {insights && (
        <>
          {/* Profile Overview */}
          <div className={styles.profileSection}>
            <div className={styles.profileInfo}>
              <img
                src={insights.profile.profile_picture_url}
                alt="Profile"
                className={styles.profilePicture}
              />
              <div className={styles.profileDetails}>
                <h3>@{insights.profile.username}</h3>
                <div className={styles.profileStats}>
                  <span>
                    {formatNumber(insights.profile.followers_count)} followers
                  </span>
                  <span>{insights.profile.media_count} posts</span>
                  <span>
                    {formatNumber(insights.profile.follows_count)} following
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>👁️</div>
              <div className={styles.metricValue}>
                {formatNumber(insights.metrics.total_impressions)}
              </div>
              <div className={styles.metricLabel}>Total Impressions</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>👥</div>
              <div className={styles.metricValue}>
                {formatNumber(insights.metrics.total_reach)}
              </div>
              <div className={styles.metricLabel}>Total Reach</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>💫</div>
              <div className={styles.metricValue}>
                {insights.metrics.avg_engagement_rate}%
              </div>
              <div className={styles.metricLabel}>Avg Engagement Rate</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>❤️</div>
              <div className={styles.metricValue}>
                {formatNumber(insights.metrics.total_likes)}
              </div>
              <div className={styles.metricLabel}>Total Likes</div>
            </div>
          </div>

          {/* Charts Section */}
          <div className={styles.chartsSection}>
            {/* Engagement Rate Chart */}
            <div className={styles.chartCard}>
              <h3>Engagement Rate Trend</h3>
              {engagementChartData && (
                <Line
                  data={engagementChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Engagement Rate (%)",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              )}
            </div>

            {/* Metrics Distribution */}
            <div className={styles.chartCard}>
              <h3>Engagement Distribution</h3>
              {metricsDistributionData && (
                <Doughnut
                  data={metricsDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                  }}
                />
              )}
            </div>

            {/* Impressions vs Reach */}
            <div className={styles.chartCard}>
              <h3>Impressions vs Reach</h3>
              {impressionsReachData && (
                <Bar
                  data={impressionsReachData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Recent Posts */}
          <div className={styles.recentPosts}>
            <h3>Top Performing Recent Posts</h3>
            <div className={styles.postsGrid}>
              {insights.recent_posts.map((post) => (
                <div key={post.id} className={styles.postCard}>
                  <div className={styles.postMedia}>
                    <img
                      src={post.thumbnail_url || post.media_url}
                      alt="Post content"
                      className={styles.postImage}
                    />
                    <div className={styles.postType}>
                      {post.media_type.toLowerCase()}
                    </div>
                  </div>
                  <div className={styles.postStats}>
                    <div className={styles.postStat}>
                      <span>👁️ {formatNumber(post.impressions)}</span>
                    </div>
                    <div className={styles.postStat}>
                      <span>👥 {formatNumber(post.reach)}</span>
                    </div>
                    <div className={styles.postStat}>
                      <span>💫 {post.engagement_rate}%</span>
                    </div>
                    <div className={styles.postStat}>
                      <span>❤️ {formatNumber(post.likes)}</span>
                    </div>
                  </div>
                  <div className={styles.postCaption}>{post.caption}</div>
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewPostLink}
                  >
                    View Post →
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Insights Summary */}
          <div className={styles.insightsSummary}>
            <h3>📊 Performance Summary</h3>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <h4>🎯 Engagement Quality</h4>
                <p>
                  {insights.metrics.avg_engagement_rate > 3
                    ? "Excellent engagement! Your content resonates well with your audience."
                    : insights.metrics.avg_engagement_rate > 1.5
                    ? "Good engagement rate. Consider more interactive content."
                    : "Focus on increasing engagement with more interactive posts."}
                </p>
              </div>
              <div className={styles.summaryCard}>
                <h4>📈 Growth Potential</h4>
                <p>
                  {insights.metrics.total_reach >
                  insights.profile.followers_count * 0.8
                    ? "Great reach beyond your follower base! Your content is discoverable."
                    : "Focus on hashtags and trending topics to increase reach."}
                </p>
              </div>
              <div className={styles.summaryCard}>
                <h4>💡 Recommendations</h4>
                <p>
                  {insights.metrics.total_saves >
                  insights.metrics.total_likes * 0.1
                    ? "High save rate indicates valuable content. Keep creating educational/inspirational posts."
                    : "Consider creating more saveable content like tips, quotes, or tutorials."}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default InstagramInsights;
