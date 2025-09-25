const express = require("express");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token required",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: "Invalid or expired token",
      });
    }
    req.user = user;
    next();
  });
};

// Get Instagram profile and media data
router.get("/profile", async (req, res) => {
  try {
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "Instagram access token is required",
      });
    }

    console.log("🔍 Fetching Instagram profile data...");

    // Step 1: Get basic profile info
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count,followers_count,follows_count&access_token=${accessToken}`
    );

    if (!profileResponse.ok) {
      const error = await profileResponse.json();
      throw new Error(error.error?.message || "Failed to fetch profile");
    }

    const profileData = await profileResponse.json();
    console.log(`✅ Profile fetched for @${profileData.username}`);

    // Step 2: Get profile picture from Facebook Graph API
    let profilePicture = null;
    try {
      const pictureResponse = await fetch(
        `https://graph.facebook.com/v20.0/${profileData.id}/picture?redirect=false&access_token=${accessToken}`
      );

      if (pictureResponse.ok) {
        const pictureData = await pictureResponse.json();
        profilePicture = pictureData.data?.url || null;
      }
    } catch (pictureError) {
      console.warn("⚠️ Profile picture fetch failed:", pictureError.message);
    }

    // Step 3: Get recent media posts
    const mediaResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,timestamp,like_count,comments_count,media_type,thumbnail_url&limit=12&access_token=${accessToken}`
    );

    let mediaData = { data: [] };
    if (mediaResponse.ok) {
      mediaData = await mediaResponse.json();
      console.log(`✅ Media fetched: ${mediaData.data.length} posts`);
    } else {
      console.warn("⚠️ Media fetch failed, continuing without media");
    }

    // Step 4: Format and enhance media data
    const enhancedMedia = mediaData.data.map((post) => ({
      id: post.id,
      caption: post.caption || "",
      media_url: post.media_url,
      thumbnail_url: post.thumbnail_url || post.media_url,
      permalink: post.permalink,
      timestamp: post.timestamp,
      like_count: post.like_count || 0,
      comments_count: post.comments_count || 0,
      media_type: post.media_type || "IMAGE",
      formatted_date: new Date(post.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      engagement: (post.like_count || 0) + (post.comments_count || 0),
    }));

    // Step 5: Calculate engagement metrics
    const totalLikes = enhancedMedia.reduce(
      (sum, post) => sum + post.like_count,
      0
    );
    const totalComments = enhancedMedia.reduce(
      (sum, post) => sum + post.comments_count,
      0
    );
    const totalEngagement = totalLikes + totalComments;
    const avgEngagement =
      enhancedMedia.length > 0
        ? Math.round(totalEngagement / enhancedMedia.length)
        : 0;
    const engagementRate =
      profileData.followers_count > 0
        ? (
            (totalEngagement /
              (enhancedMedia.length * profileData.followers_count)) *
            100
          ).toFixed(2)
        : "0.00";

    // Step 6: Format final response
    const response = {
      success: true,
      profile: {
        id: profileData.id,
        username: profileData.username,
        account_type: profileData.account_type,
        media_count: profileData.media_count,
        followers_count: profileData.followers_count || 0,
        follows_count: profileData.follows_count || 0,
        profile_picture_url: profilePicture,
        engagement_metrics: {
          total_likes: totalLikes,
          total_comments: totalComments,
          total_engagement: totalEngagement,
          avg_engagement_per_post: avgEngagement,
          engagement_rate: parseFloat(engagementRate),
        },
      },
      media: enhancedMedia,
      meta: {
        posts_fetched: enhancedMedia.length,
        fetched_at: new Date().toISOString(),
        api_version: "v20.0",
      },
    };

    console.log(
      `🎉 Instagram data successfully processed for @${profileData.username}`
    );
    res.json(response);
  } catch (error) {
    console.error("❌ Instagram API Error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
      troubleshooting: [
        "Verify your access token is valid and not expired",
        "Ensure your Instagram account is Business or Creator type",
        "Check that your account is linked to a Facebook Page",
        "Confirm your app has the required permissions",
      ],
    });
  }
});

// Get Instagram insights (Business/Creator accounts only)
router.get("/insights", async (req, res) => {
  try {
    const { accessToken, mediaId } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "Access token is required",
      });
    }

    // Get insights for specific media or account
    const insightsUrl = mediaId
      ? `https://graph.instagram.com/${mediaId}/insights?metric=impressions,reach,engagement&access_token=${accessToken}`
      : `https://graph.instagram.com/me/insights?metric=impressions,reach,profile_views&period=day&access_token=${accessToken}`;

    const insightsResponse = await fetch(insightsUrl);

    if (!insightsResponse.ok) {
      const error = await insightsResponse.json();
      throw new Error(error.error?.message || "Failed to fetch insights");
    }

    const insightsData = await insightsResponse.json();

    res.json({
      success: true,
      insights: insightsData.data,
      meta: {
        media_id: mediaId || null,
        fetched_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Instagram Insights Error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
      note: "Insights require Instagram Business or Creator account",
    });
  }
});

