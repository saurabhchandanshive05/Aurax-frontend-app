import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const AIContentRecommender = ({ creatorData, onRecommendationSelect }) => {
  const { currentTheme } = useTheme();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("timing");
  const [aiInsights, setAiInsights] = useState(null);

  // Mock AI recommendations - replace with actual API calls
  const generateRecommendations = async () => {
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockRecommendations = {
      timing: [
        {
          id: 1,
          type: "optimal_time",
          title: "Best Posting Time",
          description: "Your audience is most active at 7:00 PM EST",
          confidence: 94,
          icon: "⏰",
          color: "#00d4ff",
          details: {
            time: "7:00 PM EST",
            engagement_rate: "+23%",
            reach_potential: "High",
            day_of_week: "Wednesday",
          },
        },
        {
          id: 2,
          type: "frequency",
          title: "Posting Frequency",
          description: "Increase posts to 3x per week for maximum engagement",
          confidence: 87,
          icon: "📈",
          color: "#00ff88",
          details: {
            current_frequency: "2x/week",
            recommended_frequency: "3x/week",
            expected_growth: "+15% followers",
            best_days: ["Monday", "Wednesday", "Friday"],
          },
        },
      ],
      content: [
        {
          id: 3,
          type: "content_type",
          title: "Video Content",
          description: "Your audience engages 3x more with video content",
          confidence: 91,
          icon: "🎥",
          color: "#ff0080",
          details: {
            engagement_multiplier: "3x",
            recommended_duration: "30-60 seconds",
            best_formats: ["Reels", "TikTok", "YouTube Shorts"],
            trending_topics: ["Behind the scenes", "Tutorials", "Day in life"],
          },
        },
        {
          id: 4,
          type: "hashtag_strategy",
          title: "Hashtag Optimization",
          description: "Use 15-20 hashtags with mix of popular and niche",
          confidence: 89,
          icon: "#️⃣",
          color: "#8a2be2",
          details: {
            recommended_count: "15-20",
            popular_hashtags: ["#fashion", "#lifestyle", "#trending"],
            niche_hashtags: ["#sustainablefashion", "#minimaliststyle"],
            avoid_hashtags: ["#followme", "#like4like"],
          },
        },
      ],
      audience: [
        {
          id: 5,
          type: "audience_insights",
          title: "Audience Demographics",
          description: "Your core audience is 18-24 year old females",
          confidence: 96,
          icon: "👥",
          color: "#ff6b35",
          details: {
            primary_age: "18-24",
            primary_gender: "Female (78%)",
            top_locations: ["California", "New York", "Texas"],
            interests: ["Fashion", "Beauty", "Travel", "Fitness"],
          },
        },
      ],
    };

    setRecommendations(mockRecommendations);
    setIsLoading(false);
  };

  useEffect(() => {
    generateRecommendations();
  }, []);

  const categories = [
    { id: "timing", label: "Timing", icon: "⏰" },
    { id: "content", label: "Content", icon: "🎨" },
    { id: "audience", label: "Audience", icon: "👥" },
  ];

  const handleRecommendationClick = (recommendation) => {
    onRecommendationSelect?.(recommendation);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold gradient-text mb-2">
            AI Content Recommendations
          </h3>
          <p className="text-white/60">
            Personalized insights to boost your engagement
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          AI Active
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              selectedCategory === category.id
                ? "glass-card ring-2 ring-current ring-opacity-50"
                : "hover:bg-white/5"
            }`}
            onClick={() => setSelectedCategory(category.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{category.icon}</span>
            <span className="font-medium">{category.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-white/20 border-t-current rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium">AI Analyzing...</span>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <AnimatePresence mode="wait">
        {!isLoading && recommendations[selectedCategory] && (
          <motion.div
            key={selectedCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {recommendations[selectedCategory].map((recommendation) => (
              <motion.div
                key={recommendation.id}
                variants={itemVariants}
                className="glass-card p-4 rounded-lg cursor-pointer hover-lift"
                onClick={() => handleRecommendationClick(recommendation)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${recommendation.color}20` }}
                  >
                    {recommendation.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{recommendation.title}</h4>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-white/60">Confidence:</span>
                        <span
                          className="font-medium"
                          style={{ color: recommendation.color }}
                        >
                          {recommendation.confidence}%
                        </span>
                      </div>
                    </div>

                    <p className="text-white/80 mb-3">
                      {recommendation.description}
                    </p>

                    {/* Detailed Insights */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {Object.entries(recommendation.details).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-white/60 capitalize">
                              {key.replace(/_/g, " ")}:
                            </span>
                            <span className="font-medium">{value}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insights Summary */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.colors.primary}20, ${currentTheme.colors.secondary}20)`,
            border: `1px solid ${currentTheme.colors.primary}40`,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🤖</span>
            <h4 className="font-semibold">AI Insights Summary</h4>
          </div>
          <p className="text-white/80 text-sm">
            Based on your recent performance, we recommend focusing on video
            content posted during peak engagement hours (7:00 PM EST) with
            optimized hashtag strategies for maximum reach and engagement.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default AIContentRecommender;

