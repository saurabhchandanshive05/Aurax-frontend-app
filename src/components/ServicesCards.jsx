import React, { useEffect, useRef, useState } from "react";
import FeaturedCreators from "./FeaturedCreators";
import styles from "./ServicesCards.module.css";
import useDeferredStart from "../hooks/useDeferredStart";
import usePauseOffscreen from "../hooks/usePauseOffscreen";

const ARROW = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function ServicesCards() {
  const brandsSectionRef = useRef(null);
  const containerRef = useRef(null);
  // Starts directly below the hero: begin when the hero is ready or once scrolled into (the -1px
  // keeps a section that merely touches the fold from counting as on screen)
  const started = useDeferredStart(containerRef, "0px 0px -1px 0px");
  // Neural grid, marquee and image shimmers stop while the section is scrolled away
  usePauseOffscreen(containerRef);
  const [revealed, setRevealed] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);

  // Reveal once the section is on screen (replaces the per-card ScrollTrigger tweens,
  // whose cleanup also killed every ScrollTrigger on the page)
  useEffect(() => {
    const el = brandsSectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleBrandClick = (brand) => {

  };

  const brands = [
    { id: 1, name: "UNOVA", logo: "/logos/Groww.webp" },
    { id: 2, name: "greencure", logo: "/logos/greencure.webp" },
    { id: 3, name: "Relevel", logo: "/logos/relevel.webp" },
    { id: 4, name: "ekacare", logo: "/logos/ekacare.webp" },
    { id: 5, name: "gamezy", logo: "/logos/gamezy.webp" },
    { id: 6, name: "HEALTHORE", logo: "/logos/healthore.webp" },
    { id: 7, name: "Baidyanath", logo: "/logos/baidyanath.webp" },
    { id: 8, name: "KUKU", logo: "/logos/kuku.webp" },
    { id: 9, name: "mpllearn", logo: "/logos/mpllearn.webp" },
    { id: 10, name: "PRODUCTS", logo: "/logos/products.webp" },
  ];

  // Two runway rows: the second starts halfway through the list and runs the other way
  const rowB = [...brands.slice(5), ...brands.slice(0, 5)];
  const rows = [
    { key: "a", items: brands, reverse: false },
    { key: "b", items: rowB, reverse: true },
  ];

  return (
    <div ref={containerRef} className={styles.servicesContainer} data-defer-idle={started ? undefined : ""}>
      <div className={styles.neuralGrid}></div>

      {/* Modern Featured Creators Section */}
      <FeaturedCreators />

      <section
        ref={brandsSectionRef}
        className={`${styles.brandsSection} ${revealed ? styles.isRevealed : ""}`}
        aria-labelledby="trusted-best-title"
      >
        <div className={styles.tbHeader}>
          <div className={styles.tbHeading}>
            <p className={styles.sectionKicker}>
              Top brands collaborate with our creators
            </p>
            <h2 id="trusted-best-title" className={styles.tbTitle}>Trusted by the Best</h2>
          </div>
          <div className={styles.tbAside}>
            <p className={styles.sectionSubtitle}>
              Brands who've scaled with our creator network
            </p>
            <div className={styles.sectionCtaRow}>
              <button
                className={styles.caseStudiesCta}
                onClick={() => (window.location.href = "/case-studies")}
              >
                <span>See success stories</span>
                <span className={styles.ctaArrow}>{ARROW}</span>
              </button>
            </div>
          </div>
        </div>

        <div
          className={`${styles.runway} ${touchPaused ? styles.isPaused : ""}`}
          onTouchStart={() => setTouchPaused(true)}
          onTouchEnd={() => setTouchPaused(false)}
          onTouchCancel={() => setTouchPaused(false)}
        >
          <div className={styles.runwayPlane}>
            {rows.map((row, r) => (
              <div
                key={row.key}
                className={`${styles.marqueeContainer} ${row.reverse ? styles.reverse : ""}`}
                aria-hidden={r === 1 ? true : undefined}
              >
                <ul className={styles.marqueeTrack} aria-label={r === 0 ? "Brands" : undefined}>
                  {[...row.items, ...row.items].map((brand, index) => (
                    <li
                      key={`brand-${row.key}-${brand.id}-${index}`}
                      className={styles.brandCard}
                      data-brand-card
                      aria-hidden={index >= row.items.length ? true : undefined}
                      onClick={() => handleBrandClick(brand)}
                    >
                      <div className={styles.brandLogo}>
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className={styles.brandLogoImg}
                          width="320"
                          height="154"
                          loading="lazy"
                          decoding="async"
                          draggable="false"
                        />
                        <span className={styles.gloss} aria-hidden="true" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ServicesCards;
