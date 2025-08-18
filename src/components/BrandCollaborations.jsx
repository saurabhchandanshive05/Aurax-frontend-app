import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import styles from "./styles/BrandCollaborations.module.css";

// Custom hook for animated counter
const useAnimatedCounter = (end, start = 0, duration = 2) => {
  const [displayValue, setDisplayValue] = useState(start);

  useEffect(() => {
    if (end === 0) return;

    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min(
        (currentTime - startTime) / (duration * 1000),
        1
      );
      const currentValue = Math.round(start + (end - start) * progress);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, start, duration]);

  return displayValue;
};

const BrandCollaborations = () => {
  const containerRef = useRef(null);
  const statsRef = useRef(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const statsInView = useInView(statsRef, { once: true, threshold: 0.3 });

  // Animated counters for stats
  const campaignCount = useAnimatedCounter(statsInView ? 10000 : 0, 0, 2);
  const creatorCount = useAnimatedCounter(statsInView ? 5000 : 0, 0, 2);
  const brandCount = useAnimatedCounter(statsInView ? 200 : 0, 0, 2);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Create floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    top: Math.random() * 100,
    left: Math.random() * 100,
    color: Math.random() > 0.5 ? "#a855f7" : "#0ea5e9",
    duration: 15 + Math.random() * 15,
    delay: Math.random() * 5,
  }));

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
      logo: "/images/brands/amazon-beauty.png",
      path: "/campaigns/amazon-beauty",
      campaign: "AI-Powered Beauty Campaign",
    },
    {
      name: "Plum",
      logo: "/images/brands/plum.png",
      path: "/campaigns/plum",
      campaign: "Vegan Beauty Revolution",
    },
    {
      name: "Mamaearth",
      logo: "/images/brands/mamaearth.png",
      path: "/campaigns/mamaearth",
      campaign: "Natural Parenting Solutions",
    },
    {
      name: "JioCinema",
      logo: "/images/brands/jiocinema.png",
      path: "/campaigns/jiocinema",
      campaign: "Streaming Experience Redefined",
    },
    {
      name: "Dot & Key",
      logo: "/images/brands/dot-key.png",
      path: "/campaigns/dot-key",
      campaign: "Skincare Personalization",
    },
    {
      name: "Liquid IV",
      logo: "/images/brands/liquid-iv.png",
      path: "/campaigns/liquid-iv",
      campaign: "Hydration Science Campaign",
    },
    {
      name: "Pond's",
      logo: "/images/brands/ponds.png",
      path: "/campaigns/ponds",
      campaign: "Age-Defying Skincare",
    },
    {
      name: "WishCare",
      logo: "/images/brands/wishcare.png",
      path: "/campaigns/wishcare",
      campaign: "Haircare Innovation",
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

  // Touch handlers for mobile carousel
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - startX;
    const walk = (x / containerRef.current.offsetWidth) * 100;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const statVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className={styles.section}>
      {/* Neural Grid Background */}
      <div className={styles.neuralGrid} />

      {/* AI Connection Lines */}
      <div
        className={`${styles.aiConnection}`}
        style={{
          top: "20%",
          left: "15%",
          width: "25%",
          transform: "rotate(-15deg)",
        }}
      />
      <div
        className={`${styles.aiConnection}`}
        style={{
          top: "40%",
          left: "40%",
          width: "20%",
          transform: "rotate(5deg)",
        }}
      />
      <div
        className={`${styles.aiConnection}`}
        style={{
          top: "65%",
          left: "65%",
          width: "25%",
          transform: "rotate(-10deg)",
        }}
      />

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={styles.floatingParticle}
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
        viewport={{ once: true, threshold: 0.1 }}
      >
        <motion.div className={styles.titleContainer} variants={itemVariants}>
          <h2 className={styles.title}>🤝 Trusted by Visionary Brands</h2>
          <p className={styles.subtitle}>
            We've partnered with industry leaders to deliver exceptional results
            and drive innovation in the digital landscape through AI-powered
            solutions.
          </p>
        </motion.div>

        <div className={styles.contentGrid}>
          {/* Stats Card - Now appears first on mobile */}
          <motion.div
            className={styles.statsCard}
            ref={statsRef}
            variants={itemVariants}
          >
            <div className={styles.statsGrid}>
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className={styles.statItem}
                  variants={statVariants}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={styles.statIcon}>
                    <div className={styles.iconGlow}></div>
                    {stat.icon}
                  </div>
                  <div className={styles.statContent}>
                    <motion.div
                      className={styles.statValue}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                    >
                      <span>{stat.counter.toLocaleString()}</span>
                      {stat.suffix}
                    </motion.div>
                    <h3 className={styles.statTitle}>{stat.title}</h3>
                    <p className={styles.statDescription}>{stat.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Logo Grid/Carousel */}
          <motion.div className={styles.logoSection} variants={itemVariants}>
            {isMobile ? (
              // Mobile Swipeable Carousel
              <div
                className={styles.mobileCarousel}
                ref={containerRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className={styles.carouselTrack}>
                  {brands.map((brand, index) => (
                    <motion.div
                      key={index}
                      className={styles.mobileLogoItem}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleLogoClick(brand.path)}
                    >
                      <div className={styles.logoContainer}>
                        <div className={styles.logoImageContainer}>
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className={styles.logoImage}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display =
                                "flex";
                            }}
                          />
                          <div className={styles.logoFallback}>
                            {getInitials(brand.name)}
                          </div>
                        </div>
                        <div className={styles.logoText}>{brand.name}</div>
                      </div>
                      <div className={styles.logoHoverText}>
                        {brand.campaign}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              // Desktop Grid
              <div className={styles.logoGrid}>
                {brands.map((brand, index) => (
                  <motion.div
                    key={index}
                    className={styles.logoItem}
                    variants={itemVariants}
                    whileHover={{
                      y: -10,
                      transition: { type: "spring", stiffness: 300 },
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLogoClick(brand.path)}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
                      e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
                    }}
                  >
                    <div className={styles.logoContainer}>
                      <div className={styles.logoImageContainer}>
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className={styles.logoImage}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "flex";
                          }}
                        />
                        <div className={styles.logoFallback}>
                          {getInitials(brand.name)}
                        </div>
                      </div>
                      <div className={styles.logoText}>{brand.name}</div>
                    </div>
                    <div className={styles.logoHoverText}>{brand.campaign}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default BrandCollaborations;
