// Instagram OAuth Backend Routes for Aurax Platform
// File: backend-instagram-oauth-routes.js (Place this in your backend-copy directory)

const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

// Instagram OAuth Configuration
const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID || "your-client-id";
const INSTAGRAM_CLIENT_SECRET =
  process.env.INSTAGRAM_CLIENT_SECRET || "your-client-secret";

// Exchange OAuth code for access token
router.post("/instagram/oauth/token", async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;

    if (!code || !redirect_uri) {
      return res.status(400).json({
        success: false,
        error: "Authorization code and redirect URI are required",
      });
    }

    console.log("🔄 Exchanging Instagram OAuth code for access token...");

    // Step 1: Exchange code for short-lived access token
    const tokenResponse = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: INSTAGRAM_CLIENT_ID,
          client_secret: INSTAGRAM_CLIENT_SECRET,
          grant_type: "authorization_code",
          redirect_uri: decodeURIComponent(redirect_uri),
          code: code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new Error(error.error_message || "Token exchange failed");
    }

    const tokenData = await tokenResponse.json();
    console.log("✅ Short-lived token obtained");

    // Step 2: Exchange short-lived token for long-lived token
    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_CLIENT_SECRET}&access_token=${tokenData.access_token}`
    );

    let finalToken = tokenData.access_token;
    let expiresIn = 3600; // 1 hour default

    if (longLivedTokenResponse.ok) {
      const longLivedData = await longLivedTokenResponse.json();
      finalToken = longLivedData.access_token;
      expiresIn = longLivedData.expires_in || 5183944; // ~60 days
      console.log(
        "✅ Long-lived token obtained, expires in:",
        expiresIn,
        "seconds"
      );
    } else {
      console.log(
        "⚠️ Long-lived token exchange failed, using short-lived token"
      );
    }

    // Step 3: Get basic profile info to validate token
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${finalToken}`
    );

    if (!profileResponse.ok) {
      throw new Error("Failed to validate access token");
    }

    const profileData = await profileResponse.json();
    console.log(`✅ Token validated for user: @${profileData.username}`);

    res.json({
      success: true,
      access_token: finalToken,
      expires_in: expiresIn,
      token_type: "bearer",
      user_info: {
        id: profileData.id,
        username: profileData.username,
        account_type: profileData.account_type,
      },
      message: "Instagram OAuth completed successfully",
    });
  } catch (error) {
    console.error("❌ Instagram OAuth Error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
      troubleshooting: [
        "Verify your Instagram Client ID and Secret are correct",
        "Ensure your redirect URI is whitelisted in Instagram app settings",
        "Check that the authorization code has not expired",
        "Confirm your Instagram app is in Live mode (not Test mode)",
      ],
    });
  }
});

// Refresh Instagram access token
router.post("/instagram/oauth/refresh", async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: "Access token is required",
      });
    }

    console.log("🔄 Refreshing Instagram access token...");

    // Refresh long-lived token (extends expiration)
    const refreshResponse = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${access_token}`
    );

    if (!refreshResponse.ok) {
      const error = await refreshResponse.json();
      throw new Error(error.error?.message || "Token refresh failed");
    }

    const refreshData = await refreshResponse.json();
    console.log(
      "✅ Instagram token refreshed, expires in:",
      refreshData.expires_in,
      "seconds"
    );

    res.json({
      success: true,
      access_token: refreshData.access_token,
      expires_in: refreshData.expires_in,
      token_type: "bearer",
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("❌ Instagram token refresh error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
      note: "Token may have expired and require re-authorization",
    });
  }
});

// Validate Instagram access token
router.get("/instagram/oauth/validate", async (req, res) => {
  try {
    const { access_token } = req.query;

    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: "Access token is required",
      });
    }

    // Test token by fetching basic profile info
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${access_token}`
    );

    if (!profileResponse.ok) {
      const error = await profileResponse.json();
      return res.status(401).json({
        success: false,
        error: "Invalid or expired access token",
        details: error,
      });
    }

    const profileData = await profileResponse.json();

    res.json({
      success: true,
      valid: true,
      user_info: {
        id: profileData.id,
        username: profileData.username,
        account_type: profileData.account_type,
      },
      message: "Access token is valid",
    });
  } catch (error) {
    console.error("❌ Instagram token validation error:", error.message);

    res.status(500).json({
      success: false,
      error: "Token validation failed",
      message: error.message,
    });
  }
});

// Revoke Instagram access token
router.post("/instagram/oauth/revoke", async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: "Access token is required",
      });
    }

    // Instagram doesn't have a direct revoke endpoint, but we can test if token is still valid
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id&access_token=${access_token}`
    );

    res.json({
      success: true,
      message:
        "Token revocation requested. Please remove app permissions from Instagram settings.",
      revoked: !profileResponse.ok,
      instructions: [
        "Go to Instagram app → Settings → Security → Apps and Websites",
        'Find "Aurax" in the Active list',
        'Click "Remove" to revoke access permanently',
      ],
    });
  } catch (error) {
    console.error("❌ Instagram token revocation error:", error.message);

    res.status(500).json({
      success: false,
      error: "Token revocation failed",
      message: error.message,
    });
  }
});

module.exports = router;
