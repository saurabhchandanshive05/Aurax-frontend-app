// src/pages/BrandPage.js
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./BrandPage.css";
import { fetchBrands } from "../utils/apiService";

const BrandPage = () => {
  const [activeTab, setActiveTab] = useState("solutions");
  const [expandedCase, setExpandedCase] = useState(null);
  const [formFocused, setFormFocused] = useState(false);
  const [email, setEmail] = useState("");
  const canvasRef = useRef(null);
  const floatingTags = [
    "ROI",
    "Reach",
    "AI Insights",
    "Targeting",
    "Engagement",
    "Conversion",
    "Analytics",
    "Performance",
  ];

  // Case studies data
  const caseStudies = [
    {
      id: 1,
      title: "Fashion Brand Campaign",
      results: "320% ROI in 3 months",
      metrics: [
        { label: "Reach", value: "2.8M", change: "+142%" },
        { label: "Engagement", value: "18.2%", change: "+95%" },
        { label: "Conversion", value: "9.7%", change: "+210%" },
      ],
      description:
        "AI-powered creator matching helped this fashion brand identify micro-influencers with highly engaged audiences, resulting in exceptional campaign performance.",
    },
    {
      id: 2,
      title: "Tech Product Launch",
      results: "5.2M impressions in 2 weeks",
      metrics: [
        { label: "CTR", value: "12.4%", change: "+180%" },
        { label: "Leads", value: "42K", change: "+230%" },
        { label: "Sales", value: "$1.2M", change: "+195%" },
      ],
      description:
        "Our AI platform identified creators with tech-savvy audiences and optimized content timing for maximum impact during a critical product launch.",
    },
    {
      id: 3,
      title: "Beauty Brand Awareness",
      results: "Brand recall increased by 78%",
      metrics: [
        { label: "Impressions", value: "8.4M", change: "+210%" },
        { label: "Sentiment", value: "94%", change: "+32%" },
        { label: "New Followers", value: "120K", change: "+185%" },
      ],
      description:
        "Using AI-driven sentiment analysis and audience profiling, we helped this beauty brand connect with the right creators to authentically represent their products.",
    },
  ];

  // Client logos for carousel (fallback values)
  const [clientLogos, setClientLogos] = useState([
    "BrandA",
    "BrandB",
    "BrandC",
    "BrandD",
    "BrandE",
    "BrandF",
    "BrandG",
    "BrandH",
  ]);

  // Load brands from API with graceful fallback
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const resp = await fetchBrands();
        if (
          !cancelled &&
          resp?.status === "success" &&
          Array.isArray(resp.data) &&
          resp.data.length > 0
        ) {
          const names = resp.data
            .map((b) => b.logoText || b.name)
            .filter(Boolean);
          if (names.length) setClientLogos(names);
        }
      } catch {}
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize bar chart animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const bars = [
      { height: 0.7, color: "#6a11cb", label: "Reach" },
      { height: 0.4, color: "#2575fc", label: "Engagement" },
      { height: 0.9, color: "#ff00cc", label: "Conversion" },
      { height: 0.6, color: "#00ffff", label: "ROI" },
      { height: 0.8, color: "#ff8a00", label: "Brand Lift" },
    ];

    const barWidth = canvas.width / (bars.length * 2);
    const maxBarHeight = canvas.height * 0.7;

    let animationFrame;
    let progress = 0;

    const animateBars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const y = canvas.height - (i * maxBarHeight) / 10;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw bars with glow effect
      bars.forEach((bar, i) => {
        const x = (i * 2 + 1) * barWidth;
        const currentHeight =
          Math.min(progress * bar.height, bar.height) * maxBarHeight;
        const y = canvas.height - currentHeight;

        // Draw glow
        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
        gradient.addColorStop(0, `${bar.color}80`);
        gradient.addColorStop(1, `${bar.color}00`);
        ctx.fillStyle = gradient;
        ctx.fillRect(x - barWidth * 0.6, y, barWidth * 1.2, currentHeight);

        // Draw bar
        ctx.fillStyle = bar.color;
        ctx.fillRect(x - barWidth / 2, y, barWidth, currentHeight);

        // Draw label
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(bar.label, x, canvas.height - 10);
      });

      progress = Math.min(progress + 0.02, 1);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateBars);
      }
    };

    animateBars();

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Toggle case study expansion
  const toggleCaseStudy = (id) => {
    setExpandedCase(expandedCase === id ? null : id);
  };

  // Handle form focus
  const handleFocus = () => {
    setFormFocused(true);
  };

  const handleBlur = () => {
    setFormFocused(false);
  };

  // Handle email input
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you! We'll contact you at ${email} to discuss your campaign.`);
    setEmail("");
  };

  return (
    <div className="brand-page">
      {/* Floating background elements */}
      <div className="floating-shapes">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-shape"
            initial={{
              y: Math.random() * 100,
              x: Math.random() * 100,
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.3 + 0.1,
            }}
            animate={{
              y: [null, Math.random() * 50 - 25],
              x: [null, Math.random() * 50 - 25],
              rotate: [0, Math.random() * 180 - 90],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-title"
          >
            AI-Powered Influencer Marketing Solutions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-subtitle"
          >
            Transform Your Brand with Data-Driven Creator Partnerships
          </motion.p>

          <div className="chart-container">
            <canvas ref={canvasRef} className="bar-chart" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero-cta"
          >
            <button className="cta-button">Launch Your Campaign</button>
          </motion.div>
        </div>
      </section>

      {/* Solutions Tabs */}
      <section className="solutions-section">
        <div className="tabs-container">
          <div className="tabs-header">
            <button
              className={`tab-button ${
                activeTab === "solutions" ? "active" : ""
              }`}
              onClick={() => setActiveTab("solutions")}
            >
              <i className="tab-icon">🚀</i> Brand Solutions
            </button>
            <button
              className={`tab-button ${
                activeTab === "platform" ? "active" : ""
              }`}
              onClick={() => setActiveTab("platform")}
            >
              <i className="tab-icon">👥</i> Creator Platform
            </button>
            <button
              className={`tab-button ${
                activeTab === "analytics" ? "active" : ""
              }`}
              onClick={() => setActiveTab("analytics")}
            >
              <i className="tab-icon">📊</i> Performance Analytics
            </button>
          </div>

          <div className="tabs-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="tab-panel"
              >
                {activeTab === "solutions" && (
                  <div className="solution-content">
                    <h3>AI-Driven Campaign Solutions</h3>
                    <p>
                      Our platform uses advanced AI to match your brand with the
                      perfect creators, predict campaign performance, and
                      optimize your strategy in real-time.
                    </p>
                    <ul>
                      <li>Automated creator discovery and vetting</li>
                      <li>Predictive performance modeling</li>
                      <li>Real-time campaign optimization</li>
                      <li>Competitor benchmarking</li>
                    </ul>
                  </div>
                )}

                {activeTab === "platform" && (
                  <div className="solution-content">
                    <h3>Creator Relationship Platform</h3>
                    <p>
                      Manage all creator relationships in one place with our
                      AI-powered platform that streamlines collaboration and
                      communication.
                    </p>
                    <ul>
                      <li>Centralized creator database</li>
                      <li>Automated outreach and follow-ups</li>
                      <li>Content approval workflows</li>
                      <li>Performance tracking per creator</li>
                    </ul>
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div className="solution-content">
                    <h3>Advanced Performance Analytics</h3>
                    <p>
                      Measure true campaign impact with our AI-powered analytics
                      that go beyond vanity metrics to show real business
                      results.
                    </p>
                    <ul>
                      <li>ROI tracking across platforms</li>
                      <li>Audience sentiment analysis</li>
                      <li>Competitive benchmarking</li>
                      <li>Customizable reporting dashboards</li>
                    </ul>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Floating Tag Cloud */}
      <div className="tag-cloud">
        {floatingTags.map((tag, i) => (
          <motion.span
            key={i}
            className="tag"
            initial={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
            }}
            animate={{
              x: [null, Math.random() * 30 - 15],
              y: [null, Math.random() * 30 - 15],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {tag}
          </motion.span>
        ))}
      </div>

      {/* Campaign Launch Process */}
      <section className="process-section">
        <h2 className="section-title">
          Launch AI-Optimized Campaigns in Minutes
        </h2>

        <div className="process-steps">
          {[
            {
              icon: "🎯",
              title: "Define Goals",
              desc: "Set campaign objectives and KPIs",
            },
            {
              icon: "🤖",
              title: "AI Matching",
              desc: "Find perfect creators using our algorithm",
            },
            {
              icon: "✉️",
              title: "Automated Outreach",
              desc: "Send personalized invitations",
            },
            {
              icon: "📈",
              title: "Track & Optimize",
              desc: "Monitor performance in real-time",
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              className="process-step"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Case Studies */}
      <section className="case-studies-section">
        <h2 className="section-title">Success Stories</h2>
        <p className="section-subtitle">AI-Optimized Campaign Results</p>

        <div className="case-studies-grid">
          {caseStudies.map((caseStudy) => (
            <div
              key={caseStudy.id}
              className={`case-study ${
                expandedCase === caseStudy.id ? "expanded" : ""
              }`}
              onClick={() => toggleCaseStudy(caseStudy.id)}
            >
              <div className="case-header">
                <h3>{caseStudy.title}</h3>
                <div className="case-result">{caseStudy.results}</div>
              </div>

              <div className="case-metrics">
                {caseStudy.metrics.map((metric, i) => (
                  <div key={i} className="metric">
                    <div className="metric-value">{metric.value}</div>
                    <div className="metric-label">{metric.label}</div>
                    <div className="metric-change">{metric.change}</div>
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {expandedCase === caseStudy.id && (
                  <motion.div
                    className="case-details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <p>{caseStudy.description}</p>
                    <button className="read-more">View Full Case Study</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Carousel */}
      <section className="brands-section">
        <h2 className="section-title">Trusted by Leading Brands</h2>

        <div className="brand-carousel">
          <div className="carousel-track">
            {[...clientLogos, ...clientLogos].map((brand, i) => (
              <motion.div
                key={i}
                className="brand-logo"
                animate={{
                  x: ["0%", "-100%"],
                }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {brand}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Tracking */}
      <section className="roi-section">
        <div className="roi-content">
          <div className="roi-text">
            <h2>Automated ROI Tracking</h2>
            <p>
              Our AI platform tracks true campaign ROI across all platforms,
              providing real-time insights into:
            </p>
            <ul>
              <li>Sales attribution</li>
              <li>Customer acquisition cost</li>
              <li>Lifetime value prediction</li>
              <li>Brand lift measurement</li>
            </ul>
          </div>

          <div className="roi-visual">
            <div className="roi-circle">
              <div className="roi-value">4.2x</div>
              <div className="roi-label">Average ROI</div>
            </div>
            <div className="roi-stats">
              <div className="stat">
                <div className="stat-value">+78%</div>
                <div className="stat-label">Conversion Rate</div>
              </div>
              <div className="stat">
                <div className="stat-value">-42%</div>
                <div className="stat-label">Cost Per Acquisition</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Influencer Marketing?</h2>
          <p>Get started with our AI-powered platform today</p>

          <form
            className={`cta-form ${formFocused ? "focused" : ""}`}
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Enter your business email"
                required
              />
              <button type="submit">Get Started</button>
            </div>
          </form>

          <div className="ai-note">
            <i className="ai-icon">🤖</i>
            Our AI will analyze your brand and recommend the perfect strategy
          </div>
        </div>
      </section>
    </div>
  );
};

export default BrandPage;
