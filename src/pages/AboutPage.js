// src/pages/AboutPage.js
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./AboutPage.css";

const AboutPage = () => {
  const [aiInsightVisible, setAiInsightVisible] = useState(false);
  const [insightIndex, setInsightIndex] = useState(0);
  const animationRef = useRef(null);

  const insights = [
    "AI matching boosts campaign ROI by 300% on average",
    "Our algorithm analyzes 200+ creator attributes",
    "Brands save 40+ hours per campaign with our platform",
    "Real-time performance prediction accuracy: 92%",
  ];

  // Set document title
  useEffect(() => {
    document.title = "About Couldbe - AI-Powered Influencer Marketing";
  }, []);

  // AI bot hover handler
  const handleBotHover = () => {
    setAiInsightVisible(true);
    setInsightIndex(Math.floor(Math.random() * insights.length));
  };

  // Typewriter effect for hero text
  const [heroText, setHeroText] = useState("");
  const fullText = "Empowering Connections with AI";

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setHeroText(fullText.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Animated AI process visualization
  useEffect(() => {
    const canvas = animationRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrame;
    let step = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw animated connections
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 3;
      ctx.beginPath();

      // Draw pulsing nodes
      const pulse = Math.sin(step * 0.05) * 0.5 + 0.5;
      const colors = [
        `rgba(106, 17, 203, ${0.7 + pulse * 0.3})`,
        `rgba(37, 117, 252, ${0.7 + pulse * 0.3})`,
        `rgba(255, 0, 204, ${0.7 + pulse * 0.3})`,
        `rgba(0, 255, 255, ${0.7 + pulse * 0.3})`,
      ];

      // Draw connecting lines
      ctx.beginPath();
      ctx.moveTo(50, 150);
      ctx.lineTo(150, 150);
      ctx.lineTo(250, 150);
      ctx.lineTo(350, 150);
      ctx.strokeStyle = `rgba(0, 195, 255, ${0.4 + pulse * 0.3})`;
      ctx.stroke();

      // Draw animated dots moving along the path
      const progress = (step % 200) / 200;
      const positions = [
        { x: 50 + progress * 100, y: 150 },
        { x: 150 + progress * 100, y: 150 },
        { x: 250 + progress * 100, y: 150 },
      ];

      // Draw moving nodes
      positions.forEach((pos, i) => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 10 + pulse * 5, 0, Math.PI * 2);
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw static nodes
      [50, 150, 250, 350].forEach((x, i) => {
        ctx.beginPath();
        ctx.arc(x, 150, 15, 0, Math.PI * 2);
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw labels
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(["Brands", "AI", "Creators", "Results"][i], x, 150);
      });

      step++;
      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="parallax-bg" />
        <div className="gradient-overlay" />

        <motion.div
          className="hero-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <h1 className="glowing-text">
            {heroText}
            <span className="cursor">|</span>
          </h1>
          <div className="neon-line" />
          <p className="subtitle fade-up">
            Where artificial intelligence meets authentic influence
          </p>
        </motion.div>
      </section>

      {/* AI Bot Insight */}
      <div className="ai-bot-container">
        <div
          className="ai-bot"
          onMouseEnter={handleBotHover}
          onMouseLeave={() => setAiInsightVisible(false)}
        >
          <div className="bot-icon">🤖</div>
        </div>

        <AnimatePresence>
          {aiInsightVisible && (
            <motion.div
              className="ai-insight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="insight-pointer" />
              <p>{insights[insightIndex]}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mission & Vision */}
      <section className="section mission-vision">
        <div className="neon-line separator" />

        <div className="content-grid">
          <div className="card fade-up">
            <h2>Our Mission</h2>
            <p>
              Democratize influencer marketing by making authentic creator
              partnerships accessible to brands of all sizes through AI-driven
              matchmaking.
            </p>
          </div>

          <div className="card fade-up">
            <h2>Our Vision</h2>
            <p>
              Create a world where 90% of brand-creator collaborations result in
              meaningful, authentic connections that drive real business value.
            </p>
          </div>
        </div>
      </section>

      {/* AI Journey Infographic */}
      <section className="section infographic-section">
        <h2 className="section-title">The AI-Powered Journey</h2>

        <div className="journey-container">
          {["Brands", "AI Matchmaking", "Creators", "Results"].map(
            (step, index) => (
              <motion.div
                key={index}
                className="journey-step"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="step-icon">{index + 1}</div>
                <h3>{step}</h3>
                <div className="connector-line" />
              </motion.div>
            )
          )}
        </div>

        <div className="animation-container">
          <canvas
            ref={animationRef}
            width="400"
            height="300"
            className="ai-process-canvas"
          />
        </div>
      </section>

      {/* Innovation Philosophy */}
      <section className="section philosophy">
        <div className="neon-line separator" />
        <h2 className="section-title">AI Innovation Philosophy</h2>

        <motion.div
          className="philosophy-content"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p>
            At Couldbe, we believe AI should amplify human creativity, not
            replace it. Our proprietary algorithms:
          </p>
          <ul>
            <li>Analyze creator content at semantic level</li>
            <li>Predict campaign performance with 90%+ accuracy</li>
            <li>Continuously learn from campaign outcomes</li>
            <li>Prioritize authentic audience connections</li>
            <li>Optimize for both brand and creator success</li>
          </ul>
        </motion.div>
      </section>

      {/* Timeline & Recognition */}
      <section className="section timeline-section">
        <h2 className="section-title">Our Journey</h2>

        <div className="timeline">
          {[
            { year: "2020", event: "Founded in Berlin with €2M seed funding" },
            { year: "2021", event: "Launched MVP with 500+ creators" },
            { year: "2022", event: "AI matching algorithm patent pending" },
            { year: "2023", event: "Featured in TechCrunch & AdWeek" },
            { year: "2024", event: "100K+ creators in our ecosystem" },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="timeline-item"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="timeline-year">{item.year}</div>
              <div className="timeline-content">{item.event}</div>
            </motion.div>
          ))}
        </div>

        <div className="badges-container fade-up">
          <div className="badge">TechCrunch</div>
          <div className="badge">AdWeek 100</div>
          <div className="badge">AI Innovator 2023</div>
          <div className="badge">Martech Breakthrough</div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
