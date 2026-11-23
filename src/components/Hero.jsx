import React, { useEffect, useState, useRef, useCallback, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { getApiEndpoint } from "../utils/getApiUrl";
import styles from "./styles/Hero.module.css";
import sceneStyles from "./styles/HeroScene.module.css";
import HeroOrbitMobile from "./HeroOrbitMobile";
import HeroOrbitFlat from "./HeroOrbitFlat";
import { markHeroReady } from "../utils/heroReady";
import { webglTier } from "../utils/webglSupport";
import usePauseOffscreen from "../hooks/usePauseOffscreen";

// three.js scene is desktop-only (1024px and up): load it on demand so phones and tablets
// never download it. Below 1024px the lightweight CSS orbit (HeroOrbitMobile) is shown.
// Desktop hero scene (three.js) is code-split. On desktop-width screens start fetching it as
// soon as this module runs rather than when the hero first renders, so it is already arriving
// while React renders the rest of the homepage. Phones and tablets never load it.
// High fetch priority: as a code-split script it otherwise loads at "Low" and shares the
// connection with below-the-fold images, which on slow links delayed the 3D hero by seconds.
const loadHeroScene = () => {
  const p = import(/* webpackFetchPriority: "high" */ "./HeroScene");
  // If the 3D code can't be downloaded, don't hold the rest of the homepage back for it
  p.catch(() => markHeroReady());
  return p;
};
// Only on the homepage: this module is part of the main bundle, so without the path check every
// desktop page would download the 3D code (other routes still load it if they navigate home).
if (
  typeof window !== "undefined" &&
  window.innerWidth >= 1024 &&
  window.location.pathname === "/" &&
  webglTier() === "hardware" // without GPU-accelerated WebGL the 3D code is not downloaded
) {
  loadHeroScene();
}
const HeroScene = lazy(loadHeroScene);

// Entrance: each block rises 20px and fades in (0.6s, ease-out), 0.2s after the one before.
// Done with CSS keyframes (styles.enter + a --d delay) rather than JS-driven variants: CSS opacity/
// transform animations run on the compositor, so the copy appears as soon as it is painted even
// while the main thread is still busy starting the rest of the homepage. With the JS version the
// headline stayed at opacity 0 for several seconds on slower machines.
const delay = (s) => ({ "--d": `${s}s` });

const Hero = () => {
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );
  const [isCompact, setIsCompact] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 1024
  );
  const [live, setLive] = useState(null);
  const ctaRef = useRef(null);
  const heroRef = useRef(null);
  // Background grid, pulse and floating blobs stop while the hero is scrolled away
  usePauseOffscreen(heroRef);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsCompact(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // The desktop 3D scene needs GPU-accelerated WebGL. Starting it on a software renderer
  // (SwiftShader, llvmpipe, no GPU drivers) blocks the page for seconds while three.js sets up
  // on the CPU, so those desktops, and browsers without WebGL, get the same orbit in plain
  // CSS instead (HeroOrbitFlat: no WebGL, no per-frame JavaScript).
  // The WebGL capability test runs only at desktop widths: phones and tablets show the CSS orbit,
  // so they never create a (test) WebGL context. webglTier() caches its answer.
  const has3d = !isCompact && (typeof window === "undefined" || webglTier() === "hardware");
  // Mount the 3D scene once the hero copy has been painted: creating the WebGL context and
  // compiling its shaders takes a long main-thread task, which otherwise could land before the
  // first paint. The scene's area is empty until it is ready either way, so nothing visible changes.
  const [mount3d, setMount3d] = useState(false);
  useEffect(() => {
    if (!has3d) return undefined;
    let timer = 0;
    const raf = requestAnimationFrame(() => {
      timer = setTimeout(() => setMount3d(true), 0);
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [has3d]);

  // Phones and tablets have no 3D scene to wait for (the CSS orbit is part of the first paint):
  // let the rest of the homepage start right after it. Desktop is marked ready by HeroScene,
  // or by HeroOrbitFlat once its cards are placed.
  useEffect(() => {
    if (!isCompact) return undefined;
    const raf = requestAnimationFrame(() => markHeroReady());
    return () => cancelAnimationFrame(raf);
  }, [isCompact]);

  // Real platform numbers (read-only endpoint, no view tracking)
  useEffect(() => {
    let cancelled = false;
    fetch(getApiEndpoint("/api/public/campaigns/stats/overview"))
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled && json?.data) setLive(json.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Time of day only tints the background
  useEffect(() => {
    const hour = new Date().getHours();
    setTimeOfDay(hour > 18 || hour < 6 ? "night" : "day");
  }, []);

  // Ripple effect for CTA - optimized with requestAnimationFrame
  const createRipple = useCallback((e) => {
    requestAnimationFrame(() => {
      const button = e.currentTarget;
      const circle = document.createElement("span");
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
      circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
      circle.classList.add(styles.ripple);

      const ripple = button.getElementsByClassName(styles.ripple)[0];
      if (ripple) ripple.remove();

      button.appendChild(circle);
    });
  }, []);

  // Only real numbers: shown when the API answers and there is something live
  const stats =
    live && live.totalLiveCampaigns > 0
      ? [
          { id: "live", title: "Live brand campaigns", value: live.totalLiveCampaigns },
          ...(live.handPickedCampaigns > 0
            ? [{ id: "picked", title: "Hand-picked by our team", value: live.handPickedCampaigns }]
            : []),
        ]
      : [];

  return (
    <section
      ref={heroRef}
      className={`${styles.hero} ${
        timeOfDay === "night" ? styles.nightMode : ""
      }`}
      aria-label="Modern Influencer Platform"
    >
      {/* Animated background (its own pulse animation sets the opacity) */}
      <div className={styles.backgroundOverlay} />

      {/* Main content */}
      <div className={styles.mainContent}>
        {/* Header section */}
        <div className={styles.headerSection}>
          <div className={`${styles.badge} ${styles.enter}`} style={delay(0)}>
            <span className={styles.badgeText}>Creator marketplace, made in India</span>
          </div>

          <h1 className={`${styles.modernHeadline} ${styles.enter}`} style={delay(0.2)}>
            Brands and creators,
            <br />
            matched on real numbers.
          </h1>

          <p className={`${styles.modernSubheadline} ${styles.enter}`} style={delay(0.4)}>
            Creators build a page, connect Instagram and apply to live brand
            campaigns. Brands post what they need and get a shortlist of
            reviewed creators.
          </p>

          {/* Phones and tablets: compact orbit between the copy and the buttons */}
          {isCompact && (
            <div className={styles.enter} style={{ width: "100%", ...delay(0.6) }}>
              <HeroOrbitMobile />
            </div>
          )}

          {/* CTA buttons */}
          <div className={`${styles.ctaGroup} ${styles.enter}`} style={delay(isCompact ? 0.8 : 0.6)}>
            <motion.button
              ref={ctaRef}
              className={styles.primaryCta}
              onClick={() => (window.location.href = "/creator/signup")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Join as a creator</span>
              <svg
                className={styles.ctaArrow}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>

            <motion.button
              className={styles.secondaryCta}
              onClick={() => (window.location.href = "/creators")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Find creators
            </motion.button>
          </div>
        </div>

        {/* Live numbers from the API (hidden when unavailable) */}
        {stats.length > 0 && (
          <a
            href="/live/campaigns"
            className={styles.statsSection}
            aria-label="Open the LIVE campaign board"
          >
            <div className={styles.statsGrid}>
              {stats.map((stat, index) => (
                <div key={stat.id} className={`${styles.statCard} ${styles.enter}`} style={delay((isCompact ? 1 : 0.8) + 0.2 * index)}>
                  <div className={styles.statCardInner}>
                    <div className={styles.statValue}>{stat.value}</div>
                    <div className={styles.statLabel}>{stat.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </a>
        )}

        {/* Feature highlights */}
        <div className={styles.featuresSection}>
          <div className={styles.featuresList}>
            {[
              "Every creator reviewed",
              "Instagram-connected stats",
              "LIVE campaign board",
            ].map((feature, index) => (
              <div
                key={feature}
                className={`${styles.featureItem} ${styles.enter}`}
                style={delay((isCompact ? 1.2 : 1) + 0.2 * index)}
              >
                <div className={styles.featureCheck}>✓</div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Scene for desktop */}
      {!isCompact && (
        <div className={styles.sceneContainer}>
          {/* Hero background tint, painted with the copy instead of when the 3D scene arrives */}
          <div className={sceneStyles.backdrop} />
          {has3d ? (
            mount3d && (
              <Suspense fallback={null}>
                <HeroScene />
              </Suspense>
            )
          ) : (
            <HeroOrbitFlat />
          )}
        </div>
      )}

      {/* Floating elements */}
      {!isMobile && (
        <div className={styles.floatingElements}>
          {/* Same motion as before (framer-motion), now CSS keyframes: runs on the compositor
              instead of JavaScript every frame, and pauses with the hero when scrolled away */}
          <div className={`${styles.floatingElement} ${styles.floatA}`} />
          <div className={`${styles.floatingElement2} ${styles.floatB}`} />
        </div>
      )}
    </section>
  );
};

export default Hero;
