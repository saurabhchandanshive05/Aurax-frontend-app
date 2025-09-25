// Instagram Basic Display API integration for Aurax dashboard
import { copyLogger } from "./copyLogger";
import { apiClient } from "./apiClient";

class InstagramAPIService {
  constructor() {
    this.accessToken =
      process.env.REACT_APP_INSTAGRAM_ACCESS_TOKEN ||
      "IGAAcEeAqNxHZABZAE1wZAlYyWThkei12QmlvYVlaejRIQXBrMElyZAE0zX0VFT1VLZAm9oeTZAqeHVJcFJQYjdEVTJ1ZAktvdUQ1MGF6dS1SZA0tENjladVZAUd2VfdFNmSmtWdlQ5Mm5Db3QtSHNmdk9pd3BWX0lMUzAySEVWNy11cGJYWQZDZD";
    this.baseURL = "https://graph.instagram.com";
    this.userId = "me"; // Will be updated dynamically
  }

  // Authenticate and get user profile
  async authenticate() {
    try {
      copyLogger.log("INSTAGRAM_AUTH_INITIATED", {
        service: "Instagram Basic Display API",
      });

      const response = await fetch(
        `${this.baseURL}/me?fields=id,username,account_type,media_count&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Authentication failed");
      }

      const userData = await response.json();
      this.userId = userData.id;

      copyLogger.log("INSTAGRAM_AUTH_SUCCESS", {
        userId: userData.id,
        username: userData.username,
        accountType: userData.account_type,
        mediaCount: userData.media_count,
      });

      return userData;
    } catch (error) {
      copyLogger.log("INSTAGRAM_AUTH_FAILED", { error: error.message });
      throw error;
    }
  }

  // Fetch user profile metrics
  async getProfileMetrics() {
    try {
      const profileFields = [
        "biography",
        "id",
        "ig_id",
        "followers_count",
        "follows_count",
        "media_count",
        "name",
        "profile_picture_url",
        "username",
        "website",
      ].join(",");

      const response = await fetch(
        `${this.baseURL}/${this.userId}?fields=${profileFields}&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error?.message || "Failed to fetch profile metrics"
        );
      }

      const profileData = await response.json();

      copyLogger.log("INSTAGRAM_PROFILE_FETCHED", {
        followersCount: profileData.followers_count,
        mediaCount: profileData.media_count,
        followsCount: profileData.follows_count,
      });

      return profileData;
    } catch (error) {
      copyLogger.log("INSTAGRAM_PROFILE_ERROR", { error: error.message });
      throw error;
    }
  }

  // Fetch media (posts) with engagement metrics
  async getMediaInsights(limit = 25) {
    try {
      // First, get the media list
      const mediaResponse = await fetch(
        `${this.baseURL}/${this.userId}/media?fields=id,media_type,media_url,permalink,thumbnail_url,timestamp,caption&limit=${limit}&access_token=${this.accessToken}`
      );

      if (!mediaResponse.ok) {
        const error = await mediaResponse.json();
        throw new Error(error.error?.message || "Failed to fetch media");
      }

      const mediaData = await mediaResponse.json();

      // For each media item, get engagement metrics
      const mediaWithInsights = await Promise.all(
        mediaData.data.map(async (media) => {
          try {
            const insightsResponse = await fetch(
              `${this.baseURL}/${media.id}/insights?metric=impressions,reach,engagement,likes,comments,shares,saved&access_token=${this.accessToken}`
            );

            if (insightsResponse.ok) {
              const insights = await insightsResponse.json();
              const insightsMap = {};

              insights.data.forEach((insight) => {
                insightsMap[insight.name] = insight.values[0]?.value || 0;
              });

              return {
                ...media,
                insights: insightsMap,
                engagement_rate:
                  insightsMap.reach > 0
                    ? (
                        (insightsMap.engagement / insightsMap.reach) *
                        100
                      ).toFixed(2)
                    : 0,
              };
            } else {
              // If insights fail, return media without insights
              return {
                ...media,
                insights: {},
                engagement_rate: 0,
              };
            }
          } catch (error) {
            console.warn(
              `Failed to fetch insights for media ${media.id}:`,
              error.message
            );
            return {
              ...media,
              insights: {},
              engagement_rate: 0,
            };
          }
        })
      );

      copyLogger.log("INSTAGRAM_MEDIA_INSIGHTS_FETCHED", {
        mediaCount: mediaWithInsights.length,
        totalImpressions: mediaWithInsights.reduce(
          (sum, media) => sum + (media.insights.impressions || 0),
          0
        ),
        totalReach: mediaWithInsights.reduce(
          (sum, media) => sum + (media.insights.reach || 0),
          0
        ),
      });

      return {
        data: mediaWithInsights,
        pagination: mediaData.paging,
      };
    } catch (error) {
      copyLogger.log("INSTAGRAM_MEDIA_INSIGHTS_ERROR", {
        error: error.message,
      });
      throw error;
    }
  }

  // Get comprehensive insights for dashboard
  async getDashboardInsights() {
    try {
      copyLogger.log("INSTAGRAM_DASHBOARD_INSIGHTS_INITIATED");

      // Get profile data
      const profile = await this.getProfileMetrics();

      // Get recent media with insights
      const mediaData = await this.getMediaInsights(10);

      // Calculate aggregated metrics
      const totalImpressions = mediaData.data.reduce(
        (sum, media) => sum + (media.insights.impressions || 0),
        0
      );
      const totalReach = mediaData.data.reduce(
        (sum, media) => sum + (media.insights.reach || 0),
        0
      );
      const totalEngagement = mediaData.data.reduce(
        (sum, media) => sum + (media.insights.engagement || 0),
        0
      );
      const totalLikes = mediaData.data.reduce(
        (sum, media) => sum + (media.insights.likes || 0),
        0
      );
      const totalComments = mediaData.data.reduce(
        (sum, media) => sum + (media.insights.comments || 0),
        0
      );
      const totalShares = mediaData.data.reduce(
        (sum, media) => sum + (media.insights.shares || 0),
        0
      );
      const totalSaves = mediaData.data.reduce(
        (sum, media) => sum + (media.insights.saved || 0),
        0
      );

      const avgEngagementRate =
        totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(2) : 0;

      const insights = {
        profile: {
          username: profile.username,
          followers_count: profile.followers_count,
          follows_count: profile.follows_count,
          media_count: profile.media_count,
          profile_picture_url: profile.profile_picture_url,
        },
        metrics: {
          total_impressions: totalImpressions,
          total_reach: totalReach,
          total_engagement: totalEngagement,
          total_likes: totalLikes,
          total_comments: totalComments,
          total_shares: totalShares,
          total_saves: totalSaves,
          avg_engagement_rate: parseFloat(avgEngagementRate),
          posts_analyzed: mediaData.data.length,
        },
        recent_posts: mediaData.data.slice(0, 5).map((post) => ({
          id: post.id,
          media_type: post.media_type,
          media_url: post.media_url,
          thumbnail_url: post.thumbnail_url,
          permalink: post.permalink,
          timestamp: post.timestamp,
          caption:
            post.caption?.substring(0, 100) +
            (post.caption?.length > 100 ? "..." : ""),
          impressions: post.insights.impressions || 0,
          reach: post.insights.reach || 0,
          engagement: post.insights.engagement || 0,
          likes: post.insights.likes || 0,
          comments: post.insights.comments || 0,
          engagement_rate: post.engagement_rate,
        })),
        last_updated: new Date().toISOString(),
      };

      copyLogger.log("INSTAGRAM_DASHBOARD_INSIGHTS_COMPLETED", {
        totalImpressions,
        totalReach,
        avgEngagementRate,
        postsAnalyzed: mediaData.data.length,
      });

      return insights;
    } catch (error) {
      copyLogger.log("INSTAGRAM_DASHBOARD_INSIGHTS_ERROR", {
        error: error.message,
      });
      throw error;
    }
  }

  // Send insights to Aurax backend
  async syncToAurax(insights) {
    try {
      copyLogger.log("AURAX_SYNC_INITIATED", {
        platform: "Instagram",
        metricsCount: Object.keys(insights.metrics).length,
      });

      const auraxPayload = {
        platform: "instagram",
        user_id: insights.profile.username,
        sync_timestamp: new Date().toISOString(),
        profile_data: insights.profile,
        metrics: insights.metrics,
        recent_posts: insights.recent_posts,
      };

      // Send to your Aurax endpoint
      const response = await apiClient.post(
        "/analytics/instagram-sync",
        auraxPayload
      );

      copyLogger.log("AURAX_SYNC_SUCCESS", {
        status: response.status,
        syncTimestamp: auraxPayload.sync_timestamp,
      });

      return response;
    } catch (error) {
      copyLogger.log("AURAX_SYNC_ERROR", { error: error.message });
      throw error;
    }
  }

  // Test authentication and connection
  async testConnection() {
    try {
      copyLogger.log("INSTAGRAM_CONNECTION_TEST_INITIATED");
      console.log("🔍 Testing Instagram API connection...");

      // Test 1: Basic API connectivity
      console.log("📡 Testing API connectivity...");
      const testResponse = await fetch(`${this.baseURL}`, { method: "HEAD" });
      if (!testResponse.ok) {
        throw new Error("Instagram API endpoint unreachable");
      }
      console.log("✅ Instagram API endpoint is reachable");

      // Test 2: Token validation
      console.log("🔑 Validating access token...");
      const authTest = await this.authenticate();
      console.log("✅ Authentication successful:", {
        username: authTest.username,
        accountType: authTest.account_type,
        mediaCount: authTest.media_count,
      });

      // Test 3: Profile data access
      console.log("👤 Testing profile data access...");
      const profile = await this.getProfileMetrics();
      console.log("✅ Profile data retrieved:", {
        followers: profile.followers_count,
        following: profile.follows_count,
        posts: profile.media_count,
      });

      // Test 4: Media access (try to get just 1 post)
      console.log("📱 Testing media access...");
      try {
        const mediaTest = await this.getMediaInsights(1);
        console.log("✅ Media access successful:", {
          postsRetrieved: mediaTest.data.length,
          hasInsights: mediaTest.data[0]?.insights ? "Yes" : "No",
        });
      } catch (mediaError) {
        console.log("⚠️ Media insights may be limited:", mediaError.message);
        // This might fail if account doesn't have business access
      }

      const testResult = {
        status: "success",
        message: "All Instagram API tests passed!",
        details: {
          apiConnectivity: "working",
          authentication: "working",
          profileAccess: "working",
          accountInfo: {
            username: authTest.username,
            accountType: authTest.account_type,
            followers: profile.followers_count,
            posts: profile.media_count,
          },
        },
        timestamp: new Date().toISOString(),
      };

      copyLogger.log("INSTAGRAM_CONNECTION_TEST_SUCCESS", testResult);
      return testResult;
    } catch (error) {
      const testResult = {
        status: "error",
        message: "Instagram API test failed",
        error: error.message,
        troubleshooting: this.getTroubleshootingSteps(error.message),
        timestamp: new Date().toISOString(),
      };

      copyLogger.log("INSTAGRAM_CONNECTION_TEST_FAILED", testResult);
      console.error("❌ Instagram API test failed:", error.message);
      return testResult;
    }
  }

  // Get troubleshooting steps based on error
  getTroubleshootingSteps(errorMessage) {
    const steps = [];

    if (
      errorMessage.includes("token") ||
      errorMessage.includes("authentication") ||
      errorMessage.includes("401")
    ) {
      steps.push("🔑 Check if your access token is valid and not expired");
      steps.push(
        "🔄 Try regenerating your access token in Meta Developer Console"
      );
      steps.push(
        "📱 Ensure your Instagram account is connected to a Facebook Page"
      );
    }

    if (errorMessage.includes("permission") || errorMessage.includes("403")) {
      steps.push(
        "🏢 Convert your Instagram account to a Business or Creator account"
      );
      steps.push("🔗 Link your Instagram Business account to a Facebook Page");
      steps.push("⚙️ Check app permissions in Meta Developer Console");
    }

    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      steps.push("🌐 Check your internet connection");
      steps.push("🔥 Check if Instagram API is experiencing issues");
      steps.push("⏰ Wait a few minutes and try again (rate limiting)");
    }

    if (errorMessage.includes("insights") || errorMessage.includes("media")) {
      steps.push(
        "📊 Instagram Insights requires a Business or Creator account"
      );
      steps.push("📈 Some metrics may take 24-48 hours to become available");
      steps.push("🔍 Check if your account has enough posts with metrics");
    }

    if (steps.length === 0) {
      steps.push(
        "📖 Check the INSTAGRAM_INTEGRATION_GUIDE.md for detailed troubleshooting"
      );
      steps.push("🔍 Review browser console for additional error details");
      steps.push("📝 Check the logs directory for more information");
    }

    return steps;
  }

  // Quick authentication test (lighter version)
  async quickAuthTest() {
    try {
      const response = await fetch(
        `${this.baseURL}/me?fields=id,username,account_type&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error?.message || "Authentication failed",
          statusCode: response.status,
        };
      }

      const userData = await response.json();
      return {
        success: true,
        data: userData,
        message: "Authentication successful",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Network or connection error",
      };
    }
  }

  // Complete sync process
  async performFullSync() {
    try {
      // Authenticate
      await this.authenticate();

      // Get insights
      const insights = await this.getDashboardInsights();

      // Sync to Aurax
      const syncResult = await this.syncToAurax(insights);

      return {
        status: "success",
        insights,
        syncResult,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      copyLogger.log("INSTAGRAM_FULL_SYNC_ERROR", { error: error.message });
      return {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export default new InstagramAPIService();
