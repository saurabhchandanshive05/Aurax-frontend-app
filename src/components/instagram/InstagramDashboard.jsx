import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./InstagramDashboard.module.css";

const InstagramDashboard = ({ accessToken }) => {
  const [profileData, setProfileData] = useState(null);
  const [mediaData, setMediaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    if (accessToken) {
      fetchInstagramData();
    }
  }, [accessToken]);

  const fetchInstagramData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/instagram/profile?accessToken=${accessToken}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch Instagram data");
      }

      setProfileData(data.profile);
      setMediaData(data.media);
    } catch (err) {
      setError(err.message);
      console.error("Instagram fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaClick = (media) => {
    setSelectedMedia(media);
  };

  const closeMediaModal = () => {
    setSelectedMedia(null);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const truncateCaption = (caption, maxLength = 100) => {
    if (!caption) return "";
    return caption.length > maxLength
      ? caption.substring(0, maxLength) + "..."
      : caption;
  };

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading Instagram data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Instagram Connection Failed</h3>
          <p>{error}</p>
          <button onClick={fetchInstagramData} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.noDataContainer}>
          <p>No Instagram data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Profile Header */}
      <motion.div
        className={styles.profileCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.profileHeader}>
          <div className={styles.profileImageContainer}>
            {profileData.profile_picture_url ? (
              <img
                src={profileData.profile_picture_url}
                alt={`@${profileData.username}`}
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.defaultAvatar}>
                <span>@</span>
              </div>
            )}
            <div className={styles.verifiedBadge}>
              <span className={styles.instagramIcon}>📱</span>
            </div>
          </div>

          <div className={styles.profileInfo}>
            <h2 className={styles.username}>@{profileData.username}</h2>
            <p className={styles.accountType}>
              {profileData.account_type.replace("_", " ").toLowerCase()}
            </p>

            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {formatNumber(profileData.followers_count)}
                </span>
                <span className={styles.statLabel}>Followers</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {formatNumber(profileData.follows_count)}
                </span>
                <span className={styles.statLabel}>Following</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {formatNumber(profileData.media_count)}
                </span>
                <span className={styles.statLabel}>Posts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className={styles.engagementMetrics}>
          <div className={styles.metricCard}>
            <span className={styles.metricValue}>
              {profileData.engagement_metrics.engagement_rate}%
            </span>
            <span className={styles.metricLabel}>Engagement Rate</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricValue}>
              {formatNumber(
                profileData.engagement_metrics.avg_engagement_per_post
              )}
            </span>
            <span className={styles.metricLabel}>Avg Engagement</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricValue}>
              {formatNumber(profileData.engagement_metrics.total_engagement)}
            </span>
            <span className={styles.metricLabel}>Total Engagement</span>
          </div>
        </div>
      </motion.div>

      {/* Media Grid */}
      <motion.div
        className={styles.mediaSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <h3 className={styles.sectionTitle}>Recent Posts</h3>

        <div className={styles.mediaGrid}>
          {mediaData.map((media, index) => (
            <motion.div
              key={media.id}
              className={styles.mediaCard}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => handleMediaClick(media)}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 30px rgba(225, 48, 108, 0.3)",
              }}
            >
              <div className={styles.mediaImageContainer}>
                <img
                  src={media.thumbnail_url || media.media_url}
                  alt="Instagram post"
                  className={styles.mediaImage}
                />
                <div className={styles.mediaOverlay}>
                  <div className={styles.mediaStats}>
                    <span className={styles.statItem}>
                      ❤️ {formatNumber(media.like_count)}
                    </span>
                    <span className={styles.statItem}>
                      💬 {formatNumber(media.comments_count)}
                    </span>
                  </div>
                  <div className={styles.mediaType}>
                    {media.media_type === "VIDEO" ? "🎥" : "📸"}
                  </div>
                </div>
              </div>

              <div className={styles.mediaInfo}>
                <p className={styles.mediaCaption}>
                  {truncateCaption(media.caption)}
                </p>
                <span className={styles.mediaDate}>{media.formatted_date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Media Modal */}
      {selectedMedia && (
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeMediaModal}
        >
          <motion.div
            className={styles.modalContent}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.modalClose} onClick={closeMediaModal}>
              ✕
            </button>

            <div className={styles.modalMedia}>
              <img
                src={selectedMedia.media_url}
                alt="Instagram post"
                className={styles.modalImage}
              />
            </div>

            <div className={styles.modalInfo}>
              <h4>@{profileData.username}</h4>
              <p className={styles.modalCaption}>
                {selectedMedia.caption || "No caption"}
              </p>

              <div className={styles.modalStats}>
                <span>❤️ {formatNumber(selectedMedia.like_count)} likes</span>
                <span>
                  💬 {formatNumber(selectedMedia.comments_count)} comments
                </span>
                <span>📅 {selectedMedia.formatted_date}</span>
              </div>

              <a
                href={selectedMedia.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.viewOnInstagram}
              >
                View on Instagram
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default InstagramDashboard;
