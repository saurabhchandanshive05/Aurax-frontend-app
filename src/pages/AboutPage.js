import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./AboutPage.css";

const AboutPage = () => {
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll("[id]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const stats = [
    { number: "300%", label: "Average ROI Increase" },
    { number: "50K+", label: "Successful Campaigns" },
    { number: "200+", label: "Data Points Analyzed" },
    { number: "92%", label: "Prediction Accuracy" },
  ];

  const values = [
    {
      icon: "🎯",
      title: "Innovation First",
      description:
        "We pioneer AI solutions that transform how brands connect with creators.",
    },
    {
      icon: "🤝",
      title: "Transparency",
      description:
        "Clear metrics, honest reporting, and authentic partnerships drive everything we do.",
    },
    {
      icon: "🚀",
      title: "Results Driven",
      description:
        "We measure success by the real impact we create for brands and creators.",
    },
    {
      icon: "🌍",
      title: "Global Vision",
      description:
        "Building bridges between brands and creators across cultures and continents.",
    },
  ];



  return (
    <div className="about-page">
      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-background">
          <div className="gradient-overlay"></div>
          <div className="animated-particles"></div>
        </div>

        <div className="container">
          <motion.div
            className="hero-content"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <motion.h1 className="hero-title" variants={fadeInUp}>
              Revolutionizing Influencer Marketing
              <span className="gradient-text"> with AI</span>
            </motion.h1>

            <motion.p className="hero-subtitle" variants={fadeInUp}>
              At AURAX, we're not just another platform. We're your AI co-pilot,
              transforming how brands discover, connect, and collaborate with
              creators through intelligent technology and transparent analytics.
            </motion.p>

            <motion.div className="hero-cta" variants={fadeInUp}>
              <button className="cta-primary">
                <span>Start Your Journey</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M4.167 10h11.666M10 4.167L15.833 10 10 15.833"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button className="cta-secondary">Watch Demo</button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="stats-section">
        <div className="container">
          <motion.div
            className="stats-grid"
            initial="hidden"
            animate={isVisible.stats ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {stats.map((stat, index) => (
              <motion.div key={index} className="stat-item" variants={fadeInUp}>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="story" className="story-section">
        <div className="container">
          <div className="section-grid">
            <motion.div
              className="story-content"
              initial="hidden"
              animate={isVisible.story ? "visible" : "hidden"}
              variants={fadeInUp}
            >
              <h2 className="section-title">Our Story</h2>
              <p className="story-text">
                Founded in 2023 by AI researchers and marketing veterans, AURAX
                emerged from a simple observation: influencer marketing was
                broken. Brands struggled with creator discovery, campaign
                performance was unpredictable, and meaningful metrics were
                buried under vanity numbers.
              </p>
              <p className="story-text">
                We envisioned a world where AI could bridge this gap – where
                data-driven insights meet human creativity, where every campaign
                is optimized in real-time, and where both brands and creators
                thrive through authentic partnerships.
              </p>
              <p className="story-text">
                Today, AURAX powers thousands of successful campaigns globally,
                helping brands achieve 3x better ROI while empowering creators
                to build sustainable businesses.
              </p>
            </motion.div>

            <motion.div
              className="story-visual"
              initial="hidden"
              animate={isVisible.story ? "visible" : "hidden"}
              variants={fadeInUp}
            >
              <div className="visual-card">
                <div className="card-icon">🚀</div>
                <h3>The Future is Now</h3>
                <p>
                  AI-powered influencer marketing that delivers real results
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="values" className="values-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            animate={isVisible.values ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <h2 className="section-title">Our Values</h2>
            <p className="section-subtitle">
              The principles that guide everything we do
            </p>
          </motion.div>

          <motion.div
            className="values-grid"
            initial="hidden"
            animate={isVisible.values ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="value-card"
                variants={fadeInUp}
              >
                <div className="value-icon">{value.icon}</div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="mission" className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <motion.div
              className="mission-card"
              initial="hidden"
              animate={isVisible.mission ? "visible" : "hidden"}
              variants={fadeInUp}
            >
              <div className="card-header">
                <div className="card-icon">🎯</div>
                <h3>Our Mission</h3>
              </div>
              <p>
                To democratize influencer marketing through AI, making it
                accessible, transparent, and profitable for brands and creators
                of all sizes.
              </p>
            </motion.div>

            <motion.div
              className="vision-card"
              initial="hidden"
              animate={isVisible.mission ? "visible" : "hidden"}
              variants={fadeInUp}
            >
              <div className="card-header">
                <div className="card-icon">🌟</div>
                <h3>Our Vision</h3>
              </div>
              <p>
                A world where every brand finds their perfect creator match,
                where authentic storytelling drives measurable results, and
                where AI enhances human creativity rather than replacing it.
              </p>
            </motion.div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section id="cta" className="final-cta-section">
        <div className="container">
          <motion.div
            className="cta-content"
            initial="hidden"
            animate={isVisible.cta ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <h2 className="cta-title">
              Ready to Transform Your Influencer Marketing?
            </h2>
            <p className="cta-subtitle">
              Join thousands of brands already using AI to drive better results
            </p>
            <div className="cta-buttons">
              <button className="cta-primary">
                <span>Get Started Free</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M4.167 10h11.666M10 4.167L15.833 10 10 15.833"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button className="cta-secondary">Schedule Demo</button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
