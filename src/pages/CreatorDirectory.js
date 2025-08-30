// src/pages/CreatorDirectory.js
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./CreatorDirectory.css";

const CreatorDirectory = () => {
  const [activeCategory, setActiveCategory] = useState("creation");

  // AURAX AI Performance Data
  const performanceData = {
    contentPerformance: {
      title: "Content Performance Analysis",
      text: "Your 'Gaming Setup' carousel has a 45% higher engagement rate than your average. Our AI detected high intent-to-purchase signals in the comments. We've auto-generated a similar Reel idea for you.",
      cta: "View AI Concept",
      metric: "45%",
      trend: "higher",
      category: "gaming",
    },
    dealReadiness: {
      title: "Deal Readiness Score",
      text: "Your Aura Score is 82/100. You're highly likely to secure a deal in the Tech category. Your audience has a 35% higher disposable income than the platform average. 2 new potential matches found.",
      cta: "Review Matches",
      score: "82/100",
      category: "tech",
      matches: 2,
    },
  };

  // Instagram-Inspired Categories (based on the detailed breakdown from images)
  const categories = [
    {
      id: "creation",
      title: "Creation",
      description: "Crack the Code: How Instagram Works & How to Go Viral",
      aiResources: "Hook Analyzer + AI Ideation",
      strategicImplication:
        "Your first audience is the algorithm, not people. AI helps you pass Instagram's initial test.",
      icon: "🎬",
      color: "#FF6B6B",
      features: [
        {
          title: "Win the First 3 Seconds",
          description:
            "Use a hook (visual surprise, bold statement, or on-screen text) to capture attention instantly",
          tip: "Hook Analyzer: Upload a Reel and get a frame-by-frame breakdown of why people stayed",
        },
        {
          title: "Front-Load Value",
          description:
            "Show the payoff early, then explain. Deliver value throughout the entire piece",
          tip: "AI-Powered Ideation: Generate 10 new hooks and concepts inspired by your own top content",
        },
        {
          title: "Technical Quality Matters",
          description:
            "Record at least in 720p resolution with clear lighting and sound",
          tip: "AI Content Audit: Run analysis to identify patterns that drive engagement",
        },
        {
          title: "Key Signals for Virality",
          description:
            "Retention Rate (3s+), Completion Rate, Replay Rate, and Engagement Actions",
          tip: "Pass the Initial Test: Strong early signals trigger larger distribution",
        },
      ],
    },
    {
      id: "engagement",
      title: "Engagement",
      description:
        "Engagement is the strongest growth engine. It tells Instagram that your content doesn't just get watched – it gets people to act.",
      aiResources: "Engagement Decoder + Response Assistant",
      strategicImplication:
        "Engagement isn't equal. Shares > Saves > Comments > Likes. Instagram ranks content higher if people repeatedly interact.",
      icon: "💬",
      color: "#4ECDC4",
      features: [
        {
          title: "Ask Questions in Captions",
          description:
            "Spark comments by asking engaging questions that encourage viewer participation",
          tip: "Engagement Decoder: Analyze 649+ interactions and identify your Top 100 brand advocates",
        },
        {
          title: "Use Polls and Stickers",
          description:
            "Turn viewers into participants with interactive elements that collect data",
          tip: "Poll Generator: Craft engaging polls that also collect data for future content",
        },
        {
          title: "Create Tag-a-Friend Moments",
          description:
            "Use relatable, sharable themes that encourage viewers to tag their friends",
          tip: "Response Assistant: Auto-suggest authentic replies to keep the conversation flowing",
        },
        {
          title: "Engagement Hierarchy",
          description:
            "Shares (most powerful) > Saves (long-term value) > Comments (conversation) > Likes (positive but lowest)",
          tip: "Track your engagement quality, not just quantity",
        },
      ],
    },
    {
      id: "reach",
      title: "Reach",
      description:
        "Reach is how your content travels from a small audience to a massive stage. Instagram's algorithm uses progressive testing.",
      aiResources: "Reach Simulator + Algorithm Dashboard",
      strategicImplication:
        "Three-stage distribution: Small batch test → Strong signals → Breakout content on Explore and Trending.",
      icon: "📡",
      color: "#45B7D1",
      features: [
        {
          title: "Monitor Retention Rate",
          description:
            "Aim for at least 70% of viewers still watching at 3 seconds",
          tip: "Reach Simulator: Predict how far your next Reel could travel before posting",
        },
        {
          title: "Use Trending Sounds",
          description:
            "Enter larger discovery galleries and increase non-follower reach by 50%",
          tip: "Algorithm Dashboard: See follower vs. non-follower reach in real-time",
        },
        {
          title: "Keep Captions Short",
          description: "Make captions value-packed and easy to digest",
          tip: "Shadowban Test: Confirm your account has no hidden restrictions limiting growth",
        },
        {
          title: "Progressive Testing Stages",
          description:
            "Stage 1: Small batch test → Stage 2: Strong signals → Stage 3: Breakout content on Explore",
          tip: "Focus on performance signals, not posting time",
        },
      ],
    },
    {
      id: "monetization",
      title: "Monetization",
      description:
        "High reach and engagement lead to financial opportunities. Brands prioritize influence and consistent audience trust.",
      aiResources: "Aura Score Calculator + Earnings Forecast",
      strategicImplication:
        "Meet thresholds in engagement, consistency, and compliance. Build authority in a niche, not every trend.",
      icon: "💰",
      color: "#96CEB4",
      features: [
        {
          title: "Build Authority in a Niche",
          description:
            "Don't chase every trend. Focus on becoming an expert in your specific area",
          tip: "Aura Score Calculator: Unified metric across Creation, Engagement, and Reach",
        },
        {
          title: "Maintain Consistency",
          description:
            "Post at least 3-4 times per week to keep signals strong and build trust",
          tip: "Earnings Forecast: Project monetization potential by converting interactions into revenue",
        },
        {
          title: "Track Audience Demographics",
          description:
            "Brands require proof of fit. Know your audience inside and out",
          tip: "Interactive Education Cards: Learn how to pass Instagram's algorithm test",
        },
        {
          title: "Brand Analysis Metrics",
          description:
            "Engagement rate (likes + comments ÷ followers), Audience quality, Aura of influence",
          tip: "Your First Audience is the Algorithm 🤖 - Pass the Initial Test with strong signals",
        },
      ],
    },
  ];

  // Professional Algorithm Insights (Apple-style)
  const algorithmInsights = [
    {
      id: "ai-content-analyzer",
      title: "AI Content Analyzer",
      subtitle: "Optimize Your Content Performance",
      description:
        "Upload your Reels and get instant AI analysis of what drives engagement. Our AI identifies patterns in your top-performing content and suggests improvements.",
      metrics: [
        { label: "Content Score", value: "92/100", target: "AI rating" },
        {
          label: "Engagement Boost",
          value: "+45%",
          target: "predicted increase",
        },
        { label: "Viral Potential", value: "High", target: "AI assessment" },
      ],
      cta: "Analyze Your Content",
      icon: "🤖",
    },
    {
      id: "brand-matching",
      title: "Smart Brand Matching",
      subtitle: "Get Matched with Perfect Brands",
      description:
        "Our AI matches you with brands based on your content style, audience demographics, and engagement rates. No more cold pitching.",
      metrics: [
        { label: "Brand Matches", value: "12", target: "this month" },
        {
          label: "Avg. Deal Value",
          value: "$2,500",
          target: "per collaboration",
        },
        { label: "Response Rate", value: "85%", target: "from brands" },
      ],
      cta: "View Brand Matches",
      icon: "🎯",
    },
    {
      id: "earnings-optimizer",
      title: "Earnings Optimizer",
      subtitle: "Maximize Your Creator Income",
      description:
        "AI-powered rate calculator and earnings forecast based on your metrics, audience value, and market demand. Never undercharge again.",
      metrics: [
        { label: "Rate Increase", value: "+200%", target: "suggested raise" },
        {
          label: "Monthly Potential",
          value: "$15K",
          target: "earnings forecast",
        },
        { label: "ROI Boost", value: "3.2x", target: "higher returns" },
      ],
      cta: "Calculate Your Rates",
      icon: "💰",
    },
  ];

  // Subscription Management Section Data
  const subscriptionCards = [
    {
      id: "analytics",
      icon: "📈",
      title: "Subscribers Analytics",
      description: "Track subscriber growth, churn, and engagement. See a minimal chart and key counts.",
      chart: true,
      stats: [
        { label: "Active Subscribers", value: "1,245" },
        { label: "Churn Rate", value: "2.1%" },
        { label: "Growth (30d)", value: "+8%" },
      ],
    },
    {
      id: "perks",
      icon: "🎁",
      title: "Perks Management",
      description: "Toggle perks ON/OFF, add new perks for your subscribers.",
      perks: [
        { name: "Exclusive Q&A", enabled: true },
        { name: "Monthly Shout-out", enabled: false },
        { name: "Early Access", enabled: true },
      ],
    },
    {
      id: "engagement",
      icon: "💬",
      title: "Engagement Hub",
      description: "Manage Q&A inbox, shout-outs, and live session schedule.",
      inbox: 12,
      shoutouts: 3,
      liveSessions: 2,
    },
    {
      id: "revenue",
      icon: "💰",
      title: "Revenue & Payouts",
      description: "View earnings, next payout date, and insights.",
      earnings: "$4,200",
      payoutDate: "Sep 15, 2025",
      insights: "+18% MoM growth",
    },
    {
      id: "community",
      icon: "🏆",
      title: "Community Highlights",
      description: "See top subscribers and engagement leaderboard.",
      topSubscribers: ["@jennytech", "@maxpower", "@creativemike"],
      leaderboard: [
        { name: "@jennytech", score: 98 },
        { name: "@maxpower", score: 92 },
        { name: "@creativemike", score: 89 },
      ],
    },
    {
      id: "ai",
      icon: "🤖",
      title: "AI Suggestions",
      description: "Personalized growth tips for your subscription business.",
      tips: [
        "Try a live Q&A for top fans next week.",
        "Offer a limited-time perk to boost retention.",
        "Highlight your leaderboard in stories for more engagement.",
      ],
    },
  ];

  const getCurrentCategory = () => {
    return categories.find((cat) => cat.id === activeCategory);
  };

  return (
    <div className="creator-directory">
      {/* Professional Algorithm Insights Section - Premium Apple-inspired UI */}
      <section className="algorithm-insights premium-algorithm-insights">
        <div className="container">
          <motion.div
            className="insights-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="insights-header premium-header">
              <h2 className="insights-title gradient-text premium-title">
                AI-Powered Creator Tools
              </h2>
              <p className="insights-subtitle premium-subtitle">
                Professional tools to grow your influence and maximize earnings
              </p>
            </div>
            <div className="insights-grid premium-grid">
              {algorithmInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  className="insight-card premium-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, boxShadow: "0 20px 48px rgba(102,126,234,0.18)" }}
                >
                  <div className="insight-header premium-card-header">
                    <div className="insight-icon premium-icon">{insight.icon}</div>
                    <div className="insight-title-group">
                      <h3 className="insight-title premium-card-title">{insight.title}</h3>
                      <p className="insight-subtitle premium-card-subtitle">{insight.subtitle}</p>
                    </div>
                  </div>
                  <p className="insight-description premium-card-desc">{insight.description}</p>
                  <div className="insight-metrics premium-metrics">
                    {insight.metrics.map((metric, idx) => (
                      <div key={idx} className="metric-item premium-metric-item">
                        <div className="metric-value premium-metric-value">{metric.value}</div>
                        <div className="metric-details premium-metric-details">
                          <div className="metric-label premium-metric-label">{metric.label}</div>
                          <div className="metric-target premium-metric-target">{metric.target}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="insight-cta premium-cta">{insight.cta}</button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subscription Management Section - Apple-like UI */}
      <section className="subscription-management">
        <div className="container">
          <motion.div
            className="subscription-content"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="subscription-header">
              <h2 className="subscription-title gradient-text">Subscription Management</h2>
              <p className="subscription-subtitle">Premium tools to manage, grow, and engage your subscriber community</p>
            </div>
            <div className="subscription-grid">
              {subscriptionCards.map((card, idx) => (
                <motion.div
                  key={card.id}
                  className="subscription-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(102,126,234,0.18)" }}
                >
                  <div className="card-header">
                    <div className="card-icon">{card.icon}</div>
                    <div className="card-title">{card.title}</div>
                  </div>
                  <div className="card-text">{card.description}</div>
                  {/* Card-specific content */}
                  {card.chart && (
                    <div className="card-chart">
                      {/* Minimal chart placeholder */}
                      <svg width="100%" height="48" viewBox="0 0 180 48">
                        <polyline points="0,40 30,30 60,35 90,20 120,25 150,10 180,18" fill="none" stroke="#667eea" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 2px 8px #667eea88)" }} />
                        <polyline points="0,44 30,38 60,42 90,32 120,36 150,28 180,34" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 2" />
                      </svg>
                    </div>
                  )}
                  {card.stats && (
                    <div className="card-stats">
                      {card.stats.map((stat, i) => (
                        <div key={i} className="card-stat">
                          <span className="stat-value">{stat.value}</span>
                          <span className="stat-label">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {card.perks && (
                    <div className="card-perks">
                      {card.perks.map((perk, i) => (
                        <div key={i} className="perk-row">
                          <span className="perk-name">{perk.name}</span>
                          <label className="perk-toggle">
                            <input type="checkbox" checked={perk.enabled} readOnly />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      ))}
                      <button className="add-perk-btn">+ Add New Perk</button>
                    </div>
                  )}
                  {card.inbox !== undefined && (
                    <div className="card-engagement">
                      <div className="engagement-item">Q&A Inbox: <span>{card.inbox}</span></div>
                      <div className="engagement-item">Shout-outs: <span>{card.shoutouts}</span></div>
                      <div className="engagement-item">Live Sessions: <span>{card.liveSessions}</span></div>
                    </div>
                  )}
                  {card.earnings && (
                    <div className="card-revenue">
                      <div className="revenue-item">Earnings: <span>{card.earnings}</span></div>
                      <div className="revenue-item">Next Payout: <span>{card.payoutDate}</span></div>
                      <div className="revenue-item">Insights: <span>{card.insights}</span></div>
                    </div>
                  )}
                  {card.topSubscribers && (
                    <div className="card-community">
                      <div className="community-title">Top Subscribers</div>
                      <div className="community-list">
                        {card.topSubscribers.map((sub, i) => (
                          <span key={i} className="community-user">{sub}</span>
                        ))}
                      </div>
                      <div className="community-title">Leaderboard</div>
                      <div className="community-list">
                        {card.leaderboard.map((user, i) => (
                          <span key={i} className="community-user">{user.name} <span className="community-score">{user.score}</span></span>
                        ))}
                      </div>
                    </div>
                  )}
                  {card.tips && (
                    <div className="card-ai-tips">
                      {card.tips.map((tip, i) => (
                        <div key={i} className="ai-tip">{tip}</div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CreatorDirectory;
