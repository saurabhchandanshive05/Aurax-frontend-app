import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./BrandPage.css";

const BrandsPage = () => {
  useEffect(() => {
    document.title = "For Brands - AURAX";
  }, []);

  const brandFeatures = [
    {
      icon: "🎯",
      title: "AI-Powered Creator Matching",
      description: "Find perfect creators with AI-driven analysis.",
      benefits: ["95% accuracy", "Save time", "Audience fit"],
    },
    {
      icon: "📊",
      title: "Real-Time Analytics",
      description: "Track performance live.",
      benefits: ["Live tracking", "ROI optimization", "Insights"],
    },
    {
      icon: "🚀",
      title: "Campaign Management",
      description: "Manage campaigns efficiently.",
      benefits: ["Streamlined workflows", "Automation", "Multi-platform"],
    },
    {
      icon: "💡",
      title: "Content Insights",
      description: "Get AI recommendations for content.",
      benefits: ["Optimization", "Trends", "Forecasting"],
    },
  ];

  const successStories = [
    {
      brand: "TechStart Inc.",
      results: "300% awareness increase",
      metric: "2.5M+ impressions",
    },
    {
      brand: "Fashion Forward",
      results: "180% sales boost",
      metric: "15K+ conversions",
    },
    {
      brand: "HealthTech Pro",
      results: "250% engagement growth",
      metric: "500K+ interactions",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$99/month",
      description: "For small businesses",
      features: ["5 campaigns", "Basic analytics", "Email support"],
    },
    {
      name: "Professional",
      price: "$299/month",
      description: "For growing brands",
      features: [
        "Unlimited campaigns",
        "Advanced insights",
        "Priority support",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large brands",
      features: [
        "All Professional features",
        "Dedicated manager",
        "Custom integrations",
      ],
    },
  ];

  return (
    <div className="brands-page">
      <section className="hero-section">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="hero-text"
          >
            <h1>Empower Your Brand with AI</h1>
            <p>Connect, collaborate, and achieve results.</p>
            <div className="hero-actions">
              <Link to="/brand/login" className="cta-button primary">
                Get Started
              </Link>
              <Link to="/contact" className="cta-button secondary">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2>Key Features</h2>
          <div className="features-grid">
            {brandFeatures.map((feature, index) => (
              <motion.div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <ul>
                  {feature.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="success-stories">
        <div className="container">
          <h2>Success Stories</h2>
          <div className="stories-grid">
            {successStories.map((story, index) => (
              <motion.div key={index} className="story-card">
                <h3>{story.brand}</h3>
                <p>
                  {story.results} ({story.metric})
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-section">
        <div className="container">
          <h2>Pricing</h2>
          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <motion.div key={index} className="pricing-card">
                <h3>{plan.name}</h3>
                <p className="price">{plan.price}</p>
                <p>{plan.description}</p>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Link to="/brand/login" className="plan-button">
                  Select
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BrandsPage;
