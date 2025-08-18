import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const AchievementSystem = ({ userId }) => {
  const { currentTheme } = useTheme();
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState({
    level: 15,
    experience: 1250,
    totalPoints: 8500,
    achievementsUnlocked: 23,
    rank: 4,
    streak: 7,
  });
  const [showUnlock, setShowUnlock] = useState(false);
  const [recentUnlock, setRecentUnlock] = useState(null);

  // Achievement definitions
  const achievementTypes = {
    engagement: {
      icon: "🔥",
      color: "#ff6b35",
      gradient: "linear-gradient(135deg, #ff6b35, #f7931e)",
    },
    followers: {
      icon: "👥",
      color: "#00d4ff",
      gradient: "linear-gradient(135deg, #00d4ff, #0099cc)",
    },
    content: {
      icon: "📸",
      color: "#ff0080",
      gradient: "linear-gradient(135deg, #ff0080, #cc0066)",
    },
    collaboration: {
      icon: "🤝",
      color: "#00ff88",
      gradient: "linear-gradient(135deg, #00ff88, #00cc6a)",
    },
    viral: {
      icon: "🚀",
      color: "#8a2be2",
      gradient: "linear-gradient(135deg, #8a2be2, #6a1b9a)",
    },
  };

  // Mock achievements data
  const mockAchievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first post",
      type: "content",
      points: 100,
      unlocked: true,
      unlockedAt: "2024-01-15",
      icon: "🎯",
      rarity: "common",
    },
    {
      id: 2,
      title: "Engagement Master",
      description: "Achieve 10% engagement rate",
      type: "engagement",
      points: 500,
      unlocked: true,
      unlockedAt: "2024-02-20",
      icon: "🔥",
      rarity: "rare",
    },
    {
      id: 3,
      title: "Follower Milestone",
      description: "Reach 1,000 followers",
      type: "followers",
      points: 1000,
      unlocked: true,
      unlockedAt: "2024-03-10",
      icon: "👥",
      rarity: "epic",
    },
    {
      id: 4,
      title: "Viral Sensation",
      description: "Get 100k+ views on a single post",
      type: "viral",
      points: 2000,
      unlocked: false,
      progress: 75,
      icon: "🚀",
      rarity: "legendary",
    },
    {
      id: 5,
      title: "Collaboration King",
      description: "Complete 10 brand collaborations",
      type: "collaboration",
      points: 1500,
      unlocked: false,
      progress: 6,
      icon: "🤝",
      rarity: "epic",
    },
    {
      id: 6,
      title: "Consistency Champion",
      description: "Post for 30 consecutive days",
      type: "content",
      points: 800,
      unlocked: false,
      progress: 25,
      icon: "📅",
      rarity: "rare",
    },
  ];

  // Mock leaderboard data
  const mockLeaderboard = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      level: 25,
      points: 12500,
      achievements: 35,
      rank: 1,
      badge: "👑",
    },
    {
      id: 2,
      name: "Mike Chen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      level: 22,
      points: 11800,
      achievements: 32,
      rank: 2,
      badge: "🥈",
    },
    {
      id: 3,
      name: "Emma Davis",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      level: 20,
      points: 11200,
      achievements: 30,
      rank: 3,
      badge: "🥉",
    },
    {
      id: 4,
      name: "Current User",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      level: 15,
      points: 8500,
      achievements: 23,
      rank: 4,
      badge: "⭐",
      isCurrentUser: true,
    },
  ];

  useEffect(() => {
    setAchievements(mockAchievements);
    setLeaderboard(mockLeaderboard);

    // Simulate achievement unlock
    const timer = setTimeout(() => {
      const newAchievement = mockAchievements.find((a) => !a.unlocked);
      if (newAchievement) {
        setRecentUnlock(newAchievement);
        setShowUnlock(true);
        setTimeout(() => setShowUnlock(false), 5000);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getRarityColor = (rarity) => {
    const colors = {
      common: "#6b7280",
      rare: "#3b82f6",
      epic: "#8b5cf6",
      legendary: "#f59e0b",
    };
    return colors[rarity] || colors.common;
  };

  const getRarityGlow = (rarity) => {
    const glows = {
      common: "0 0 10px rgba(107, 114, 128, 0.5)",
      rare: "0 0 15px rgba(59, 130, 246, 0.6)",
      epic: "0 0 20px rgba(139, 92, 246, 0.7)",
      legendary: "0 0 25px rgba(245, 158, 11, 0.8)",
    };
    return glows[rarity] || glows.common;
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
    <div className="space-y-6">
      {/* Achievement Unlock Notification */}
      <AnimatePresence>
        {showUnlock && recentUnlock && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-4 right-4 z-50 glass-card p-4 rounded-lg max-w-sm"
            style={{
              background: achievementTypes[recentUnlock.type]?.gradient,
              boxShadow: getRarityGlow(recentUnlock.rarity),
            }}
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{recentUnlock.icon}</div>
              <div>
                <h4 className="font-bold text-white">Achievement Unlocked!</h4>
                <p className="text-white/90 text-sm">{recentUnlock.title}</p>
                <p className="text-white/80 text-xs">
                  +{recentUnlock.points} points
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Stats Overview */}
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold gradient-text">Your Progress</h2>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>Rank #{userStats.rank}</span>
            <span>•</span>
            <span>Level {userStats.level}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {userStats.totalPoints}
            </div>
            <div className="text-sm text-white/60">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {userStats.achievementsUnlocked}
            </div>
            <div className="text-sm text-white/60">Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {userStats.streak}
            </div>
            <div className="text-sm text-white/60">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {userStats.experience}
            </div>
            <div className="text-sm text-white/60">Experience</div>
          </div>
        </div>

        {/* Experience Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Level {userStats.level}</span>
            <span>Level {userStats.level + 1}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full"
              style={{ background: currentTheme.colors.primary }}
              initial={{ width: 0 }}
              animate={{ width: `${(userStats.experience % 1000) / 10}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Achievements Grid */}
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              className={`relative p-4 rounded-lg transition-all duration-200 hover-lift ${
                achievement.unlocked ? "glass-card" : "bg-white/5"
              }`}
              style={{
                borderColor: achievement.unlocked
                  ? achievementTypes[achievement.type]?.color + "40"
                  : "transparent",
                boxShadow: achievement.unlocked
                  ? getRarityGlow(achievement.rarity)
                  : "none",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                    achievement.unlocked ? "" : "grayscale opacity-50"
                  }`}
                  style={{
                    background: achievement.unlocked
                      ? achievementTypes[achievement.type]?.gradient
                      : "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {achievement.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          getRarityColor(achievement.rarity) + "20",
                        color: getRarityColor(achievement.rarity),
                      }}
                    >
                      {achievement.rarity}
                    </span>
                  </div>

                  <p className="text-sm text-white/60 mb-2">
                    {achievement.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-400">
                      +{achievement.points} pts
                    </span>

                    {achievement.unlocked ? (
                      <span className="text-xs text-green-400">
                        ✓ Unlocked{" "}
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-white/20 rounded-full">
                          <div
                            className="h-1 rounded-full"
                            style={{
                              width: `${achievement.progress || 0}%`,
                              background:
                                achievementTypes[achievement.type]?.gradient,
                            }}
                          />
                        </div>
                        <span className="text-xs text-white/60">
                          {achievement.progress || 0}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Leaderboard</h3>
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <motion.div
              key={user.id}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${
                user.isCurrentUser
                  ? "glass-card ring-2 ring-current ring-opacity-50"
                  : "hover:bg-white/5"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{user.badge}</div>
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{user.name}</h4>
                  {user.isCurrentUser && (
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span>Level {user.level}</span>
                  <span>•</span>
                  <span>{user.achievements} achievements</span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-lg">
                  {user.points.toLocaleString()}
                </div>
                <div className="text-sm text-white/60">points</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AchievementSystem;