// Get user's saved Instagram connection status
router.get("/connection-status", authenticateToken, (req, res) => {
  try {
    // In production, fetch from MongoDB
    const user = global.mockUsers
      ? global.mockUsers.find((u) => u.id === req.user.userId)
      : null;

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const instagram = user.instagram || { connected: false };

    res.json({
      success: true,
      instagram: {
        connected: instagram.connected,
        username: instagram.profile?.username || null,
        profile_picture_url: instagram.profile?.profile_picture_url || null,
        followers_count: instagram.profile?.followers_count || 0,
        connected_at: instagram.connectedAt || null,
        token_expires_at: instagram.tokenExpiresAt || null,
      },
    });
  } catch (error) {
    console.error("❌ Connection status error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get connection status",
      message: error.message,
    });
  }
});

// Get recent media for authenticated user
router.get("/media", authenticateToken, async (req, res) => {
  try {
    // Get user's Instagram access token
    const user = global.mockUsers
      ? global.mockUsers.find((u) => u.id === req.user.userId)
      : null;

    if (!user || !user.instagram?.connected || !user.instagram?.accessToken) {
      return res.status(400).json({
        success: false,
        error: "Instagram account not connected",
      });
    }

    const accessToken = user.instagram.accessToken;
    const limit = req.query.limit || 12;

    // Fetch media from Instagram
    const mediaResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,timestamp,like_count,comments_count,media_type,thumbnail_url&limit=${limit}&access_token=${accessToken}`
    );

    if (!mediaResponse.ok) {
      const error = await mediaResponse.json();
      throw new Error(error.error?.message || "Failed to fetch media");
    }

    const mediaData = await mediaResponse.json();

    // Format media data
    const formattedMedia = mediaData.data.map((post) => ({
      id: post.id,
      caption: post.caption || "",
      media_url: post.media_url,
      thumbnail_url: post.thumbnail_url || post.media_url,
      permalink: post.permalink,
      timestamp: post.timestamp,
      like_count: post.like_count || 0,
      comments_count: post.comments_count || 0,
      media_type: post.media_type || "IMAGE",
      formatted_date: new Date(post.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      engagement: (post.like_count || 0) + (post.comments_count || 0),
    }));

    res.json({
      success: true,
      media: formattedMedia,
      meta: {
        count: formattedMedia.length,
        fetched_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Media fetch error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Health check for Instagram API
router.get("/status", (req, res) => {
  res.json({
    success: true,
    message: "Instagram API routes are active",
    endpoints: [
      "GET /api/instagram/profile?accessToken=...",
      "GET /api/instagram/insights?accessToken=...",
      "GET /api/instagram/connection-status (requires auth)",
      "GET /api/instagram/media (requires auth)",
      "GET /api/instagram/status",
    ],
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
