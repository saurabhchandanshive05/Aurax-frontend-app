import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FeaturedCreators from "./FeaturedCreators";
import styles from "./ServicesCards.module.css";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

function ServicesCards() {
  const marqueeRef = useRef(null);
  const brandsSectionRef = useRef(null);

  useEffect(() => {
    if (brandsSectionRef.current) {
      const cards =
        brandsSectionRef.current.querySelectorAll("[data-brand-card]");
      gsap.utils.toArray(cards).forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: i * 0.1,
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
            },
          }
        );
      });
    }

    if (marqueeRef.current) {
      const track = marqueeRef.current;
      const width = track.scrollWidth / 2;
      const tween = gsap.to(track, {
        x: -width,
        duration: 30,
        repeat: -1,
        ease: "none",
      });

      // Pause on hover for desktop
      const container = track.parentElement;
      const onEnter = () => tween.pause();
      const onLeave = () => tween.resume();
      container.addEventListener("mouseenter", onEnter);
      container.addEventListener("mouseleave", onLeave);

      // Touch swipe support for mobile
      let startX = 0;
      const onTouchStart = (e) => {
        startX = e.touches[0].clientX;
        tween.pause();
      };
      const onTouchEnd = (e) => {
        const delta = e.changedTouches[0].clientX - startX;
        // Nudge the track in swipe direction for tactile feel
        gsap.to(track, { x: "+=" + delta, duration: 0.3, ease: "power2.out" });
        tween.resume();
      };
      container.addEventListener("touchstart", onTouchStart, { passive: true });
      container.addEventListener("touchend", onTouchEnd, { passive: true });

      // Cleanup
      return () => {
        container.removeEventListener("mouseenter", onEnter);
        container.removeEventListener("mouseleave", onLeave);
        container.removeEventListener("touchstart", onTouchStart);
        container.removeEventListener("touchend", onTouchEnd);
        tween.kill();
      };
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const handleBrandClick = (brand) => {
    console.log("Opening case study for", brand.name);
  };

  const brands = [
    { id: 1, name: "UNOVA", logo: "/logos/Groww.png" },
    { id: 2, name: "greencure", logo: "/logos/greencure.png" },
    { id: 3, name: "Relevel", logo: "/logos/relevel.png" },
    { id: 4, name: "ekacare", logo: "/logos/ekacare.png" },
    { id: 5, name: "gamezy", logo: "/logos/gamezy.png" },
    { id: 6, name: "HEALTHORE", logo: "/logos/healthore.png" },
    { id: 7, name: "Baidyanath", logo: "/logos/baidyanath.png" },
    { id: 8, name: "KUKU", logo: "/logos/kuku.png" },
    { id: 9, name: "mpllearn", logo: "/logos/mpllearn.png" },
    { id: 10, name: "PRODUCTS", logo: "/logos/products.png" },
  ];

  return (
    <div className={styles.servicesContainer}>
      <div className={styles.neuralGrid}></div>

      {/* Modern Featured Creators Section */}
      <FeaturedCreators />

      <section ref={brandsSectionRef} className={styles.brandsSection}>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className={styles.sectionTitle}>Trusted by the Best</h2>
          <p className={styles.sectionKicker}>
            Top brands collaborate with our creators
          </p>
          <p className={styles.sectionSubtitle}>
            Brands who've scaled with our creator network
          </p>

          <div className={styles.marqueeContainer}>
            <div className={styles.marqueeTrack} ref={marqueeRef}>
              {[...brands, ...brands].map((brand, index) => (
                <div
                  key={`brand-${brand.id}-${index}`}
                  className={styles.brandCard}
                  data-brand-card
                  onClick={() => handleBrandClick(brand)}
                >
                  <div
                    className={styles.brandLogo}
                    style={{ backgroundImage: `url(${brand.logo})` }}
                  >
                    <div className={styles.glowEffect}></div>
                    <div className={styles.shimmerEffect}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sectionCtaRow}>
            <button
              className={styles.caseStudiesCta}
              onClick={() => (window.location.href = "/case-studies")}
            >
              See success stories →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ServicesCards;
