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
import InstagramInsights from "../components/instagram/InstagramInsights";
import InstagramSyncSettings from "../components/instagram/InstagramSyncSettings";
import InstagramDashboard from "../components/instagram/InstagramDashboard";
import styles from "./CreatorDashboard.module.css";

const CreatorDashboard = () => {
  const [showInstagramSettings, setShowInstagramSettings] =
    React.useState(false);
  const [showInstagramDashboard, setShowInstagramDashboard] =
    React.useState(false);
  const [instagramConnected, setInstagramConnected] = React.useState(false);
  const [instagramAccessToken, setInstagramAccessToken] = React.useState("");
  const [showConnectInstagram, setShowConnectInstagram] = React.useState(true);
  const [isConnecting, setIsConnecting] = React.useState(false);

  // Instagram OAuth Configuration - Using real app credentials
  const INSTAGRAM_CLIENT_ID = process.env.REACT_APP_INSTAGRAM_CLIENT_ID;
  const REDIRECT_URI =
    process.env.REACT_APP_REDIRECT_URI ||
    "http://localhost:3000/auth/instagram/callback";

  console.log("🔧 Instagram OAuth Config:", {
    clientId: INSTAGRAM_CLIENT_ID,
    redirectUri: REDIRECT_URI,
  });

  // Check for Instagram access token on component mount
  React.useEffect(() => {
    const storedToken = localStorage.getItem("instagram_access_token");
    if (storedToken) {
      console.log("📱 Found stored Instagram token");
      setInstagramAccessToken(storedToken);
      setInstagramConnected(true);
      setShowConnectInstagram(false);

      // Validate token
      validateStoredToken(storedToken);
    }

    // Check if this is a callback from Instagram OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    if (error) {
      console.error("❌ Instagram OAuth error:", error, errorDescription);
      alert(`Instagram connection failed: ${errorDescription || error}`);
      setIsConnecting(false);
    } else if (code) {
      console.log("🔄 Processing Instagram OAuth callback...");
      handleInstagramCallback(code);
    }
  }, []);

  // Validate stored token
  const validateStoredToken = async (token) => {
    try {
      const response = await fetch(
        `/api/instagram/oauth/validate?access_token=${token}`
      );
      const data = await response.json();

      if (!data.success || !data.valid) {
        console.log("⚠️ Stored Instagram token is invalid, clearing...");
        localStorage.removeItem("instagram_access_token");
        setInstagramAccessToken("");
        setInstagramConnected(false);
        setShowConnectInstagram(true);
      } else {
        console.log(`✅ Instagram token valid for @${data.user_info.username}`);
      }
    } catch (error) {
      console.error("❌ Token validation failed:", error);
    }
  };

  // Handle Instagram OAuth callback
  const handleInstagramCallback = async (code) => {
    setIsConnecting(true);

    try {
      console.log("🔄 Exchanging OAuth code for access token...");

      const response = await fetch("/api/instagram/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code,
          redirect_uri: REDIRECT_URI,
        }),
      });

      const data = await response.json();

      if (data.success && data.access_token) {
        console.log("🎉 Instagram OAuth successful!");
        console.log(
          `📱 Connected: @${data.user_info.username} (${data.user_info.account_type})`
        );

        setInstagramAccessToken(data.access_token);
        setInstagramConnected(true);
        setShowConnectInstagram(false);
        localStorage.setItem("instagram_access_token", data.access_token);

        // Store additional user info
        localStorage.setItem(
          "instagram_user_info",
          JSON.stringify(data.user_info)
        );

        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // Show success message
        const expiryDays = Math.floor(data.expires_in / 86400);
        alert(
          `🎉 Instagram connected successfully!\n@${data.user_info.username}\nToken expires in ${expiryDays} days`
        );
      } else {
        throw new Error(data.error || "OAuth exchange failed");
      }
    } catch (error) {
      console.error("❌ Instagram OAuth callback error:", error);
      alert(`Instagram connection failed: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Initiate Instagram OAuth flow
  const connectInstagram = () => {
    if (!INSTAGRAM_CLIENT_ID) {
      alert(
        "Instagram Client ID not configured. Please check environment variables."
      );
      return;
    }

    console.log("🚀 Starting Instagram OAuth flow...");
    setIsConnecting(true);

    // Instagram OAuth scopes
    const scopes = ["user_profile", "user_media"];
    const state = Date.now().toString(); // Simple state parameter for security

    const instagramAuthUrl = new URL(
      "https://api.instagram.com/oauth/authorize"
    );
    instagramAuthUrl.searchParams.set("client_id", INSTAGRAM_CLIENT_ID);
    instagramAuthUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    instagramAuthUrl.searchParams.set("scope", scopes.join(","));
    instagramAuthUrl.searchParams.set("response_type", "code");
    instagramAuthUrl.searchParams.set("state", state);

    console.log(
      "🔗 Redirecting to Instagram OAuth:",
      instagramAuthUrl.toString()
    );

    // Redirect to Instagram OAuth
    window.location.href = instagramAuthUrl.toString();
  };

  // Disconnect Instagram
  const disconnectInstagram = () => {
    const userInfo = JSON.parse(
      localStorage.getItem("instagram_user_info") || "{}"
    );
    const username = userInfo.username || "Instagram account";

    if (
      window.confirm(
        `Disconnect ${username}? You'll need to reconnect to access Instagram features.`
      )
    ) {
      console.log("🔌 Disconnecting Instagram...");

      setInstagramAccessToken("");
      setInstagramConnected(false);
      setShowConnectInstagram(true);
      setShowInstagramDashboard(false);
      localStorage.removeItem("instagram_access_token");
      localStorage.removeItem("instagram_user_info");

      alert("Instagram disconnected successfully");
    }
  };

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
            {/* Instagram Integration Section - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={styles.section}
            >
              <div className={styles.sectionHeader}>
                <h2>📱 Instagram Integration</h2>
                <div className={styles.instagramControls}>
                  {instagramConnected && (
                    <>
                      <button
                        onClick={() => {
                          setShowInstagramDashboard(!showInstagramDashboard);
                          setShowInstagramSettings(false);
                        }}
                        className={`${styles.toggleButton} ${
                          showInstagramDashboard ? styles.active : ""
                        }`}
                      >
                        🎨 Enhanced View
                      </button>
                      <button
                        onClick={() => {
                          setShowInstagramSettings(!showInstagramSettings);
                          setShowInstagramDashboard(false);
                        }}
                        className={`${styles.settingsButton} ${
                          showInstagramSettings ? styles.active : ""
                        }`}
                      >
                        ⚙️ Settings
                      </button>
                      <button
                        onClick={disconnectInstagram}
                        className={styles.disconnectButton}
                      >
                        🔌 Disconnect
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Instagram Connection Card */}
              {showConnectInstagram && !instagramConnected && (
                <div className={styles.instagramConnectCard}>
                  <div className={styles.connectContent}>
                    <div className={styles.connectIcon}>📱</div>
                    <h3>Connect Your Instagram</h3>
                    <p>
                      Unlock powerful analytics, content insights, and automated
                      engagement tracking by connecting your Instagram Business
                      or Creator account.
                    </p>

                    <div className={styles.benefits}>
                      <div className={styles.benefit}>
                        <span className={styles.benefitIcon}>📊</span>
                        <span>Advanced Analytics</span>
                      </div>
                      <div className={styles.benefit}>
                        <span className={styles.benefitIcon}>🎯</span>
                        <span>Content Performance</span>
                      </div>
                      <div className={styles.benefit}>
                        <span className={styles.benefitIcon}>👥</span>
                        <span>Audience Insights</span>
                      </div>
                    </div>

                    <button
                      onClick={connectInstagram}
                      disabled={isConnecting}
                      className={`${styles.connectButton} ${
                        isConnecting ? styles.connecting : ""
                      }`}
                    >
                      <span className={styles.connectButtonIcon}>
                        {isConnecting ? "�" : "�📱"}
                      </span>
                      {isConnecting ? "Connecting..." : "Connect Instagram"}
                    </button>

                    <p className={styles.connectNote}>
                      ✅ Secure OAuth connection • No password required
                      <br />
                      🔒 Real Instagram App ID: {INSTAGRAM_CLIENT_ID}
                    </p>
                  </div>
                </div>
              )}

              {/* Instagram Dashboard Content */}
              {instagramConnected && (
                <>
                  {showInstagramDashboard ? (
                    <InstagramDashboard accessToken={instagramAccessToken} />
                  ) : showInstagramSettings ? (
                    <InstagramSyncSettings />
                  ) : (
                    <div className={styles.instagramStatusCard}>
                      <div className={styles.statusContent}>
                        <div className={styles.statusIcon}>✅</div>
                        <h3>Instagram Connected</h3>
                        <p>
                          Your Instagram account is successfully connected and
                          syncing.
                          {(() => {
                            const userInfo = JSON.parse(
                              localStorage.getItem("instagram_user_info") ||
                                "{}"
                            );
                            return userInfo.username
                              ? ` Connected as @${userInfo.username}`
                              : "";
                          })()}
                        </p>
                        <button
                          onClick={() => setShowInstagramDashboard(true)}
                          className={styles.viewDashboardButton}
                        >
                          View Instagram Dashboard
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Fallback: Classic Instagram Insights */}
              {!showConnectInstagram && !instagramConnected && (
                <InstagramInsights creatorId={1} autoSync={false} />
              )}
            </motion.div>

            {/* AI Content Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
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
              transition={{ duration: 0.6, delay: 0.3 }}
              className={styles.section}
            >
              <AdvancedAnalytics creatorId={1} />
            </motion.div>

            {/* Sentiment Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={styles.section}
            >
              <SentimentAnalysis contentId="latest-post" timeRange="7d" />
            </motion.div>

            {/* Original Campaigns Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
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
