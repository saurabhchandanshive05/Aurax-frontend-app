const express = require("express");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Import shared users array from auth routes
const authModule = require("./auth");
const { users, authenticateToken } = authModule;

// Instagram OAuth callback - Exchange code for access token
router.post("/oauth/callback", async (req, res) => {
  try {
    const { code, state } = req.body;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    console.log("🔄 Processing Instagram OAuth callback...");

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Authorization code is required",
      });
    }

    // Step 1: Exchange authorization code for short-lived access token
    const tokenUrl = "https://api.instagram.com/oauth/access_token";
    const tokenParams = new URLSearchParams({
      client_id: process.env.INSTAGRAM_CLIENT_ID,
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
      code: code,
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams,
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error("❌ Token exchange failed:", error);
      throw new Error(
        error.error_message || "Failed to exchange authorization code"
      );
    }

    const tokenData = await tokenResponse.json();
    console.log("✅ Short-lived token obtained");

    // Step 2: Exchange short-lived token for long-lived token
    const longLivedTokenUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${tokenData.access_token}`;

    const longLivedResponse = await fetch(longLivedTokenUrl, {
      method: "GET",
    });

    let finalAccessToken = tokenData.access_token;
    let tokenExpiresIn = 3600; // 1 hour for short-lived

    if (longLivedResponse.ok) {
      const longLivedData = await longLivedResponse.json();
      finalAccessToken = longLivedData.access_token;
      tokenExpiresIn = longLivedData.expires_in || 5184000; // 60 days for long-lived
      console.log("✅ Long-lived token obtained");
    } else {
      console.warn(
        "⚠️ Long-lived token exchange failed, using short-lived token"
      );
    }

    // Step 3: Get Instagram profile data
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${finalAccessToken}`
    );

    if (!profileResponse.ok) {
      const error = await profileResponse.json();
      throw new Error(
        error.error?.message || "Failed to fetch Instagram profile"
      );
    }

    const profileData = await profileResponse.json();
    console.log(`✅ Instagram profile fetched: @${profileData.username}`);

    // Step 4: If user is authenticated, save to their profile
    let savedToUser = false;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userIndex = users.findIndex((u) => u.id === decoded.userId);

        if (userIndex >= 0) {
          users[userIndex].instagram = {
            connected: true,
            accessToken: finalAccessToken,
            tokenExpiresAt: new Date(Date.now() + tokenExpiresIn * 1000),
            profile: profileData,
            connectedAt: new Date(),
          };
          console.log(`✅ Instagram connected for user: ${decoded.username}`);
          savedToUser = true;
        }
      } catch (error) {
        console.warn(
          "⚠️ Failed to save Instagram connection to user profile:",
          error.message
        );
      }
    }

    res.json({
      success: true,
      message: "Instagram connected successfully",
      instagram: {
        connected: true,
        profile: profileData,
        access_token: finalAccessToken,
        expires_in: tokenExpiresIn,
        token_type: "Bearer",
        saved_to_user: savedToUser,
      },
    });
  } catch (error) {
    console.error("❌ Instagram OAuth error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      troubleshooting: [
        "Verify Instagram Client ID and Secret are correct",
        "Check that redirect URI matches exactly",
        "Ensure authorization code is valid and not expired",
        "Confirm Instagram app is properly configured",
      ],
    });
  }
});

// Validate Instagram access token
router.post("/oauth/validate", async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "Access token is required",
      });
    }

    // Test the token by making a simple API call
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${accessToken}`
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(400).json({
        success: false,
        error: "Invalid or expired access token",
        details: error.error?.message,
      });
    }

    const data = await response.json();

    res.json({
      success: true,
      valid: true,
      instagram_user: data,
    });
  } catch (error) {
    console.error("❌ Token validation error:", error);
    res.status(500).json({
      success: false,
      error: "Token validation failed",
      message: error.message,
    });
  }
});

// Refresh Instagram access token (for long-lived tokens)
router.post("/oauth/refresh", async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "Access token is required",
      });
    }

    // Refresh long-lived token (extends expiry by another 60 days)
    const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`;

    const response = await fetch(refreshUrl, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to refresh token");
    }

    const data = await response.json();

    res.json({
      success: true,
      access_token: data.access_token,
      token_type: "Bearer",
      expires_in: data.expires_in || 5184000, // 60 days
    });
  } catch (error) {
    console.error("❌ Token refresh error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get Instagram OAuth URL
router.get("/oauth/url", (req, res) => {
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI);
  const scope = "user_profile,user_media";
  const responseType = "code";
  const state = Math.random().toString(36).substring(7); // Simple state parameter

  const oauthUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}&state=${state}`;

  res.json({
    success: true,
    oauth_url: oauthUrl,
    state: state,
    client_id: clientId,
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
    scope: scope,
  });
});

// Get user's Instagram connection status
router.get("/connection-status", authenticateToken, (req, res) => {
  try {
    const user = users.find((u) => u.id === req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      instagram: {
        connected: user.instagram.connected || false,
        profile: user.instagram.connected ? user.instagram.profile : null,
        connected_at: user.instagram.connectedAt || null,
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

// Disconnect Instagram account
router.post("/disconnect", authenticateToken, async (req, res) => {
  try {
    const userIndex = users.findIndex((u) => u.id === req.user.userId);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    users[userIndex].instagram = {
      connected: false,
      accessToken: null,
      profile: null,
    };

    console.log(`✅ Instagram disconnected for user: ${req.user.username}`);

    res.json({
      success: true,
      message: "Instagram account disconnected successfully",
    });
  } catch (error) {
    console.error("❌ Disconnect error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to disconnect Instagram account",
      message: error.message,
    });
  }
});

module.exports = router;
