// src/pages/CreatorDirectory.js
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import InteractiveCard from "../components/ui/InteractiveCard";
import SmartSearch from "../components/ui/SmartSearch";
import { HoverRevealCard } from "../components/ui/MicroInteractions";
import "react-tabs/style/react-tabs.css";
import { fetchCreators } from "../utils/apiService";
import "./CreatorDirectory.css";

const CreatorDirectory = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    handle: "",
    category: "",
  });
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [isAssistantVisible, setIsAssistantVisible] = useState(true);
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [stats, setStats] = useState({
    creators: 0,
    collaborations: 0,
    accuracy: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceCreators, setSourceCreators] = useState([]);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    category: "all",
    followers: "all",
    engagement: "all",
  });
  const globeRef = useRef(null);

  // Creator data (fallback for offline mode)
  const creators = [
    {
      id: 1,
      name: "Alex Johnson",
      tags: ["Fashion", "Lifestyle"],
      followers: "820K",
      engagement: "8.2%",
      campaigns: 58,
      featured: "Nike",
      avatar: "/avatar1.png",
      badge: "🔥 Top 1% Creator",
      category: "fashion",
    },
    {
      id: 2,
      name: "Taylor Smith",
      tags: ["Tech", "Gadgets"],
      followers: "1.2M",
      engagement: "7.5%",
      campaigns: 72,
      featured: "Apple",
      avatar: "/avatar2.png",
      badge: "🥇 Most Booked",
      category: "tech",
    },
    {
      id: 3,
      name: "Jordan Lee",
      tags: ["Fitness", "Wellness"],
      followers: "540K",
      engagement: "12.3%",
      campaigns: 41,
      featured: "Lululemon",
      avatar: "/avatar3.png",
      badge: "💎 AI-Recommended",
      category: "fitness",
    },
    {
      id: 4,
      name: "Morgan Reed",
      tags: ["Food", "Travel"],
      followers: "1.8M",
      engagement: "5.8%",
      campaigns: 93,
      featured: "Airbnb",
      avatar: "/avatar4.png",
      badge: "🔥 Top 1% Creator",
      category: "food",
    },
    {
      id: 5,
      name: "Casey Kim",
      tags: ["Beauty", "Makeup"],
      followers: "650K",
      engagement: "9.7%",
      campaigns: 37,
      featured: "Sephora",
      avatar: "/avatar5.png",
      badge: "💎 AI-Recommended",
      category: "beauty",
    },
    {
      id: 6,
      name: "Riley Chen",
      tags: ["Gaming", "Esports"],
      followers: "2.3M",
      engagement: "6.2%",
      campaigns: 68,
      featured: "Razer",
      avatar: "/avatar6.png",
      badge: "🥇 Most Booked",
      category: "gaming",
    },
    {
      id: 7,
      name: "Jamie Patel",
      tags: ["Travel", "Adventure"],
      followers: "910K",
      engagement: "10.1%",
      campaigns: 52,
      featured: "Patagonia",
      avatar: "/avatar7.png",
      badge: "💎 AI-Recommended",
      category: "travel",
    },
    {
      id: 8,
      name: "Skylar Wright",
      tags: ["Parenting", "Family"],
      followers: "420K",
      engagement: "15.4%",
      campaigns: 29,
      featured: "Fisher-Price",
      avatar: "/avatar8.png",
      badge: "🔥 Top 1% Creator",
      category: "lifestyle",
    },
  ];

  // Initialize data: try API first, fallback to static
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const resp = await fetchCreators();
        if (
          !cancelled &&
          resp?.status === "success" &&
          Array.isArray(resp.data)
        ) {
          const mapped = resp.data.map((c) => ({
            id: c._id || c.id,
            name: c.name,
            tags: c.tags || [],
            followersNum: typeof c.followers === "number" ? c.followers : 0,
            followers:
              typeof c.followers === "number"
                ? c.followers >= 1_000_000
                  ? `${(c.followers / 1_000_000).toFixed(1)}M`
                  : `${Math.round(c.followers / 1000)}K`
                : "0",
            engagement: c.engagement ? `${c.engagement}%` : "0%",
            engagementNum: typeof c.engagement === "number" ? c.engagement : 0,
            campaigns: c.campaigns || 0,
            featured: c.featuredBrand || "",
            avatar: c.avatar || "/avatar1.png",
            badge: c.badge || "",
            category: c.category || "",
          }));
          setSourceCreators(mapped);
          setFilteredCreators(mapped);
          return;
        }
      } catch {}
      if (!cancelled) {
        const mapped = creators.map((c) => ({
          ...c,
          followersNum:
            parseFloat(c.followers) *
            (String(c.followers).includes("M") ? 1_000_000 : 1_000),
          engagementNum: parseFloat(c.engagement),
        }));
        setSourceCreators(mapped);
        setFilteredCreators(mapped);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          setTimeout(() => {
            setStats({
              creators: 12000,
              collaborations: 4000000,
              accuracy: 98,
            });
          }, 500);
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  // Form handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // AI suggestion
  const generateSuggestion = () => {
    const categories = {
      fashion: "You'd be a perfect match for luxury fashion and beauty brands!",
      tech: "Tech companies would love your innovative content approach!",
      food: "Restaurant chains and food brands are looking for creators like you!",
      travel: "Adventure and travel brands would partner with you instantly!",
      fitness: "Health and wellness brands are searching for your energy!",
      gaming: "Gaming brands would benefit from your engaging content style!",
      beauty: "Cosmetic brands are seeking authentic voices like yours!",
      lifestyle: "Lifestyle brands would love your relatable content!",
    };

    const suggestion = formData.category
      ? categories[formData.category]
      : "Based on your profile, you'd match perfectly with lifestyle and tech brands!";

    setAiSuggestion(suggestion);
  };

  // Search and filter creators
  useEffect(() => {
    let results = sourceCreators;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (creator) =>
          creator.name.toLowerCase().includes(query) ||
          creator.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (activeFilters.category !== "all") {
      results = results.filter(
        (creator) => creator.category === activeFilters.category
      );
    }

    // Apply follower filter
    if (activeFilters.followers === "micro") {
      results = results.filter((creator) => creator.followersNum < 100000);
    } else if (activeFilters.followers === "mid") {
      results = results.filter(
        (creator) =>
          creator.followersNum >= 100000 && creator.followersNum < 1000000
      );
    } else if (activeFilters.followers === "macro") {
      results = results.filter((creator) => creator.followersNum >= 1000000);
    }

    // Apply engagement filter
    if (activeFilters.engagement === "high") {
      results = results.filter((creator) => creator.engagementNum > 8);
    } else if (activeFilters.engagement === "medium") {
      results = results.filter(
        (creator) => creator.engagementNum >= 4 && creator.engagementNum <= 8
      );
    } else if (activeFilters.engagement === "low") {
      results = results.filter((creator) => creator.engagementNum < 4);
    }

    setFilteredCreators(results);
  }, [searchQuery, activeFilters, sourceCreators]);

  // Update filter
  const handleFilterChange = (filterType, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Floating avatars data
  const floatingAvatars = Array(15)
    .fill()
    .map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 40 + Math.random() * 60,
      delay: Math.random() * 5,
    }));

  return (
    <div className="creator-directory">
      {/* AI Assistant */}
      {isAssistantVisible && (
        <motion.div
          className="ai-assistant"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring" }}
        >
          <div className="ai-bubble">
            <p>Looking for creators? I can help with recommendations!</p>
            <button onClick={() => setIsAssistantVisible(false)}>✕</button>
          </div>
          <div className="ai-avatar">🤖</div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="glowing-avatars">
          {floatingAvatars.map((avatar) => (
            <motion.div
              key={avatar.id}
              className="floating-avatar"
              style={{
                left: `${avatar.x}%`,
                top: `${avatar.y}%`,
                width: `${avatar.size}px`,
                height: `${avatar.size}px`,
              }}
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: avatar.delay,
              }}
            />
          ))}
        </div>

        <div className="hero-content">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Discover Amazing Creators
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            AI-Powered Search to Find Your Perfect Match
          </motion.p>

          <motion.div
            className="search-container"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <input
              type="text"
              placeholder="Search creators, niches, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="search-button">
              <i className="search-icon">🔍</i>
            </button>
          </motion.div>

          <motion.div
            className="ai-tag-cloud"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <span>Fashion</span>
            <span>Beauty</span>
            <span>Tech</span>
            <span>Travel</span>
            <span>Fitness</span>
            <span>Gaming</span>
            <span>Lifestyle</span>
            <span>Food</span>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={activeFilters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="fashion">Fashion</option>
              <option value="beauty">Beauty</option>
              <option value="tech">Tech</option>
              <option value="travel">Travel</option>
              <option value="fitness">Fitness</option>
              <option value="gaming">Gaming</option>
              <option value="food">Food</option>
              <option value="lifestyle">Lifestyle</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Followers:</label>
            <select
              value={activeFilters.followers}
              onChange={(e) => handleFilterChange("followers", e.target.value)}
            >
              <option value="all">All Sizes</option>
              <option value="micro">Micro (under 100K)</option>
              <option value="mid">Mid (100K-1M)</option>
              <option value="macro">Macro (1M+)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Engagement:</label>
            <select
              value={activeFilters.engagement}
              onChange={(e) => handleFilterChange("engagement", e.target.value)}
            >
              <option value="all">All Engagement</option>
              <option value="high">High (8%+)</option>
              <option value="medium">Medium (4-8%)</option>
              <option value="low">Low (under 4%)</option>
            </select>
          </div>

          <div className="ai-recommend">
            <button className="ai-button">
              <i>🤖</i> AI Recommendations
            </button>
          </div>
        </div>
      </section>

      {/* Creator Grid */}
      <section className="creator-grid-section">
        <div className="header">
          <h2>Featured Creators</h2>
          <div className="results-count">
            Showing {filteredCreators.length} of{" "}
            {sourceCreators.length || creators.length} creators
          </div>
        </div>

        <div className="creator-grid">
          {filteredCreators.map((creator) => (
            <motion.div
              key={creator.id}
              className="creator-card"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="card-header">
                <div className="avatar-glow">
                  <div className="avatar-placeholder"></div>
                </div>
                <div className="badge">{creator.badge}</div>
              </div>

              <div className="card-body">
                <h3>{creator.name}</h3>
                <div className="tags">
                  {creator.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="stats">
                  <div className="stat">
                    <span>👥 Followers</span>
                    <span className="value">{creator.followers}</span>
                  </div>
                  <div className="stat">
                    <span>💬 Engagement</span>
                    <span className="value">{creator.engagement}</span>
                  </div>
                  <div className="stat">
                    <span>📊 Campaigns</span>
                    <span className="value">{creator.campaigns}+</span>
                  </div>
                </div>
                <div className="featured">
                  Featured by: <strong>{creator.featured}</strong>
                </div>
              </div>

              <div className="card-footer">
                <button className="view-profile">View Profile</button>
                <button className="collab-button">Request Collab</button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCreators.length === 0 && (
          <div className="no-results">
            <div className="ai-icon">🤖</div>
            <h3>No creators match your filters</h3>
            <p>
              Try adjusting your search criteria or try our AI recommendations
            </p>
            <button className="ai-recommendation-button">
              Get AI Recommendations
            </button>
          </div>
        )}
      </section>

      {/* AI Matchmaker */}
      <section className="ai-matchmaker">
        <div className="matchmaker-container">
          <div className="content">
            <h2>AI-Powered Matchmaking</h2>
            <p>
              Our algorithm analyzes 200+ data points to find creators who
              perfectly align with your brand values and campaign goals.
            </p>
            <ul>
              <li>Audience demographic matching</li>
              <li>Content style compatibility</li>
              <li>Brand safety analysis</li>
              <li>Performance prediction</li>
            </ul>
            <button className="cta-button">Try Matchmaker</button>
          </div>
          <div className="visualization">
            <div className="ai-visual">
              <div className="node brand-node">Your Brand</div>
              <div className="connection"></div>
              <div className="node ai-node">AI Analysis</div>
              <div className="connection"></div>
              <div className="node creator-node">Perfect Creator</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" ref={statsRef}>
        <div className="stats-container">
          <div className="stat">
            <h3>Creators</h3>
            <motion.div
              className="stat-value"
              animate={{
                scale: statsVisible ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.5 }}
            >
              {stats.creators.toLocaleString()}+
            </motion.div>
          </div>

          <div className="stat">
            <h3>Collaborations</h3>
            <motion.div
              className="stat-value"
              animate={{
                scale: statsVisible ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {stats.collaborations.toLocaleString()}+
            </motion.div>
          </div>

          <div className="stat">
            <h3>Match Accuracy</h3>
            <motion.div
              className="stat-value"
              animate={{
                scale: statsVisible ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {stats.accuracy}%
            </motion.div>
          </div>
        </div>
      </section>

      {/* Join as Creator */}
      <section className="join-section">
        <div className="join-container">
          <div className="content">
            <h2>Are You a Creator?</h2>
            <p>
              Join our platform to connect with top brands and grow your career
            </p>

            <div className="benefits">
              <div className="benefit">
                <div className="icon">💰</div>
                <p>Get paid fairly for your work</p>
              </div>
              <div className="benefit">
                <div className="icon">📈</div>
                <p>Access performance analytics</p>
              </div>
              <div className="benefit">
                <div className="icon">🤝</div>
                <p>Connect with premium brands</p>
              </div>
            </div>

            <button className="join-button">Join as Creator</button>
          </div>

          <div className="form">
            <h3>Get Started</h3>
            <form>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Social Media Handle"
                  className="form-input"
                />
              </div>
              <button type="submit" className="submit-button">
                Apply Now
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreatorDirectory;
