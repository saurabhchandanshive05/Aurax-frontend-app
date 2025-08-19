import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./BrandPage.css";

const BrandsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    document.title = "For Brands - AURAX | AI-Powered Influencer Marketing";
  }, []);

  const brandFeatures = [
    {
      icon: "🎯",
      title: "AI-Powered Creator Matching",
      description: "Find the perfect creators for your brand using our advanced AI algorithms that analyze engagement, audience demographics, and brand alignment.",
      benefits: ["95% better match accuracy", "Save 40+ hours per campaign", "Guaranteed audience fit"]
    },
    {
      icon: "📊",
      title: "Real-Time Campaign Analytics",
      description: "Track your campaign performance with comprehensive analytics and insights that update in real-time.",
      benefits: ["Live performance tracking", "ROI optimization", "Detailed audience insights"]
    },
    {
      icon: "🚀",
      title: "Campaign Management Suite",
      description: "Manage all your influencer campaigns from one powerful dashboard with automated workflows.",
      benefits: ["Streamlined workflows", "Automated approvals", "Multi-platform management"]
    },
    {
      icon: "💡",
      title: "Content Strategy Insights",
      description: "Get AI-driven content recommendations and strategy insights to maximize your campaign impact.",
      benefits: ["Content optimization", "Trend predictions", "Performance forecasting"]
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Perfect for small businesses and startups",
      features: [
        "Up to 5 campaigns per month",
        "Basic analytics dashboard",
        "Email support",
        "Creator discovery tools"
      ],
      highlighted: false
    },
    {
      name: "Professional",
      price: "$299",
      period: "/month",
      description: "Ideal for growing brands and agencies",
      features: [
        "Unlimited campaigns",
        "Advanced analytics & insights",
        "Priority support",
        "AI-powered recommendations",
        "Custom reporting",
        "Team collaboration tools"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large brands with complex needs",
      features: [
        "Everything in Professional",
        "Dedicated account manager",
        "Custom integrations",
        "White-label options",
        "Advanced API access",
        "Custom analytics"
      ],
      highlighted: false
    }
  ];

  const successStories = [
    {
      brand: "TechStart Inc.",
      campaign: "Product Launch Campaign",
      results: "300% increase in brand awareness",
      metric: "2.5M+ impressions",
      image: "/images/brands/techstart.png"
    },
    {
      brand: "Fashion Forward",
      campaign: "Summer Collection 2024",
      results: "180% boost in sales",
      metric: "15K+ conversions",
      image: "/images/brands/fashion.png"
    },
    {
      brand: "HealthTech Pro",
      campaign: "Health Awareness Drive",
      results: "250% engagement increase",
      metric: "500K+ interactions",
      image: "/images/brands/healthtech.png"
    }
  ];

  return (
    <div className="brands-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-text"
          >
            <h1 className="hero-title">
              Supercharge Your Brand with 
              <span className="gradient-text"> AI-Powered</span> 
              <br />Influencer Marketing
            </h1>
            <p className="hero-subtitle">
              Connect with the right creators, launch impactful campaigns, and drive measurable results 
              with AURAX's intelligent influencer marketing platform.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Verified Creators</span>
              </div>
              <div className="stat">
                <span className="stat-number">95%</span>
                <span className="stat-label">Match Accuracy</span>
              </div>
              <div className="stat">
                <span className="stat-number">300%</span>
                <span className="stat-label">Avg. ROI Increase</span>
              </div>
            </div>
            <div className="hero-actions">
              <Link to="/brand/login" className="cta-button primary">
                Start Free Trial
              </Link>
              <Link to="/contact" className="cta-button secondary">
                Schedule Demo
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-visual"
          >
            <div className="dashboard-preview">
              <div className="dashboard-header">
                <div className="dashboard-tabs">
                  <span className="tab active">Campaigns</span>
                  <span className="tab">Analytics</span>
                  <span className="tab">Creators</span>
                </div>
              </div>
              <div className="dashboard-content">
                <div className="metric-card">
                  <span className="metric-label">Campaign Performance</span>
                  <span className="metric-value">+285%</span>
                </div>
                <div className="chart-placeholder">
                  <div className="chart-bars">
                    <div className="bar" style={{height: '60%'}}></div>
                    <div className="bar" style={{height: '80%'}}></div>
                    <div className="bar" style={{height: '95%'}}></div>
                    <div className="bar" style={{height: '75%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2>Everything You Need to Succeed</h2>
            <p>Powerful tools and insights to maximize your influencer marketing ROI</p>
          </motion.div>

          <div className="features-grid">
            {brandFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="feature-card"
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <ul className="benefits-list">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx}>✓ {benefit}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="success-stories">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2>Success Stories</h2>
            <p>See how brands are achieving exceptional results with AURAX</p>
          </motion.div>

          <div className="stories-grid">
            {successStories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="story-card"
              >
                <div className="story-header">
                  <h3>{story.brand}</h3>
                  <span className="campaign-type">{story.campaign}</span>
                </div>
                <div className="story-results">
                  <div className="result-metric">
                    <span className="metric">{story.metric}</span>
                    <span className="result">{story.results}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2>Choose Your Plan</h2>
            <p>Flexible pricing options to fit your brand's needs</p>
          </motion.div>

          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}
              >
                {plan.highlighted && <div className="popular-badge">Most Popular</div>}
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="price">
                    <span className="amount">{plan.price}</span>
                    <span className="period">{plan.period}</span>
                  </div>
                  <p className="plan-description">{plan.description}</p>
                </div>
                <ul className="features-list">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>✓ {feature}</li>
                  ))}
                </ul>
                <Link 
                  to="/brand/login" 
                  className={`plan-button ${plan.highlighted ? 'primary' : 'secondary'}`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="cta-content"
          >
            <h2>Ready to Transform Your Influencer Marketing?</h2>
            <p>Join thousands of brands already using AURAX to create impactful campaigns</p>
            <div className="cta-actions">
              <Link to="/brand/login" className="cta-button primary large">
                Start Your Free Trial
              </Link>
              <Link to="/contact" className="cta-button secondary large">
                Talk to Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BrandsPage;
