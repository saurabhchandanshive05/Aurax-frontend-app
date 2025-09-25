import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import styles from "./styles/Specialization.module.css";

gsap.registerPlugin(ScrollTrigger);

const Specialization = () => {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const techItems = gsap.utils.toArray(".tech-item");

    techItems.forEach((item, i) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: i * 0.1,
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
          },
        }
      );
    });

    // Mouse move effect for cards
    techItems.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    });

    return () => {
      techItems.forEach((card) => {
        card.removeEventListener("mousemove", () => {});
      });
    };
  }, []);

  const handleCardClick = (e, tech) => {
    // Ripple feedback
    const el = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(el.clientWidth, el.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - el.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - el.offsetTop - radius}px`;
    circle.classList.add(styles.ripple);
    const ripple = el.getElementsByClassName(styles.ripple)[0];
    if (ripple) ripple.remove();
    el.appendChild(circle);
    // Open modal for details
    setTimeout(() => setActive(tech), 150);
  };

  // 3D tilt handlers (lightweight, no extra deps)
  const handleMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateX = (-py * 10).toFixed(2);
    const rotateY = (px * 12).toFixed(2);
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  }, []);

  const handleMouseLeave = useCallback((e) => {
    const card = e.currentTarget;
    card.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
  }, []);

  const techStack = [
    {
      name: "AI-Powered Marketing",
      icon: "🧠",
      color: "#5b77ff",
      description: "AI-optimized campaigns that learn and adapt in real-time",
      path: "/ai-marketing",
      video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      name: "UGC Automation",
      icon: "🎥",
      color: "#ec4899",
      description: "Automated content creation with human-like authenticity",
      path: "/ugc-automation",
      video: "",
    },
    {
      name: "Creator CRM Systems",
      icon: "📊",
      color: "#00d2ff",
      description: "Intelligent relationship management for creators",
      path: "/creator-crm",
      video: "",
    },
    {
      name: "Trend Forecasting",
      icon: "📈",
      color: "#9d4edd",
      description: "Predictive analytics for emerging creator opportunities",
      path: "/trend-forecasting",
      video: "",
    },
    {
      name: "Influencer Discovery",
      icon: "🔍",
      color: "#ff9e00",
      description: "AI-powered matching with perfect creator partnerships",
      path: "influencer-discovery",
      video: "",
    },
    {
      name: "Data-Driven Growth",
      icon: "🚀",
      color: "#43aa8b",
      description: "Growth strategies powered by neural analytics",
      path: "/data-driven-growth",
      video: "",
    },
  ];

  const hasFinePointer =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(pointer: fine)").matches;

  return (
    <section
      ref={sectionRef}
      id="services"
      className={styles.specializationSection}
    >
      {/* Neural Grid Background */}
      <div className={styles.neuralGrid} />

      {/* Neural Connection Lines */}
      <div
        className={styles.neuralConnection}
        style={{
          top: "30%",
          left: "10%",
          width: "25%",
          transform: "rotate(-15deg)",
        }}
      />
      <div
        className={styles.neuralConnection}
        style={{
          top: "45%",
          left: "35%",
          width: "30%",
          transform: "rotate(10deg)",
        }}
      />
      <div
        className={styles.neuralConnection}
        style={{
          top: "60%",
          left: "65%",
          width: "25%",
          transform: "rotate(-5deg)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={styles.sectionTitle}>We Specialize In</h2>
          <p className={styles.sectionSubtitle}>
            Empowering creators with AI-first, data-intelligent tools that
            transform digital influence
          </p>
        </div>

        <div className={styles.techGrid}>
          {techStack.map((tech, index) => (
            <div
              key={index}
              className={`${styles.techItem} tech-item`}
              style={{ "--accent-color": tech.color }}
              onClick={(e) => handleCardClick(e, tech)}
              onMouseMove={hasFinePointer ? handleMouseMove : undefined}
              onMouseLeave={hasFinePointer ? handleMouseLeave : undefined}
            >
              <div className={styles.techIcon}>{tech.icon}</div>
              <h3 className={styles.techName}>{tech.name}</h3>
              <p className={styles.techDescription}>{tech.description}</p>
              <div className={styles.cardActions}>
                <button
                  className={styles.cardCta}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(tech.path);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Learn more
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.swipeHint} aria-hidden>
          <span>Swipe</span>
          <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
            <path
              d="M1 6h24M19 1l6 5-6 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Modal: feature details */}
      {active && (
        <div className={styles.modalOverlay} onClick={() => setActive(null)}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${active.name} details`}
          >
            <button
              className={styles.modalClose}
              onClick={() => setActive(null)}
            >
              ×
            </button>
            <div
              className={styles.modalHeader}
              style={{ borderColor: active.color }}
            >
              <span className={styles.modalIcon}>{active.icon}</span>
              <h3>{active.name}</h3>
            </div>
            <p className={styles.modalCopy}>{active.description}</p>
            <ul className={styles.modalList}>
              <li>Smart onboarding with presets and best practices</li>
              <li>Real-time insights with anomaly alerts</li>
              <li>Templates, playbooks, and case studies</li>
            </ul>
            {active.video && (
              <div className={styles.modalVideoWrap}>
                <iframe
                  src={active.video}
                  title={`${active.name} demo`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            )}
            <div className={styles.modalCtas}>
              <button
                className={styles.primaryCta}
                onClick={() => navigate(active.path)}
              >
                Explore details
              </button>
              <button
                className={styles.secondaryCta}
                onClick={() => setActive(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Specialization;
