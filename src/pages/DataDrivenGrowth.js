import React, { useEffect, useRef, useState } from "react";
import Icon from "../components/ui/Icon";
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
      icon: "chart",
      title: "Verified numbers",
      description:
        "Follower counts come from a creator's connected Instagram account where available; self-reported numbers are labelled as such.",
      color: "#667eea",
    },
    {
      icon: "target",
      title: "Reviewed creators",
      description:
        "Every creator is checked by the AURAX team before brands see them, so the list is real and active.",
      color: "#764ba2",
    },
    {
      icon: "trend",
      title: "Live demand",
      description:
        "The LIVE board shows what brands are asking for right now, by category and platform.",
      color: "#f093fb",
    },
    {
      icon: "sparkle",
      title: "A team behind it",
      description:
        "The AURAX team matches your brief to creators and follows up, instead of leaving you with a list.",
      color: "#4facfe",
    },
  ];

  // (A stats bar with invented figures such as "300% average growth" was removed)

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
            <Icon name="trend" size={44} />
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
            Decisions based on real numbers: verified follower counts and live campaign data, not estimates.
          </motion.p>

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
            What the numbers are based on
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
                <div className={styles.featureIcon}><Icon name={feature.icon} size={28} /></div>
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
            <h3>Talk to the AURAX team</h3>
            <p>
              Tell us what you need and the AURAX team will shortlist reviewed creators for it.
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
