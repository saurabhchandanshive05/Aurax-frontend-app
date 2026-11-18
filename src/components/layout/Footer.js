import React, { useState, useEffect, useRef } from "react";
// Footer.css is kept as it was: some of its global class names (section-title, social-icon,
// contact-item, ...) are also used on other pages, which would change if it were removed.
// The footer itself is styled by the scoped module below.
import "./Footer.css";
import s from "./Footer.module.css";

const Icon = {
  phone: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7 2 2 0 0 1 6.6 3.5z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 19.5l1.1-3.6A8 8 0 1 1 8.4 18.6z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M9 10.5h6M9 13.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" fill="none" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="10" r="2.3" fill="currentColor" /></svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  send: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l1.9 6.1 6.1 1.9-6.1 1.9L12 18.5l-1.9-6.1L4 10.5l6.1-1.9z" fill="currentColor" /></svg>
  ),
  up: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
  ),
};

// Existing social destinations and their marks (unchanged)
const socials = [
  {
    href: "https://instagram.com/aurax",
    label: "Instagram",
    path: (
      <>
        <path d="M12.017 0C8.396 0 8.025.015 6.624.072 5.23.13 4.301.333 3.492.63c-.823.32-1.516.748-2.212 1.445-.697.696-1.125 1.389-1.445 2.212C.333 5.098.131 6.026.072 7.421.015 8.823 0 9.194 0 12.016c0 2.823.015 3.194.072 4.596.059 1.394.261 2.323.558 3.133.32.823.748 1.516 1.445 2.212.696.697 1.389 1.125 2.212 1.445.81.297 1.739.499 3.133.558C8.825 23.985 9.196 24 12.017 24c2.82 0 3.191-.015 4.592-.072 1.395-.059 2.324-.261 3.134-.558.823-.32 1.515-.748 2.212-1.445.697-.697 1.125-1.39 1.445-2.212.297-.81.499-1.739.558-3.134.057-1.401.072-1.772.072-4.592 0-2.822-.015-3.193-.072-4.595-.059-1.395-.261-2.324-.558-3.134-.32-.823-.748-1.515-1.445-2.212C19.598 1.378 18.905.95 18.082.63c-.81-.297-1.739-.499-3.134-.558C13.947.015 13.576 0 12.017 0zM12.017 2.162c2.763 0 3.093.012 4.184.069 1.009.046 1.557.217 1.923.361.483.188.829.413 1.191.775.362.362.587.708.775 1.191.144.366.315.914.361 1.923.057 1.091.069 1.421.069 4.184 0 2.763-.012 3.093-.069 4.184-.046 1.009-.217 1.557-.361 1.923-.188.483-.413.829-.775 1.191-.362.362-.708.587-1.191.775-.366.144-.914.315-1.923.361-1.091.057-1.421.069-4.184.069-2.763 0-3.093-.012-4.184-.069-1.009-.046-1.557-.217-1.923-.361-.483-.188-.829-.413-1.191-.775-.362-.362-.587-.708-.775-1.191-.144-.366-.315-.914-.361-1.923C2.174 15.109 2.162 14.779 2.162 12.016c0-2.763.012-3.093.069-4.184.046-1.009.217-1.557.361-1.923.188-.483.413-.829.775-1.191.362-.362.708-.587 1.191-.775.366-.144.914-.315 1.923-.361 1.091-.057 1.421-.069 4.184-.069z" />
        <path d="M12.017 5.838a6.179 6.179 0 100 12.358 6.179 6.179 0 000-12.358zM12.017 16a4.001 4.001 0 110-8.002 4.001 4.001 0 010 8.002z" />
        <circle cx="18.406" cy="5.594" r="1.44" />
      </>
    ),
  },
  {
    href: "https://linkedin.com/company/aurax",
    label: "LinkedIn",
    path: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />,
  },
  {
    href: "https://twitter.com/aurax",
    label: "Twitter/X",
    path: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />,
  },
  {
    href: "https://tiktok.com/@aurax",
    label: "TikTok",
    path: <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />,
  },
  {
    href: "https://youtube.com/@aurax",
    label: "YouTube",
    path: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />,
  },
  {
    href: "https://wa.me/919923717300",
    label: "WhatsApp",
    path: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />,
  },
];

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [email, setEmail] = useState("");
  const footerRef = useRef(null);
  const signatureRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll-aware signature: the wordmark tilts up into place as the footer comes into view.
  // Runs only while the footer is on screen; static under reduced motion.
  useEffect(() => {
    const footer = footerRef.current;
    const sig = signatureRef.current;
    if (!footer || !sig) return undefined;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      sig.style.setProperty("--p", "1");
      return undefined;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = footer.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when the footer top meets the bottom of the screen, 1 when the page bottom is reached
      const p = Math.min(1, Math.max(0, (vh - r.top) / Math.max(r.height, 1)));
      sig.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        update();
      } else {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    });
    io.observe(footer);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
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

  // eslint-disable-next-line no-unused-vars
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
    <footer className={s.footer} ref={footerRef}>
      <div className={s.grid} aria-hidden="true" />
      <div className={s.glow} aria-hidden="true" />

      <div className={s.inner}>
        {/* Newsletter: a compact invitation band */}
        <section className={s.newsletter} aria-labelledby="footer-newsletter-title">
          <div className={s.newsletterCopy}>
            <h2 id="footer-newsletter-title" className={s.newsletterTitle}>Stay in the Aura</h2>
            <p className={s.newsletterText}>
              Get the latest updates on influencer trends, platform features,
              and exclusive insights.
            </p>
          </div>
          <form onSubmit={handleNewsletterSubmit} className={s.newsletterForm}>
            <label htmlFor="footer-newsletter-email" className={s.srOnly}>Email address</label>
            <span className={s.inputIcon} aria-hidden="true">{Icon.mail}</span>
            <input
              id="footer-newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={s.newsletterInput}
              autoComplete="email"
              required
            />
            <button type="submit" className={s.newsletterBtn}>
              <span>Subscribe</span>
              <span className={s.btnIcon}>{Icon.send}</span>
            </button>
          </form>
        </section>

        {/* Directory */}
        <div className={s.directory}>
          <div className={s.brand}>
            <div className={s.brandMark}>
              <span className={s.ring} aria-hidden="true" />
              <span className={s.wordmark}>AURAX</span>
            </div>
            <p className={s.tagline}>Shaping Influence. Powering Connections.</p>
            <p className={s.description}>
              Where brands and creators converge in the next-generation
              influencer marketing ecosystem powered by AI and innovation.
            </p>
          </div>

          <nav className={s.group} aria-labelledby="footer-contact-title">
            <h3 id="footer-contact-title" className={s.groupTitle}>Contact</h3>
            <ul className={s.contactList}>
              <li>
                <a href="tel:+919923717300" className={s.contactRow}>
                  <span className={s.contactIcon}>{Icon.phone}</span>
                  <span className={s.contactText}>+91 9923717368</span>
                </a>
              </li>
              <li>
                <a href="mailto:hello@auraxai.com" className={s.contactRow}>
                  <span className={s.contactIcon}>{Icon.mail}</span>
                  <span className={s.contactText}>hello@auraxai.com</span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/919923717300" className={s.contactRow}>
                  <span className={s.contactIcon}>{Icon.chat}</span>
                  <span className={s.contactText}>WhatsApp Direct</span>
                </a>
              </li>
              <li>
                <div className={`${s.contactRow} ${s.static}`}>
                  <span className={s.contactIcon}>{Icon.pin}</span>
                  <span className={s.contactText}>Mumbai, Maharashtra, India</span>
                </div>
              </li>
            </ul>
          </nav>

          <nav className={s.group} aria-labelledby="footer-company-title">
            <h3 id="footer-company-title" className={s.groupTitle}>Company</h3>
            <ul className={s.linkList}>
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className={s.companyLink}>
                    <span>{link.name}</span>
                    <span className={s.linkArrow}>{Icon.arrow}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={s.group}>
            <h3 className={s.groupTitle}>Follow</h3>
            <ul className={s.socials}>
              {socials.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className={s.social} aria-label={item.label}>
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{item.path}</svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={s.bottom}>
          <p className={s.copyright}>© 2025 AURAX. All rights reserved.</p>
          <p className={s.crafted}>
            Crafted with <span className={s.spark} role="img" aria-label="sparkle">{Icon.spark}</span> from India to the World.
          </p>
        </div>
      </div>

      {/* Signature: the wordmark that closes the page */}
      <div className={s.signature} ref={signatureRef} aria-hidden="true">
        <span className={s.signatureText}>AURAX</span>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          className={s.scrollTop}
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          {Icon.up}
        </button>
      )}
    </footer>
  );
};

export default Footer;
