import React, { useEffect, useState, useRef, useCallback, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { getApiEndpoint } from "../utils/getApiUrl";
import styles from "./styles/Hero.module.css";

// three.js scene is desktop-only: load it on demand so mobile never downloads it
const HeroScene = lazy(() => import("./HeroScene"));

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
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );
  const [live, setLive] = useState(null);
  const ctaRef = useRef(null);
  const heroRef = useRef(null);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Real platform numbers (read-only endpoint, no view tracking)
  useEffect(() => {
    let cancelled = false;
    fetch(getApiEndpoint("/api/public/campaigns/stats/overview"))
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled && json?.data) setLive(json.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Time of day only tints the background
  useEffect(() => {
    const hour = new Date().getHours();
    setTimeOfDay(hour > 18 || hour < 6 ? "night" : "day");
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

  // Only real numbers: shown when the API answers and there is something live
  const stats =
    live && live.totalLiveCampaigns > 0
      ? [
          { id: "live", title: "Live brand campaigns", value: live.totalLiveCampaigns },
          ...(live.handPickedCampaigns > 0
            ? [{ id: "picked", title: "Hand-picked by our team", value: live.handPickedCampaigns }]
            : []),
        ]
      : [];

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
            <span className={styles.badgeText}>Creator marketplace, made in India</span>
          </motion.div>

          <motion.h1 className={styles.modernHeadline} variants={itemVariants}>
            Brands and creators,
            <br />
            matched on real numbers.
          </motion.h1>

          <motion.p
            className={styles.modernSubheadline}
            variants={itemVariants}
          >
            Creators build a page, connect Instagram and apply to live brand
            campaigns. Brands post what they need and get a shortlist of
            reviewed creators.
          </motion.p>

          {/* CTA buttons */}
          <motion.div className={styles.ctaGroup} variants={itemVariants}>
            <motion.button
              ref={ctaRef}
              className={styles.primaryCta}
              onClick={() => (window.location.href = "/creator/signup")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Join as a creator</span>
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
              onClick={() => (window.location.href = "/creators")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Find creators
            </motion.button>
          </motion.div>
        </div>

        {/* Live numbers from the API (hidden when unavailable) */}
        {stats.length > 0 && (
          <motion.a
            href="/live/campaigns"
            className={styles.statsSection}
            variants={containerVariants}
            aria-label="Open the LIVE campaign board"
          >
            <div className={styles.statsGrid}>
              {stats.map((stat, index) => (
                <motion.div key={stat.id} className={styles.statCard} variants={itemVariants} custom={index}>
                  <div className={styles.statCardInner}>
                    <div className={styles.statValue}>{stat.value}</div>
                    <div className={styles.statLabel}>{stat.title}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.a>
        )}

        {/* Feature highlights */}
        <motion.div
          className={styles.featuresSection}
          variants={containerVariants}
        >
          <div className={styles.featuresList}>
            {[
              "Every creator reviewed",
              "Instagram-connected stats",
              "LIVE campaign board",
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
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
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
