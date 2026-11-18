import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import styles from "./styles/BrandCollaborations.module.css";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Custom hook for animated counter (shows the final value at once under reduced motion)
const useAnimatedCounter = (end, start = 0, duration = 2, instant = false) => {
  const [displayValue, setDisplayValue] = useState(start);

  useEffect(() => {
    if (end === 0) return undefined;
    if (instant) {
      setDisplayValue(end);
      return undefined;
    }

    let startTime = null;
    let frame = 0;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min(
        (currentTime - startTime) / (duration * 1000),
        1
      );
      // ease-out so the count settles instead of stopping abruptly
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(start + (end - start) * eased);
      setDisplayValue(currentValue);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [end, start, duration, instant]);

  return displayValue;
};

const BrandCollaborations = () => {
  const statsRef = useRef(null);
  const wallRef = useRef(null);
  const navigate = useNavigate();
  const [reduced] = useState(prefersReducedMotion);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 768
  );

  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });

  // Animated counters for stats
  const campaignCount = useAnimatedCounter(statsInView ? 10000 : 0, 0, 2, reduced);
  const creatorCount = useAnimatedCounter(statsInView ? 5000 : 0, 0, 2, reduced);
  const brandCount = useAnimatedCounter(statsInView ? 200 : 0, 0, 2, reduced);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Floating particles: generated once (they were re-randomised on every render,
  // so they jumped around while the counters re-rendered each frame)
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 6 + 2,
        top: Math.random() * 100,
        left: Math.random() * 100,
        color: Math.random() > 0.5 ? "#a855f7" : "#0ea5e9",
        duration: 15 + Math.random() * 15,
        delay: Math.random() * 5,
      })),
    []
  );

  // Stats data with enhanced values and animated counters
  const stats = [
    {
      icon: "🚀",
      value: 10000,
      title: "Campaigns",
      description: "Stories Powered by AI",
      suffix: "+",
      counter: campaignCount,
    },
    {
      icon: "🤖",
      value: 5000,
      title: "Creators",
      description: "Across All Niches",
      suffix: "+",
      counter: creatorCount,
    },
    {
      icon: "🏆",
      value: 200,
      title: "Brands",
      description: "From D2C to Enterprise",
      suffix: "+",
      counter: brandCount,
    },
  ];

  // Brand data with logo paths relative to public directory
  const brands = [
    {
      name: "Amazon Beauty",
      logo: "/images/brands/amazon-beauty.webp",
      path: "/campaigns/amazon-beauty",
      campaign: "AI-Powered Beauty Campaign",
    },
    {
      name: "Astrotalk",
      logo: "/images/brands/plum.webp",
      path: "/campaigns/plum",
      campaign: "Celebs recommend Astrotalk",
    },
    {
      name: "Mamaearth",
      logo: "/images/brands/mamaearth.webp",
      path: "/campaigns/mamaearth",
      campaign: "Natural Parenting Solutions",
    },
    {
      name: "Hotstar",
      logo: "/images/brands/jiocinema.webp",
      path: "/campaigns/jiocinema",
      campaign: "Streaming Experience Redefined",
    },
    {
      name: "Lakme",
      logo: "/images/brands/dot-key.webp",
      path: "/campaigns/dot-key",
      campaign: "Skincare Personalization",
    },
    {
      name: "Minimalist ",
      logo: "/images/brands/liquid-iv.webp",
      path: "/campaigns/liquid-iv",
      campaign: "Minimalist Campaign",
    },
    {
      name: "Ghar Soap",
      logo: "/images/brands/ponds.webp",
      path: "/campaigns/ponds",
      campaign: "Age-Defying Skincare",
    },
    {
      name: "Boat",
      logo: "/images/brands/wishcare.webp",
      path: "/campaigns/wishcare",
      campaign: "Boat Lifestyle Innovation",
    },
  ];

  const handleLogoClick = (path) => {
    navigate(path);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.2, 0, 0, 1],
      },
    },
  };

  const [failedLogos, setFailedLogos] = useState(() => new Set());
  const markLogoFailed = (name) =>
    setFailedLogos((prev) => (prev.has(name) ? prev : new Set(prev).add(name)));

  // The wall turns gently toward the pointer (CSS variables, no re-render per move)
  const onWallMove = (e) => {
    if (reduced || isMobile || !wallRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    const wall = wallRef.current;
    wall.style.setProperty("--wy", `${(x * 8).toFixed(2)}deg`);
    wall.style.setProperty("--wx", `${(-y * 6).toFixed(2)}deg`);
    wall.style.setProperty("--lx", `${((x + 0.5) * 100).toFixed(1)}%`);
    wall.style.setProperty("--ly", `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const onWallLeave = () => {
    if (!wallRef.current) return;
    wallRef.current.style.setProperty("--wy", "0deg");
    wallRef.current.style.setProperty("--wx", "0deg");
  };

  return (
    <section className={styles.section} onMouseMove={onWallMove} onMouseLeave={onWallLeave}>
      {/* Neural Grid Background */}
      <div className={styles.neuralGrid} aria-hidden="true" />
      <div className={styles.wallLight} aria-hidden="true" />

      {/* AI Connection Lines */}
      <div className={styles.aiConnection} aria-hidden="true" style={{ top: "20%", left: "15%", width: "25%", transform: "rotate(-15deg)" }} />
      <div className={styles.aiConnection} aria-hidden="true" style={{ top: "40%", left: "40%", width: "20%", transform: "rotate(5deg)" }} />
      <div className={styles.aiConnection} aria-hidden="true" style={{ top: "65%", left: "65%", width: "25%", transform: "rotate(-10deg)" }} />

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={styles.floatingParticle}
          aria-hidden="true"
          style={{
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particle.color,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      <motion.div
        className={styles.container}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {/* Left: editorial header + statistics ledger */}
        <div className={styles.lede}>
          <motion.div className={styles.titleContainer} variants={itemVariants}>
            <h2 className={styles.title}>Trusted by Visionary Brands</h2>
            <p className={styles.subtitle}>
              We've partnered with industry leaders to deliver exceptional results
              and drive innovation in the digital landscape through AI-powered
              solutions.
            </p>
          </motion.div>

          <motion.dl className={styles.statsCard} ref={statsRef} variants={itemVariants}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <dt className={styles.statTitle}>{stat.title}</dt>
                <dd className={styles.statValue}>
                  <span className={styles.statNumber}>{stat.counter.toLocaleString()}</span>
                  <span className={styles.statSuffix}>{stat.suffix}</span>
                </dd>
                <dd className={styles.statDescription}>{stat.description}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Right: the partner wall */}
        <motion.div className={styles.logoSection} variants={itemVariants}>
          <div className={styles.wallStage}>
            <ul className={styles.logoGrid} ref={wallRef} aria-label="Brand partners">
              {brands.map((brand, index) => {
                const failed = failedLogos.has(brand.name);
                return (
                  <li key={index} className={styles.logoCell} style={{ "--z": `${(index % 3) * 12}px` }}>
                    <button
                      type="button"
                      className={styles.logoItem}
                      onClick={() => handleLogoClick(brand.path)}
                      aria-label={`${brand.name.trim()}: ${brand.campaign}`}
                    >
                      <span className={styles.plaque}>
                        {failed ? (
                          <span className={styles.logoFallback} aria-hidden="true">
                            {getInitials(brand.name)}
                          </span>
                        ) : (
                          <img
                            src={brand.logo}
                            alt=""
                            className={styles.logoImage}
                            width="160"
                            height="160"
                            loading="lazy"
                            decoding="async"
                            onError={() => markLogoFailed(brand.name)}
                          />
                        )}
                        <span className={styles.plaqueSheen} aria-hidden="true" />
                      </span>
                      <span className={styles.caption}>
                        <span className={styles.logoText}>{brand.name}</span>
                        <span className={styles.logoHoverText}>{brand.campaign}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default BrandCollaborations;
