import React, { useRef, useEffect, useState } from "react";
import useDeferredStart from "../hooks/useDeferredStart";
import { motion } from "framer-motion";
import styles from "./BrandSuccessShowcase/BrandSuccessShowcase.module.css";

// Phones get a 480px-wide, eco-quality Cloudinary rendition; desktop keeps the original URL
const isMobileViewport = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(max-width: 767px)").matches;

const videoSrcFor = (url, mobile) =>
  mobile ? url.replace("/video/upload/f_auto,q_auto,w_800/", "/video/upload/f_auto,q_auto:eco,w_480/") : url;

// The campaign thumbnails were never uploaded under their public IDs (they 404), so the poster
// is taken from the campaign's own video: Cloudinary serves a still frame of an existing video
// when the same asset is requested as an image. 1s in, because some videos open on a blank frame.
const videoPosterFor = (videoUrl) => {
  const m = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(?:[^/]+\/)?([^/]+)\.(webm|mp4|mov)$/.exec(videoUrl || "");
  return m ? `${m[1]}so_1,f_auto,q_auto,w_600/${m[2]}.jpg` : null;
};
const posterCandidates = (campaign) =>
  [videoPosterFor(campaign.videoUrl), campaign.thumbnail].filter(Boolean);

const BrandSuccessShowcase = () => {
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const started = useDeferredStart(sectionRef);
  const innerContainerRef = useRef(null);
  const videoRefs = useRef({});
  const [isMobileVideo] = useState(isMobileViewport);
  const [autoScroll, setAutoScroll] = useState(true);
  const [playingStates, setPlayingStates] = useState({});
  // Which poster candidate each campaign is on; past the last one shows the branded fallback
  const [posterStep, setPosterStep] = useState({});
  // Posters are requested once the section is near the viewport, so a panel brought in by the
  // arrows already has its artwork (lazy loading waited until each panel was on screen)
  const [postersReady, setPostersReady] = useState(false);
  // Reduced motion: no drift, no 3D placement, and videos wait for the play button
  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const campaigns = [
    {
      id: 1,
      brand: "Adidas",
      views: "+1.5M",
      roas: "120%",
      videoUrl:
        "https://res.cloudinary.com/dzvtsnpr6/video/upload/f_auto,q_auto,w_800/adidas-campaign_d9fxfi.webm",
      thumbnail:
        "https://res.cloudinary.com/dzvtsnpr6/image/upload/f_auto,q_auto,w_800/adidas-campaign-thumbnail.jpg",
    },
    {
      id: 2,
      brand: "Flipkart",
      views: "+1.8M",
      roas: "95%",
      videoUrl:
        "https://res.cloudinary.com/dzvtsnpr6/video/upload/f_auto,q_auto,w_800/amazon-campaign_mdt60y.webm",
      thumbnail:
        "https://res.cloudinary.com/dzvtsnpr6/image/upload/f_auto,q_auto,w_800/amazon-campaign-thumbnail.jpg",
    },
    {
      id: 3,
      brand: "Nivea",
      views: "+1.2M",
      roas: "150%",
      videoUrl:
        "https://res.cloudinary.com/dzvtsnpr6/video/upload/f_auto,q_auto,w_800/apple-campaign_pyix41.webm",
      thumbnail:
        "https://res.cloudinary.com/dzvtsnpr6/image/upload/f_auto,q_auto,w_800/apple-campaign-thumbnail.jpg",
    },
    {
      id: 4,
      brand: "Coca-Cola",
      views: "+1.1M",
      roas: "210%",
      videoUrl:
        "https://res.cloudinary.com/dzvtsnpr6/video/upload/f_auto,q_auto,w_800/cocacola-campaign_d93ikv.webm",
      thumbnail:
        "https://res.cloudinary.com/dzvtsnpr6/image/upload/f_auto,q_auto,w_800/cocacola-campaign-thumbnail.jpg",
    },
    {
      id: 5,
      brand: "Nike",
      views: "+1.9M",
      roas: "180%",
      videoUrl:
        "https://res.cloudinary.com/dzvtsnpr6/video/upload/f_auto,q_auto,w_800/nike-campaign_rwlxcy.webm",
      thumbnail:
        "https://res.cloudinary.com/dzvtsnpr6/image/upload/f_auto,q_auto,w_800/nike-campaign-thumbnail.jpg",
    },
    {
      id: 6,
      brand: "Sprite",
      views: "+1.1M",
      roas: "110%",
      videoUrl:
        "https://res.cloudinary.com/dzvtsnpr6/video/upload/f_auto,q_auto,w_800/samsung-campaign_z6zm8c.webm",
      thumbnail:
        "https://res.cloudinary.com/dzvtsnpr6/image/upload/f_auto,q_auto,w_800/samsung-campaign-thumbnail.jpg",
    },
  ];

  // Load and play videos only while they are on screen, so they don't
  // compete with above-the-fold images on page load
  useEffect(() => {
    const videos = Object.values(videoRefs.current).filter(Boolean);
    if (prefersReducedMotion) return undefined;
    if (!videos.length || typeof IntersectionObserver === "undefined") {
      videos.forEach((v) => v.play().catch(() => {}));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) {
            target.play().catch(() => {});
          } else if (!target.paused) {
            target.pause();
          }
        });
      },
      { rootMargin: "200px 320px" }
    );
    videos.forEach((v) => observer.observe(v));
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // Create duplicated campaigns for seamless looping
  const duplicatedCampaigns = [...campaigns, ...campaigns];

  // Handle video play/pause
  const toggleVideoPlayback = (id) => {
    const video = videoRefs.current[id];
    if (video) {
      if (video.paused) {
        video.play().catch(() => {
          // Autoplay failed - this is expected and can be ignored
        });
        setPlayingStates((prev) => ({ ...prev, [id]: true }));
      } else {
        video.pause();
        setPlayingStates((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  // Continuous drift + the concave "display wall" placement, in one rAF loop that only runs
  // while the section is on screen. The drift reads/writes the real scroll position, so
  // hover, arrows and touch all hand back to it without a jump.
  const autoScrollRef = useRef(autoScroll);
  autoScrollRef.current = autoScroll;
  const resumeTimerRef = useRef(null);
  const startedRef = useRef(false);
  // Arrow glide, driven by the same loop as the drift. The browser's smooth scroll was cancelled
  // by the loop's own scroll writes (wrap/drift), which showed as a jump/flicker on click.
  const glideRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerContainerRef.current;
    if (!container || !inner) return undefined;

    const cards = Array.from(inner.children);
    // Card positions and widths only change on resize: measure them once (and again after a
    // resize) instead of reading offsetLeft/offsetWidth for every card on every frame. Those
    // reads came right after this loop's own style writes, so each frame forced a style and
    // layout pass; at mount they forced full-page layouts while the homepage was starting up.
    let geo = null;
    const measure = () => {
      geo = {
        cw: container.clientWidth,
        half: inner.scrollWidth / 2, // content is duplicated once
        centers: cards.map((el) => el.offsetLeft + el.offsetWidth / 2),
      };
      return geo;
    };
    const g0 = () => geo || measure();
    const half = () => g0().half;
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => { geo = null; });
      ro.observe(container);
      ro.observe(inner);
    }

    let raf = 0;
    let last = performance.now();
    let visible = false; // the loop starts when the section comes near the screen
    let carry = 0; // sub-pixel drift accumulator (scrollLeft is integer in some browsers)

    const place = () => {
      const { cw, centers } = g0();
      const mid = container.scrollLeft + cw / 2;
      const span = Math.max(cw / 2, 1);
      for (let i = 0; i < cards.length; i++) {
        const x = Math.max(-1.3, Math.min(1.3, (centers[i] - mid) / span));
        cards[i].style.setProperty("--x", x.toFixed(3));
        cards[i].style.setProperty("--ax", Math.abs(x).toFixed(3));
      }
    };
    // Start in the middle of the duplicated strip (done when the section first comes near the
    // screen, not during page startup)
    const init = () => {
      if (!startedRef.current) {
        container.scrollLeft = half();
        startedRef.current = true;
      }
    };

    const wrap = () => {
      const w = half();
      let shift = 0;
      if (container.scrollLeft <= 1) shift = w;
      else if (container.scrollLeft >= w * 2 - container.clientWidth - 1) shift = -w;
      if (shift) {
        container.scrollLeft += shift;
        const g = glideRef.current;
        if (g) {
          g.from += shift;
          g.to += shift;
        }
      }
    };

    const tick = (now) => {
      const dt = Math.min(now - last, 50);
      last = now;
      const g = glideRef.current;
      if (g) {
        // rAF's frame timestamp can precede the click's own timestamp: clamp so it never runs backwards
        const p = Math.min(1, Math.max(0, (now - g.t0) / g.dur));
        const eased = 1 - Math.pow(1 - p, 3);
        container.scrollLeft = g.from + (g.to - g.from) * eased;
        if (p >= 1) glideRef.current = null;
      } else if (autoScrollRef.current && !prefersReducedMotion) {
        carry += 0.09 * dt; // same pace as before: 1.5px per 60fps frame
        const step = Math.floor(carry);
        if (step) {
          container.scrollLeft -= step;
          carry -= step;
        }
      }
      wrap();
      place();
      if (visible) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    let io;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible) {
            init();
            place();
            start();
          }
        },
        { rootMargin: "200px 0px" }
      );
      io.observe(container);
    } else {
      visible = true;
      init();
      place();
      start();
    }
    // Manual scrolling (touch, arrows) while the loop is idle still updates the wall
    const onScroll = () => {
      if (!visible) {
        init();
        wrap();
        place();
      }
    };
    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      ro?.disconnect();
      container.removeEventListener("scroll", onScroll);
    };
  }, [prefersReducedMotion]);

  useEffect(() => () => clearTimeout(resumeTimerRef.current), []);

  useEffect(() => {
    // Not while the homepage hero is still starting (unless this section is already close)
    if (!started) return undefined;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setPostersReady(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPostersReady(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  const resumeLater = () => {
    clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setAutoScroll(true), 3000);
  };

  // Manual scroll navigation
  const scrollCarousel = (direction) => {
    if (!containerRef.current) return;
    autoScrollRef.current = false; // stop the drift this frame, not after the re-render
    setAutoScroll(false);

    const container = containerRef.current;
    const firstCard = container.querySelector(`.${styles.card}`);
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const gap = parseFloat(getComputedStyle(innerContainerRef.current).columnGap) || 25;
    const scrollAmount = (cardWidth + gap) * direction;

    if (prefersReducedMotion) {
      container.scrollLeft += scrollAmount;
    } else {
      // Consecutive clicks queue up whole panel steps from the current target
      const g = glideRef.current;
      const from = container.scrollLeft;
      glideRef.current = { from, to: (g ? g.to : from) + scrollAmount, t0: performance.now(), dur: 520 };
    }

    // Resume auto-scroll after 3 seconds
    resumeLater();
  };

  // Mouse tilt with layered depth (CSS variables only; no re-render per move)
  const onTilt = (e) => {
    if (prefersReducedMotion || e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--tx", `${(x * 12).toFixed(2)}deg`);
    el.style.setProperty("--ty", `${(-y * 9).toFixed(2)}deg`);
    el.style.setProperty("--lx", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--ly", `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const resetTilt = (e) => {
    e.currentTarget.style.setProperty("--tx", "0deg");
    e.currentTarget.style.setProperty("--ty", "0deg");
  };

  return (
    <section ref={sectionRef} className={styles.showcaseSection} data-defer-idle={started ? undefined : ""}>
      <div className={styles.header}>
        <motion.h2
          className={styles.sectionTitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
        >
          Real Creators. Real Influence.
        </motion.h2>
        <motion.p
          className={styles.sectionSubtitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.2, 0, 0, 1] }}
        >
          Showcase of high-performing influencer videos curated by campaigns
        </motion.p>
      </div>

      <div
        className={styles.carouselWrapper}
        onMouseEnter={() => setAutoScroll(false)}
        onMouseLeave={() => setAutoScroll(true)}
        onTouchStart={() => {
          clearTimeout(resumeTimerRef.current);
          glideRef.current = null; // a finger takes over from an arrow glide
          autoScrollRef.current = false;
          setAutoScroll(false);
        }}
        onTouchEnd={resumeLater}
        aria-roledescription="carousel"
        aria-label="Campaign showcase"
      >
        <div className={styles.cardsContainer} ref={containerRef}>
          <div className={styles.cardsInnerContainer} ref={innerContainerRef}>
            {duplicatedCampaigns.map((campaign, index) => {
              const key = `${campaign.id}-${index}`;
              const isPlaying = !!playingStates[key];
              return (
                <div
                  key={key}
                  className={styles.card}
                  aria-hidden={index >= campaigns.length ? true : undefined}
                >
                  <div className={styles.cardStage}>
                    <div
                      className={styles.cardBody}
                      onPointerMove={onTilt}
                      onPointerLeave={resetTilt}
                    >
                      <div className={styles.videoContainer}>
                        {(() => {
                          const candidates = posterCandidates(campaign);
                          const step = posterStep[campaign.id] || 0;
                          if (!postersReady) return null;
                          return step < candidates.length ? (
                            <img
                              className={styles.poster}
                              src={candidates[step]}
                              alt=""
                              aria-hidden="true"
                              decoding="async"
                              onError={() =>
                                setPosterStep((prev) =>
                                  (prev[campaign.id] || 0) === step
                                    ? { ...prev, [campaign.id]: step + 1 }
                                    : prev
                                )
                              }
                            />
                          ) : (
                            <div className={styles.posterFallback} aria-hidden="true">
                              <span>{campaign.brand}</span>
                            </div>
                          );
                        })()}
                        <video
                          ref={(el) => (videoRefs.current[key] = el)}
                          className={styles.video}
                          muted
                          loop
                          playsInline
                          preload="none"
                        >
                          <source src={videoSrcFor(campaign.videoUrl, isMobileVideo)} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>

                        <div className={styles.gradientOverlay}></div>
                        <div className={styles.glare} aria-hidden="true"></div>
                      </div>

                      <div className={styles.infoOverlay}>
                        <h3 className={styles.brandName}>{campaign.brand}</h3>
                        <div className={styles.statsContainer}>
                          <span className={styles.views}>
                            <strong>{campaign.views}</strong> Views
                          </span>
                          <span className={styles.roas}>
                            <strong>{campaign.roas}</strong> ROAS
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.playPauseButton}
                        tabIndex={index >= campaigns.length ? -1 : 0}
                        aria-label={`${isPlaying ? "Pause" : "Play"} ${campaign.brand} campaign video`}
                        aria-pressed={isPlaying}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVideoPlayback(key);
                        }}
                      >
                        {isPlaying ? (
                          <div className={styles.pauseIcon}>
                            <div className={styles.pauseBar}></div>
                            <div className={styles.pauseBar}></div>
                          </div>
                        ) : (
                          <div className={styles.playIcon}></div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating scroll CTA */}
        <div className={styles.floatingScrollCTA}>
          <button
            className={styles.scrollButton}
            onClick={() => scrollCarousel(-1)}
            aria-label="Scroll left"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            className={styles.scrollButton}
            onClick={() => scrollCarousel(1)}
            aria-label="Scroll right"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default BrandSuccessShowcase;
