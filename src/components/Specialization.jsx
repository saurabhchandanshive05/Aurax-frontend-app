import React, { useEffect, useRef, useState, useCallback } from "react";
import usePauseOffscreen from "../hooks/usePauseOffscreen";
import useDeferredStart from "../hooks/useDeferredStart";
import { useNavigate } from "react-router-dom";
import ServiceVisual from "./SpecializationVisuals";
import styles from "./styles/Specialization.module.css";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Specialization = () => {
  const sectionRef = useRef(null);
  // Looping background animations stop while this section is scrolled away
  usePauseOffscreen(sectionRef);
  const started = useDeferredStart(sectionRef);
  const [active, setActive] = useState(null);
  const navigate = useNavigate();
  const [reduced] = useState(prefersReducedMotion);

  // Scroll reveal from each card's real position (IntersectionObserver). The previous
  // ScrollTrigger reveal measured positions once; sections above change height as their
  // media loads, so some cards never reached their stale trigger and stayed invisible.
  useEffect(() => {
    const cells = Array.from(sectionRef.current?.querySelectorAll(".tech-item") || []);
    const show = (el) => el.classList.add(styles.revealed);
    if (reduced || typeof IntersectionObserver === "undefined") {
      cells.forEach(show);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    cells.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduced]);

  // Close the details dialog with Escape
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => e.key === "Escape" && setActive(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  const handleCardClick = (e, tech) => {
    // Ripple feedback, positioned from the card's own box
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const circle = document.createElement("span");
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add(styles.ripple);
    const ripple = el.getElementsByClassName(styles.ripple)[0];
    if (ripple) ripple.remove();
    el.appendChild(circle);
    // Open modal for details
    setTimeout(() => setActive(tech), 150);
  };

  // 3D tilt + spotlight position (lightweight, no extra deps)
  const handleMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    card.style.setProperty("--rx", `${(-py * 8).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${(px * 10).toFixed(2)}deg`);
  }, []);

  const handleMouseLeave = useCallback((e) => {
    const card = e.currentTarget;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  }, []);

  const techStack = [
    {
      name: "AI-Powered Marketing",
      icon: "🧠",
      color: "#5b77ff",
      summary: "Your brief, turned into a creator shortlist",
      description: "Campaign planning by the AURAX team: we turn your brief into a shortlist of reviewed creators and a plan for what they post.",
      points: ["Your brief reviewed by the team", "A shortlist of reviewed creators", "Your campaign listed on the LIVE board"],
      path: "/ai-marketing",
      // (A placeholder YouTube video, not an AURAX demo, was embedded here; removed)
      video: "",
    },
    {
      name: "UGC Automation",
      icon: "🎥",
      color: "#ec4899",
      summary: "Content made by reviewed creators",
      description: "User-generated content made by reviewed creators, briefed and coordinated by the AURAX team.",
      points: ["Creators matched to your product and niche", "Deliverables agreed up front", "One point of contact for every creator"],
      path: "/ugc-automation",
      video: "",
    },
    {
      name: "Creator CRM Systems",
      icon: "📊",
      color: "#00d2ff",
      summary: "Your creators, their pages and stats",
      description: "One place for the creators you work with: their public pages, verified stats and contact through AURAX.",
      points: ["Public creator pages", "Verified Instagram follower counts", "Contact and follow-ups handled by the team"],
      path: "/creator-crm",
      video: "",
    },
    {
      name: "Trend Forecasting",
      icon: "📈",
      color: "#9d4edd",
      summary: "What brands are asking for right now",
      description: "See what brands are asking for right now, from the briefs live on the AURAX board.",
      points: ["The live campaign board", "Categories and platforms in demand", "Hand-picked campaigns flagged"],
      path: "/trend-forecasting",
      video: "",
    },
    {
      name: "Influencer Discovery",
      icon: "🔍",
      color: "#ff9e00",
      summary: "Find reviewed creators by niche or city",
      description: "Search reviewed creators by name, niche or city, or let the team shortlist them for you.",
      points: ["Only reviewed creators", "Search by niche and city", "Verified and self-reported numbers labelled"],
      path: "/influencer-discovery",
      video: "",
    },
    {
      name: "Data-Driven Growth",
      icon: "🚀",
      color: "#43aa8b",
      summary: "Real, verified numbers, not estimates",
      description: "Decisions based on real numbers: verified follower counts and live campaign data, not estimates.",
      points: ["Instagram-connected stats", "Live campaign counts", "Self-reported numbers clearly marked"],
      path: "/data-driven-growth",
      video: "",
    },
  ];

  const hasFinePointer =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(pointer: fine)").matches;
  const tilt = hasFinePointer && !reduced;
  const activeIndex = active ? techStack.findIndex((t) => t.name === active.name) : -1;

  return (
    <section
      ref={sectionRef}
      data-defer-idle={started ? undefined : ""}
      id="services"
      className={styles.specializationSection}
    >
      {/* Perspective grid floor and one soft light */}
      <div className={styles.neuralGrid} aria-hidden="true" />
      <div className={styles.sectionLight} aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.sectionTitle}>We Specialize In</h2>
          <p className={styles.sectionSubtitle}>
            Empowering creators with AI-first, data-intelligent tools that
            transform digital influence
          </p>
        </header>

        <div className={styles.techGrid}>
          {techStack.map((tech, index) => (
            <div
              key={index}
              className={`${styles.techCell} tech-item`}
              style={{ "--reveal-delay": `${(index % 3) * 0.1}s` }}
            >
              <div
                className={styles.techItem}
                style={{ "--float-delay": `${-index * 1.1}s` }}
                onClick={(e) => handleCardClick(e, tech)}
                role="button"
                tabIndex={0}
                aria-label={`${tech.name}: details`}
                onKeyDown={(e) => {
                  // Keyboard users open the details too (the card was mouse-only)
                  if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
                    e.preventDefault();
                    setActive(tech);
                  }
                }}
                onMouseMove={tilt ? handleMouseMove : undefined}
                onMouseLeave={tilt ? handleMouseLeave : undefined}
              >
                <div className={styles.techStage}>
                  <span className={styles.stageShadow} aria-hidden="true" />
                  <div className={styles.techIcon}>
                    <ServiceVisual name={tech.name} uid={index} className={styles.visual} />
                  </div>
                </div>
                <div className={styles.techBody}>
                  <h3 className={styles.techName}>{tech.name}</h3>
                  <p className={styles.techDescription}>{tech.summary || tech.description}</p>
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
              aria-label="Close details"
              autoFocus
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className={styles.modalHeader}>
              <span className={styles.modalIcon}>
                <ServiceVisual name={active.name} uid={`m${activeIndex}`} className={styles.visual} />
              </span>
              <h3>{active.name}</h3>
            </div>
            <p className={styles.modalCopy}>{active.description}</p>
            <ul className={styles.modalList}>
              {(active.points || []).map((point) => (
                <li key={point}>{point}</li>
              ))}
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
