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
      description: "Find perfect creators with precision algorithms.",
      benefits: ["95% accuracy", "Save time", "Audience fit"],
    },
    {
      icon: "📊",
      title: "Real-Time Analytics",
      description: "Track performance with live insights.",
      benefits: ["Live tracking", "ROI optimization", "Insights"],
    },
    {
      icon: "🚀",
      title: "Campaign Management",
      description: "Streamline workflows with smart automation.",
      benefits: ["Streamlined workflows", "Automation", "Multi-platform"],
    },
    {
      icon: "💎",
      title: "Premium Creators",
      description: "Access verified, high-performing talent.",
      benefits: ["Vetted network", "Quality assurance", "Brand safety"],
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
      price: "$299/month",
      description: "For small businesses",
      features: ["10 campaigns", "Basic analytics", "Email support"],
    },
    {
      name: "Professional",
      price: "$799/month",
      description: "For growing brands",
      features: [
        "Unlimited campaigns",
        "Advanced insights",
        "Priority support",
        "AI recommendations",
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
        "White-label options",
      ],
    },
  ];

  return (
    <div className="brands-page">
      <section className="hero-section">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
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
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Key Features</h2>
            <p>Advanced technology meets proven results</p>
          </motion.div>
          <div className="features-grid">
            {brandFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
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
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Success Stories</h2>
            <p>Real results from real brands</p>
          </motion.div>
          <div className="stories-grid">
            {successStories.map((story, index) => (
              <motion.div
                key={index}
                className="story-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
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
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Pricing</h2>
            <p>Choose the plan that fits your needs</p>
          </motion.div>
          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                className="pricing-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
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
