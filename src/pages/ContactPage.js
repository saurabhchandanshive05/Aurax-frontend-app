import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./Contact.css";
import { apiClient } from "../utils/apiClient";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [selectedCTA, setSelectedCTA] = useState("Let's Build Together 🤝");
  const formRef = useRef(null);

  const ctaOptions = [
    "Ignite a Campaign 🔥",
    "Let's Build Together 🤝",
    "Start Your Journey 🌌",
  ];

  const socialLinks = [
    {
      platform: "Instagram",
      handle: "@aurax.official",
      icon: "📸",
      url: "https://instagram.com/aurax.official",
    },
    {
      platform: "LinkedIn",
      handle: "/company/aurax",
      icon: "💼",
      url: "https://linkedin.com/company/aurax",
    },
    {
      platform: "WhatsApp",
      handle: "+91 98765 43210",
      icon: "💬",
      url: "https://wa.me/919923717368",
    },
    {
      platform: "Twitter",
      handle: "@aurax_official",
      icon: "🐦",
      url: "https://twitter.com/aurax_official",
    },
  ];

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show copy feedback
      const copyBtn = document.querySelector(".copy-icon");
      if (copyBtn) {
        copyBtn.textContent = "✅";
        setTimeout(() => {
          copyBtn.textContent = "📋";
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const payload = {
        ...formData,
        selectedCTA,
        timestamp: new Date().toISOString(),
        source: "contact_form",
      };

      const response = await apiClient.post("/contact", payload);

      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });

      // Trigger success animation
      if (formRef.current) {
        formRef.current.classList.add("success-pulse");
        setTimeout(() => {
          formRef.current?.classList.remove("success-pulse");
        }, 1000);
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="aurax-contact-page">
      {/* Cosmic Background */}
      <div className="cosmic-background">
        <div className="aurax-particles"></div>
        <div className="aurax-stars"></div>
        <div className="aurax-gradient-overlay"></div>
      </div>

      {/* Hero Section */}
      <section className="aurax-hero-section">
        <div className="hero-content">
          <motion.div
            className="aurax-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span>🌌</span>
            <span>Connect with AURAX</span>
          </motion.div>

          <motion.h1
            className="aurax-hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Step Into the Aura — Let's Connect
            <span className="hero-sparkle">✨</span>
          </motion.h1>

          <motion.p
            className="aurax-hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Whether you're a visionary brand or a bold creator, AURAX is where
            influence meets innovation. Let's shape stories, spark connections,
            and achieve impact together.
          </motion.p>

          {/* Email Section */}
          <motion.div
            className="aurax-email-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="email-container">
              <span className="email-label">Reach us at:</span>
              <div
                className="email-display"
                onClick={() => copyToClipboard("connect@aurax.io")}
              >
                <span className="email-text">hello@auraxai.in</span>
                <span className="copy-icon" title="Copy to clipboard">
                  📋
                </span>
              </div>
            </div>
          </motion.div>

          {/* Brand Creator Connection Visual */}
          <motion.div
            className="aurax-connection-visual"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="brand-side">
              <span className="connection-label">Brands</span>
              <div className="connection-icon">🤝</div>
            </div>
            <div className="connection-line">
              <div className="energy-pulse"></div>
            </div>
            <div className="creator-side">
              <div className="connection-icon">👑</div>
              <span className="connection-label">Creators</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="aurax-form-section">
        <div className="form-container">
          <motion.div
            className="aurax-contact-card"
            ref={formRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="card-header">
              <div className="aura-icon">🌌</div>
              <h2>Send Your Message to the Aura</h2>
            </div>

            <form onSubmit={handleSubmit} className="aurax-form">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="aurax-input"
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="aurax-input"
                  required
                />
              </div>

              <div className="form-group">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  className="aurax-textarea"
                  rows="4"
                  required
                ></textarea>
              </div>

              {/* CTA Selection */}
              <div className="cta-selection">
                <label className="cta-label">What brings you here?</label>
                <div className="cta-options">
                  {ctaOptions.map((option) => (
                    <motion.button
                      key={option}
                      type="button"
                      className={`cta-option ${
                        selectedCTA === option ? "selected" : ""
                      }`}
                      onClick={() => setSelectedCTA(option)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                type="submit"
                className="aurax-submit-btn"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="btn-content">
                  {isSubmitting ? (
                    <>
                      <div className="loading-spinner"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      {selectedCTA}
                      <div className="btn-ripple"></div>
                    </>
                  )}
                </span>
              </motion.button>

              {/* Submit Status */}
              {submitStatus && (
                <motion.div
                  className={`submit-status ${submitStatus}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {submitStatus === "success" ? (
                    <>
                      <span>✨</span>
                      Message sent successfully! We'll connect with you soon.
                    </>
                  ) : (
                    <>
                      <span>⚠️</span>
                      Failed to send message. Please try again.
                    </>
                  )}
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Contact Info Card */}
          <motion.div
            className="aurax-info-card"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="info-header">
              <h3>AURAX HQ</h3>
              <div className="location-badge">
                <span>📍</span>
                <span>Mumbai, India</span>
              </div>
            </div>

            <div className="contact-details">
              <div className="contact-item">
                <span className="icon">📞</span>
                <a href="tel:+919923717368">+91 98765 43210</a>
              </div>
              <div className="contact-item">
                <span className="icon">📧</span>
                <a href="mailto:hello@auraxai.io">connect@aurax.io</a>
              </div>
              <div className="contact-item">
                <span className="icon">💬</span>
                <a
                  href="https://wa.me/919923717368"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Direct
                </a>
              </div>
            </div>

            <div className="social-section">
              <h4>Follow Our Aura</h4>
              <div className="social-links">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    className="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="social-icon">{social.icon}</span>
                    <span className="social-platform">{social.platform}</span>
                    <span className="social-handle">{social.handle}</span>
                  </motion.a>
                ))}
              </div>
            </div>

            <div className="response-time">
              <div className="response-badge">
                <span>⚡</span>
                <div>
                  <span className="time">24 Hours</span>
                  <span className="label">Response Time</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
