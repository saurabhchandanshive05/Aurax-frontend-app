import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import styles from "../styles/DataDrivenGrowth.module.css";

const DataDrivenGrowth = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    document.title = "Data-Driven Growth | AURAX AI";

    // Ensure stable layout before showing content
    const handleLoad = () => {
      setTimeout(() => {
        setIsLoaded(true);
        // Ensure scroll position is at top
        window.scrollTo({ top: 0, behavior: "instant" });
      }, 100);
    };

    // Wait for DOM to be fully rendered
    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    const handleMouseMove = (e) => {
      if (window.innerWidth > 768) {
        // Only track mouse on desktop
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  const features = [
    {
      icon: "📊",
      title: "Real-Time Analytics",
      description:
        "Live performance tracking with AI-powered insights that adapt to market changes instantly.",
      color: "#667eea",
    },
    {
      icon: "🎯",
      title: "Smart Targeting",
      description:
        "Precision audience targeting using neural networks to identify high-conversion segments.",
      color: "#764ba2",
    },
    {
      icon: "🚀",
      title: "Growth Acceleration",
      description:
        "Automated optimization that scales successful campaigns while eliminating underperformers.",
      color: "#f093fb",
    },
    {
      icon: "🔮",
      title: "Predictive Modeling",
      description:
        "Future-ready strategies powered by machine learning algorithms and trend analysis.",
      color: "#4facfe",
    },
  ];

  const stats = [
    { value: "300%", label: "Average Growth Increase" },
    { value: "89%", label: "Cost Reduction" },
    { value: "24/7", label: "Real-Time Monitoring" },
    { value: "99.9%", label: "Accuracy Rate" },
  ];

  return (
    <div className={styles.pageContainer} ref={containerRef}>
      {/* Loading State */}
      {!isLoaded && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loader}>
            <div className={styles.loaderRing}></div>
            <span>Loading...</span>
          </div>
        </div>
      )}
      {/* Content with fade-in after load */}
      <div
        className={`${styles.content} ${
          isLoaded ? styles.loaded : styles.loading
        }`}
        style={{ opacity: isLoaded ? 1 : 0 }}
      >
        {/* Animated Background */}
        <div className={styles.backgroundEffects}>
          <motion.div
            className={styles.gradientOrb}
            style={{
              left: mousePosition.x - 200,
              top: mousePosition.y - 200,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className={styles.neuralGrid} />
        </div>

        {/* Hero Section */}
        <motion.section
          className={styles.hero}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ minHeight: "60vh" }}
        >
          <motion.div
            className={styles.heroIcon}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
          >
            🚀
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Data-Driven Growth
          </motion.h1>
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Growth strategies powered by neural analytics and AI intelligence
          </motion.p>

          {/* Stats Bar */}
          <motion.div
            className={styles.statsBar}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className={styles.statItem}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              >
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Features Grid */}
        <motion.section
          className={styles.featuresSection}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Intelligent Growth Features
          </motion.h2>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={styles.featureCard}
                style={{ "--accent-color": feature.color }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300 },
                }}
              >
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className={styles.cardGlow} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className={styles.ctaSection}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.ctaContent}>
            <h3>Ready to Accelerate Your Growth?</h3>
            <p>
              Transform your business with AI-powered data insights that deliver
              measurable results.
            </p>
            <div className={styles.ctaButtons}>
              <motion.button
                className={styles.primaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/contact")}
              >
                Get Started
              </motion.button>
              <motion.button
                className={styles.secondaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
              >
                ← Back Home
              </motion.button>
            </div>
          </div>
        </motion.section>
      </div>{" "}
      {/* Content wrapper closing div */}
    </div>
  );
};

export default DataDrivenGrowth;
