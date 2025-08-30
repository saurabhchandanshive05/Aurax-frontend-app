import React, { useState, useEffect } from "react";
import "./Footer.css";

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Newsletter signup logic here
      alert("Welcome to the AURAX community! 🌟");
      setEmail("");
    }
  };

  const platformLinks = [
    { name: "Creator Directory", href: "/creators", icon: "👑" },
    { name: "Campaigns", href: "/campaigns", icon: "🚀" },
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Analytics", href: "/analytics", icon: "📈" },
  ];

  const companyLinks = [
    { name: "About", href: "/about", icon: "ℹ️" },
    { name: "Careers", href: "/careers", icon: "💼" },
    { name: "Blog", href: "/", icon: "📝" },
    { name: "Press", href: "/", icon: "📰" },
  ];

  return (
    <footer className="aurax-footer">
      {/* Aurora background animation */}
      <div className="aurora-background"></div>
      <div className="neural-grid"></div>

      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Brand Identity Section */}
          <div className="brand-section">
            <div className="aurax-brand-container">
              <h3 className="aurax-footer-logo">
                <span className="aurax-logo-text">AURAX</span>
                <div className="logo-aura"></div>
              </h3>
              <p className="brand-tagline">
                Shaping Influence. Powering Connections.
              </p>
              <p className="footer-description">
                Where brands and creators converge in the next-generation
                influencer marketing ecosystem powered by AI and innovation.
              </p>
            </div>

            {/* Contact Information */}
            <div className="contact-section">
              <div className="contact-item">
                <a href="tel:+919876543210" className="contact-link">
                  <div className="contact-icon phone-icon">📞</div>
                  <span>+91 9923717368</span>
                </a>
              </div>
              <div className="contact-item">
                <a href="mailto:hello@auraxai.com" className="contact-link">
                  <div className="contact-icon email-icon">✉️</div>
                  <span>hello@auraxai.com</span>
                </a>
              </div>
              <div className="contact-item">
                <a
                  href="https://wa.me/919923717368"
                  className="contact-link whatsapp-link"
                >
                  <div className="contact-icon whatsapp-icon">💬</div>
                  <span>WhatsApp Direct</span>
                </a>
              </div>
              <div className="contact-item">
                <div className="contact-icon location-icon">📍</div>
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links Grid */}
          <div className="links-grid">
            {/* Company Links */}
            <div className="links-section">
              <h4 className="section-title">
                <span className="aurax-gradient-text">Company</span>
                <div className="title-glow"></div>
              </h4>
              <div className="footer-links">
                {companyLinks.map((link, index) => (
                  <a key={index} href={link.href} className="footer-link">
                    <span className="link-icon">{link.icon}</span>
                    <span className="link-text">{link.name}</span>
                    <div className="link-underline"></div>
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="newsletter-section">
              <h4 className="section-title">
                <span className="aurax-gradient-text">Stay in the Aura</span>
                <div className="title-glow"></div>
              </h4>
              <p className="newsletter-description">
                Get the latest updates on influencer trends, platform features,
                and exclusive insights.
              </p>
              <form
                onSubmit={handleNewsletterSubmit}
                className="newsletter-form"
              >
                <div className="input-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="newsletter-input"
                    required
                  />
                  <button type="submit" className="newsletter-btn">
                    <span>Subscribe</span>
                    <div className="btn-glow"></div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Divider with gradient glow */}
        <div className="footer-divider">
          <div className="divider-line"></div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="copyright-section">
            <p className="copyright">© 2025 AURAX. All rights reserved.</p>
            <p className="crafted-text">
              Crafted with ✨ from India to the World.
            </p>
          </div>

          {/* Enhanced Social Media Links */}
          <div className="social-section">
            <div className="social-links">
              <a
                href="https://instagram.com/aurax"
                className="social-icon instagram"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C8.396 0 8.025.015 6.624.072 5.23.13 4.301.333 3.492.63c-.823.32-1.516.748-2.212 1.445-.697.696-1.125 1.389-1.445 2.212C.333 5.098.131 6.026.072 7.421.015 8.823 0 9.194 0 12.016c0 2.823.015 3.194.072 4.596.059 1.394.261 2.323.558 3.133.32.823.748 1.516 1.445 2.212.696.697 1.389 1.125 2.212 1.445.81.297 1.739.499 3.133.558C8.825 23.985 9.196 24 12.017 24c2.82 0 3.191-.015 4.592-.072 1.395-.059 2.324-.261 3.134-.558.823-.32 1.515-.748 2.212-1.445.697-.697 1.125-1.39 1.445-2.212.297-.81.499-1.739.558-3.134.057-1.401.072-1.772.072-4.592 0-2.822-.015-3.193-.072-4.595-.059-1.395-.261-2.324-.558-3.134-.32-.823-.748-1.515-1.445-2.212C19.598 1.378 18.905.95 18.082.63c-.81-.297-1.739-.499-3.134-.558C13.947.015 13.576 0 12.017 0zM12.017 2.162c2.763 0 3.093.012 4.184.069 1.009.046 1.557.217 1.923.361.483.188.829.413 1.191.775.362.362.587.708.775 1.191.144.366.315.914.361 1.923.057 1.091.069 1.421.069 4.184 0 2.763-.012 3.093-.069 4.184-.046 1.009-.217 1.557-.361 1.923-.188.483-.413.829-.775 1.191-.362.362-.708.587-1.191.775-.366.144-.914.315-1.923.361-1.091.057-1.421.069-4.184.069-2.763 0-3.093-.012-4.184-.069-1.009-.046-1.557-.217-1.923-.361-.483-.188-.829-.413-1.191-.775-.362-.362-.587-.708-.775-1.191-.144-.366-.315-.914-.361-1.923C2.174 15.109 2.162 14.779 2.162 12.016c0-2.763.012-3.093.069-4.184.046-1.009.217-1.557.361-1.923.188-.483.413-.829.775-1.191.362-.362.708-.587 1.191-.775.366-.144.914-.315 1.923-.361 1.091-.057 1.421-.069 4.184-.069z" />
                  <path d="M12.017 5.838a6.179 6.179 0 100 12.358 6.179 6.179 0 000-12.358zM12.017 16a4.001 4.001 0 110-8.002 4.001 4.001 0 010 8.002z" />
                  <circle cx="18.406" cy="5.594" r="1.44" />
                </svg>
                <div className="social-glow instagram-glow"></div>
              </a>
              <a
                href="https://linkedin.com/company/aurax"
                className="social-icon linkedin"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <div className="social-glow linkedin-glow"></div>
              </a>
              <a
                href="https://twitter.com/aurax"
                className="social-icon twitter"
                aria-label="Twitter/X"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <div className="social-glow twitter-glow"></div>
              </a>
              <a
                href="https://tiktok.com/@aurax"
                className="social-icon tiktok"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
                <div className="social-glow tiktok-glow"></div>
              </a>
              <a
                href="https://youtube.com/@aurax"
                className="social-icon youtube"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <div className="social-glow youtube-glow"></div>
              </a>
              <a
                href="https://wa.me/919923717368"
                className="social-icon whatsapp"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <div className="social-glow whatsapp-glow"></div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button - Enhanced */}
      {showScrollTop && (
        <button
          className="aurax-scroll-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <div className="scroll-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </div>
          <div className="scroll-glow"></div>
        </button>
      )}
    </footer>
  );
};

export default Footer;
