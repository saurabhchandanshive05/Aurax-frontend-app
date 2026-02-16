import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./BrandSuccessShowcase/BrandSuccessShowcase.module.css";

const BrandSuccessShowcase = () => {
  const containerRef = useRef(null);
  const innerContainerRef = useRef(null);
  const videoRefs = useRef({});
  const [autoScroll, setAutoScroll] = useState(true);
  const [playingStates, setPlayingStates] = useState({});

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

  // Initialize animation
  useEffect(() => {
    if (!containerRef.current || !innerContainerRef.current) return;

    // Calculate total width of duplicated content
    const container = containerRef.current;
    const innerContainer = innerContainerRef.current;
    const containerWidth = container.offsetWidth;
    const innerWidth = innerContainer.scrollWidth / 2; // Since we duplicated twice

    // Set initial position to the start of the duplicated content
    container.scrollLeft = innerWidth;

    let animationFrame;
    let scrollPos = innerWidth;
    const scrollSpeed = 1.5; // Pixels per frame

    const animate = () => {
      if (autoScroll) {
        scrollPos -= scrollSpeed;

        // Reset to beginning when reaching duplicated section end
        if (scrollPos <= 0) {
          scrollPos = innerWidth;
        }

        container.scrollLeft = scrollPos;
      }
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [autoScroll]);

  // Manual scroll navigation
  const scrollCarousel = (direction) => {
    if (!containerRef.current) return;
    setAutoScroll(false);

    const container = containerRef.current;
    const firstCard = container.querySelector(`.${styles.card}`);
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const gap = 25; // From CSS
    const scrollAmount = (cardWidth + gap) * direction;

    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });

    // Resume auto-scroll after 3 seconds
    setTimeout(() => setAutoScroll(true), 3000);
  };

  return (
    <section className={styles.showcaseSection}>
      <div className={styles.header}>
        <motion.h2
          className={styles.sectionTitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Real Creators. Real Influence.
        </motion.h2>
        <motion.p
          className={styles.sectionSubtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Showcase of high-performing influencer videos curated by campaigns
        </motion.p>
      </div>

      <div
        className={styles.carouselWrapper}
        onMouseEnter={() => setAutoScroll(false)}
        onMouseLeave={() => setAutoScroll(true)}
      >
        <div className={styles.cardsContainer} ref={containerRef}>
          <div className={styles.cardsInnerContainer} ref={innerContainerRef}>
            {duplicatedCampaigns.map((campaign, index) => (
              <motion.div
                key={`${campaign.id}-${index}`}
                className={styles.card}
                whileHover={{
                  scale: 1.05,
                  zIndex: 10,
                  boxShadow: "0 10px 30px rgba(255, 255, 255, 0.2)",
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className={styles.videoContainer}>
                  <video
                    ref={(el) =>
                      (videoRefs.current[`${campaign.id}-${index}`] = el)
                    }
                    className={styles.video}
                    muted
                    loop
                    autoPlay
                    playsInline
                    poster={campaign.thumbnail}
                  >
                    <source src={campaign.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  <div className={styles.gradientOverlay}></div>

                  <div className={styles.infoOverlay}>
                    <h3 className={styles.brandName}>{campaign.brand}</h3>
                    <div className={styles.statsContainer}>
                      <span className={styles.views}>
                        {campaign.views} Views
                      </span>
                      <span className={styles.roas}>{campaign.roas} ROAS</span>
                    </div>
                  </div>

                  <div
                    className={styles.playPauseButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVideoPlayback(`${campaign.id}-${index}`);
                    }}
                  >
                    {playingStates[`${campaign.id}-${index}`] ? (
                      <div className={styles.pauseIcon}>
                        <div className={styles.pauseBar}></div>
                        <div className={styles.pauseBar}></div>
                      </div>
                    ) : (
                      <div className={styles.playIcon}></div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating scroll CTA */}
        <div className={styles.floatingScrollCTA}>
          <button
            className={styles.scrollButton}
            onClick={() => scrollCarousel(-1)}
            aria-label="Scroll left"
          >
            &lt;
          </button>
          <button
            className={styles.scrollButton}
            onClick={() => scrollCarousel(1)}
            aria-label="Scroll right"
          >
            &gt;
          </button>
        </div>
      </div>
    </section>
  );
};

export default BrandSuccessShowcase;
