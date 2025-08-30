import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import HeroScene from "./HeroScene";
import styles from "./styles/Hero.module.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const Hero = () => {
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [aiMessage, setAiMessage] = useState("Initializing Neural Grid...");
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const ctaRef = useRef(null);
  const heroRef = useRef(null);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // AI Avatars data
  const aiAvatars = [
    { name: "NEURO", color: "#5b77ff" },
    { name: "SYNAPSE", color: "#ec4899" },
    { name: "QUANTUM", color: "#00d2ff" },
  ];

  useEffect(() => {
    // Set time of day
    const hour = new Date().getHours();
    setTimeOfDay(hour > 18 || hour < 6 ? "night" : "day");

    // AI greeting sequence
    const greetings = [
      "Initializing Neural Grid...",
      "Authenticating Creator Signature...",
      `Welcome back, ${localStorage.getItem("username") || "Creator"}.`,
    ];

    let step = 0;
    const timer = setInterval(() => {
      setAiMessage(greetings[step]);
      step = (step + 1) % greetings.length;
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  // Avatar rotation
  useEffect(() => {
    const rotate = setInterval(() => {
      setAvatarIndex((prev) => (prev + 1) % aiAvatars.length);
    }, 5000);
    return () => clearInterval(rotate);
  }, []);

  // Ripple effect for CTA - optimized with requestAnimationFrame
  const createRipple = useCallback((e) => {
    requestAnimationFrame(() => {
      const button = e.currentTarget;
      const circle = document.createElement("span");
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
      circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
      circle.classList.add(styles.ripple);

      const ripple = button.getElementsByClassName(styles.ripple)[0];
      if (ripple) ripple.remove();

      button.appendChild(circle);
    });
  }, []);

  // Modern stats for mobile
  const stats = [
    {
      id: 1,
      title: "Active Creators",
      value: "247",
      change: "+12.7%",
      icon: "👑",
      color: "#FF6B6B",
    },
    {
      id: 2,
      title: "Daily Reach",
      value: "4.2M",
      change: "+27.3%",
      icon: "📈",
      color: "#4ECDC4",
    },
    {
      id: 3,
      title: "AI Matches",
      value: "18",
      change: "+9.2%",
      icon: "🤖",
      color: "#45B7D1",
    },
  ];

  return (
    <section
      ref={heroRef}
      className={`${styles.hero} ${
        timeOfDay === "night" ? styles.nightMode : ""
      }`}
      aria-label="Modern Influencer Platform"
    >
      {/* Animated background */}
      <motion.div
        className={styles.backgroundOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Status indicator */}
      <motion.div
        className={styles.statusIndicator}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className={styles.statusDot} />
        <span>Platform Online</span>
      </motion.div>

      {/* AI Greeting - redesigned */}
      <motion.div
        className={styles.aiGreetingNew}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.aiIcon}>✨</div>
        <div className={styles.aiText}>
          <span className={styles.aiMessage}>{aiMessage}</span>
          <span
            className={styles.aiAvatar}
            style={{ color: aiAvatars[avatarIndex].color }}
          >
            {aiAvatars[avatarIndex].name}
          </span>
        </div>
      </motion.div>

      {/* Main content */}
      <motion.div
        className={styles.mainContent}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header section */}
        <div className={styles.headerSection}>
          <motion.div className={styles.badge} variants={itemVariants}>
            <span className={styles.badgeText}>🚀 Next-Gen Platform</span>
          </motion.div>

          <motion.h1 className={styles.modernHeadline} variants={itemVariants}>
            Create. Connect.
            <br />
            <span className={styles.gradientTextNew}>Influence</span>
          </motion.h1>

          <motion.p
            className={styles.modernSubheadline}
            variants={itemVariants}
          >
            Join the future of influencer marketing with AI-powered matching,
            real-time analytics, and seamless brand collaborations.
          </motion.p>

          {/* CTA buttons */}
          <motion.div className={styles.ctaGroup} variants={itemVariants}>
            <motion.button
              ref={ctaRef}
              className={styles.primaryCta}
              onClick={() => (window.location.href = "/explore")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Get Started</span>
              <svg
                className={styles.ctaArrow}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>

            <motion.button
              className={styles.secondaryCta}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Watch Demo
            </motion.button>
          </motion.div>
        </div>

        {/* Stats section - redesigned for mobile */}
        <motion.div
          className={styles.statsSection}
          variants={containerVariants}
        >
          <motion.h3 className={styles.statsTitle} variants={itemVariants}>
            Platform Insights
          </motion.h3>

          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.id}
                className={styles.statCard}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                custom={index}
              >
                <div className={styles.statCardInner}>
                  <div className={styles.statHeader}>
                    <span
                      className={styles.statIcon}
                      style={{
                        backgroundColor: `${stat.color}20`,
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </span>
                    <span
                      className={styles.statChange}
                      style={{ color: stat.color }}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.title}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          className={styles.featuresSection}
          variants={containerVariants}
        >
          <div className={styles.featuresList}>
            {[
              "AI-Powered Matching",
              "Real-time Analytics",
              "Secure Payments",
            ].map((feature, index) => (
              <motion.div
                key={feature}
                className={styles.featureItem}
                variants={itemVariants}
                custom={index}
              >
                <div className={styles.featureCheck}>✓</div>
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* 3D Scene for desktop */}
      {!isMobile && (
        <div className={styles.sceneContainer}>
          <HeroScene />
        </div>
      )}

      {/* Floating elements */}
      {!isMobile && (
        <div className={styles.floatingElements}>
          <motion.div
            className={styles.floatingElement}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className={styles.floatingElement2}
            animate={{
              y: [0, 15, 0],
              rotate: [0, -3, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>
      )}
    </section>
  );
};

export default Hero;
