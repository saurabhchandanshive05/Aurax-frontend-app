import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { debounce } from "lodash";
import styles from "./styles/FeaturedCreators.module.css";

const FeaturedCreators = () => {
  const { currentTheme } = useTheme();
  const [favorites, setFavorites] = useState(new Set());
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  // Use a large virtual index to enable seamless infinite looping
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isManualScroll, setIsManualScroll] = useState(false);
  const [visibleCards, setVisibleCards] = useState(new Set([0, 1, 2]));

  const carouselRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const profilePreviewTimeoutRef = useRef(null);
  const isScrolling = useRef(false);

  const influencers = [
    {
      id: 1,
      name: "AnitasDigitalDiaryy",
      location: "Jaipur",
      image:
        "https://res.cloudinary.com/dzvtsnpr6/image/upload/v1756719244/Aneeta_wzw8zb.webp",
      instagramUrl: "https://www.instagram.com/anitasdigitaldiaryy/",
      youtubeUrl: "",
      bio: "Fitness | Fashion",
      categories: ["Fitness", "Fashion"],
      followers: "50K",
      engagement: "5.3%",
      posts: "341",
    },
    {
      id: 2,
      name: "Ranveer Allahbadia",
      location: "Mumbai",
      image:
        "https://res.cloudinary.com/dzvtsnpr6/image/upload/v1756719759/ranveer-allahbadia_xkjimx.webp",
      instagramUrl: "https://www.instagram.com/ranveerallahbadia/",
      youtubeUrl: "",
      bio: "Exploring The Unexplored – Discovering darkness & its secrets",
      categories: ["Health & Fitness", "Entertainment"],
      followers: "4M–4.27M",
      engagement: "5.35%",
      posts: "2.4K",
    },
    {
      id: 3,
      name: "Payal Gaming",
      location: "Mumbai",
      image:
        "https://res.cloudinary.com/dzvtsnpr6/image/upload/v1756719600/Payal-gaming_jqejam.webp",
      instagramUrl: "https://www.instagram.com/payalgamingg/",
      youtubeUrl: "",
      bio: "Mobile Streamer of the Year – iQOO Brand Ambassador",
      categories: ["Gaming", "Streaming"],
      followers: "4M",
      engagement: "",
      posts: "567",
    },
    {
      id: 4,
      name: "Kusha Kapila",
      location: "Mumbai",
      image:
        "https://res.cloudinary.com/dzvtsnpr6/image/upload/v1756718802/kusha-kapila_hoigv7.webp",
      instagramUrl: "https://www.instagram.com/kushakapila/",
      youtubeUrl: "",
      bio: "Small and stupid repped by @foreverlost3_wanderer",
      categories: ["Comedy", "Entertainment"],
      followers: "4.3M",
      engagement: "4.36%",
      posts: "2.8K",
    },
    {
      id: 5,
      name: "Amya Aela",
      location: "Mumbai",
      image:
        "https://res.cloudinary.com/dzvtsnpr6/image/upload/v1756718598/Amy-aela_h4xrdd.webp",
      instagramUrl: "https://www.instagram.com/amyaela/",
      youtubeUrl: "",
      bio: "Co-Founder @pause.mumbai Podcast – Kindness & Clean Planet",
      categories: ["Lifestyle", "Social Impact"],
      followers: "2M",
      engagement: "1.11%",
      posts: "2.3K",
    },
    {
      id: 6,
      name: "Dhruv Rathee",
      location: "Delhi",
      image:
        "https://res.cloudinary.com/dzvtsnpr6/image/upload/v1756718756/dhruv-rathee_fjg5bn.webp",
      instagramUrl: "https://www.instagram.com/dhruvrathee/",
      youtubeUrl: "",
      bio: "YouTube Educator • Striving for a better world",
      categories: ["Education", "Social Commentary"],
      followers: "14.4–14.6M",
      engagement: "6.45%",
      posts: "826",
    },
    {
      id: 7,
      name: "Focused Indian",
      location: "Mumbai",
      image:
        "https://res.cloudinary.com/dzvtsnpr6/image/upload/v1756719619/Focused-Indian_l3e5vq.webp",
      instagramUrl: "https://www.instagram.com/focusedindian/",
      youtubeUrl: "",
      bio: "I make films on reels. I post daily vlogs on YouTube. Sports Lunatic. Verified.",
      categories: ["Comedy", "Vlogging", "Short-form Films"],
      followers: "2M",
      engagement: "",
      posts: "1.4K",
    },
    {
      id: 8,
      name: "Gaurav Taneja",
      location: "Delhi",
      image:
        "https://res.cloudinary.com/dzvtsnpr6/image/upload/v1756718771/Guarav-Tanej_xhvqt5.webp",
      instagramUrl: "https://www.instagram.com/taneja.gaurav/",
      youtubeUrl: "",
      bio: "Content Creator (Flying Beast)",
      categories: ["Lifestyle", "Travel", "Fitness"],
      followers: "3.56M",
      engagement: "",
      posts: "2.0K",
    },
  ];

  // Ensure baseCreators is properly combined
  const baseCreators = useMemo(() => [...influencers], []);
  const total = baseCreators.length;

  // Create extended array for infinite scroll
  const extendedCreators = useMemo(
    () => [...baseCreators, ...baseCreators, ...baseCreators],
    [baseCreators]
  );

  // Start from middle block
  useEffect(() => {
    setCurrentIndex(total);
    setVisibleCards(new Set([total - 1, total, total + 1]));
  }, [total]);

  // Update visible cards calculation
  useEffect(() => {
    const updateVisibleCards = () => {
      const newVisible = new Set();
      // Show 5 cards at a time (current + 2 on each side)
      for (let i = currentIndex - 2; i <= currentIndex + 2; i++) {
        if (i >= 0 && i < extendedCreators.length) {
          newVisible.add(i);
        }
      }
      setVisibleCards(newVisible);
    };
    updateVisibleCards();
  }, [currentIndex, extendedCreators.length]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isManualScroll) {
      const interval = setInterval(() => {
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev + 1);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isManualScroll]);

  const handleScroll = (direction) => {
    setIsManualScroll(true);

    setIsTransitioning(true);
    if (direction === "next") {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex((prev) => prev - 1);
    }

    // Resume auto-scroll after 10 seconds
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsManualScroll(false);
    }, 10000);
  };

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const handleCardPress = (creator) => {
    setSelectedCreator(creator);
    setShowProfilePreview(true);

    // Auto-close after 5 seconds
    if (profilePreviewTimeoutRef.current) {
      clearTimeout(profilePreviewTimeoutRef.current);
    }
    profilePreviewTimeoutRef.current = setTimeout(() => {
      setShowProfilePreview(false);
    }, 5000);
  };

  // Optimize card click handler
  const handleCardTap = (creator) => {
    if (isScrolling.current) return;

    const cardElement = document.querySelector(
      `[data-creator-id="${creator.id}"]`
    );
    if (!cardElement) return;

    requestAnimationFrame(() => {
      cardElement.style.transform = "scale(1.03)";
      setTimeout(() => {
        cardElement.style.transform = "scale(1)";
      }, 150);
    });
  };

  // Touch/swipe handling with improved tap detection
  const handleTouchStart = useRef({ x: 0, y: 0, time: 0 });
  const handleTouchEnd = useRef({ x: 0, y: 0, time: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [touchMoved, setTouchMoved] = useState(false);

  // Prevent body scroll when touching carousel
  useEffect(() => {
    const carousel = carouselRef.current;

    const preventBodyScroll = (e) => {
      if (
        Math.abs(e.touches[0].clientX - handleTouchStart.current.x) >
        Math.abs(e.touches[0].clientY - handleTouchStart.current.y)
      ) {
        e.preventDefault();
      }
    };

    carousel?.addEventListener("touchmove", preventBodyScroll, {
      passive: false,
    });
    return () => carousel?.removeEventListener("touchmove", preventBodyScroll);
  }, []);

  const onTouchStart = (e) => {
    if (isScrolling.current) return;

    setTouchMoved(false);
    setIsDragging(false);

    handleTouchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const onTouchMove = (e) => {
    if (!handleTouchStart.current.x) return;

    const deltaX = Math.abs(e.touches[0].clientX - handleTouchStart.current.x);
    const deltaY = Math.abs(e.touches[0].clientY - handleTouchStart.current.y);

    // If moved more than 5px, consider it movement
    if (deltaX > 5 || deltaY > 5) {
      setTouchMoved(true);

      // If horizontal movement is greater than vertical and > 15px, it's a horizontal swipe
      if (deltaX > deltaY && deltaX > 15) {
        setIsDragging(true);
        e.preventDefault(); // Prevent scrolling during horizontal swipe
      }
    }
  };

  const onTouchEnd = (e) => {
    if (isScrolling.current) return;

    handleTouchEnd.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now(),
    };

    const deltaX = handleTouchStart.current.x - handleTouchEnd.current.x;
    const deltaY = handleTouchStart.current.y - handleTouchEnd.current.y;
    const deltaTime =
      handleTouchEnd.current.time - handleTouchStart.current.time;

    // Only trigger swipe if it was a clear horizontal gesture
    if (
      isDragging &&
      Math.abs(deltaX) > 40 && // Reduced threshold for better responsiveness
      Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && // Horizontal movement must be 1.5x vertical
      deltaTime < 600 && // Increased time window
      Math.abs(deltaX / deltaTime) > 0.2 // Reduced minimum velocity
    ) {
      if (deltaX > 0) {
        handleScroll("next");
      } else {
        handleScroll("prev");
      }
    }

    // Reset states with a slight delay to prevent accidental clicks
    setTimeout(() => {
      setIsDragging(false);
      setTouchMoved(false);
    }, 150);
  };

  // Optimize scroll detection with debounce
  useEffect(() => {
    const handleScroll = debounce(() => {
      isScrolling.current = true;
      setTimeout(() => {
        isScrolling.current = false;
      }, 150);
    }, 16); // ~60fps

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      handleScroll.cancel();
    };
  }, []);

  // Determine item width in percentage for responsive layout
  const itemWidthPercent =
    typeof window !== "undefined" && window.innerWidth < 768 ? 90 : 33.333;

  // Handle seamless looping by snapping index back into the middle block
  const handleTransitionEnd = () => {
    if (currentIndex >= total * 2) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev - total);
      // re-enable transition on next tick
      requestAnimationFrame(() => setIsTransitioning(true));
    } else if (currentIndex < total) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev + total);
      requestAnimationFrame(() => setIsTransitioning(true));
    }
  };

  const renderCreatorImage = (creator, index) => {
    if (!visibleCards.has(index)) return null;

    return (
      <img
        src={creator.image}
        alt={creator.name}
        className={styles.creatorImage}
        loading={index <= currentIndex + 1 ? "eager" : "lazy"}
        decoding="async"
        style={{
          opacity: visibleCards.has(index) ? 1 : 0,
          transform: "translateZ(0)",
        }}
      />
    );
  };

  return (
    <section className={styles.featuredSection}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>Featured Creators</h2>
          <p className={styles.sectionSubtitle}>
            Discover top-performing creators across all niches
          </p>
        </div>

        {/* Main Carousel */}
        <div
          className={styles.carouselWrapper}
          style={{ touchAction: "pan-y pinch-zoom" }}
        >
          <div
            className={styles.carousel}
            ref={carouselRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className={styles.carouselTrack}
              style={{
                transform: `translate3d(-${
                  currentIndex * itemWidthPercent
                }%, 0, 0)`,
                transition: isTransitioning
                  ? "transform 0.5s cubic-bezier(0.2, 0, 0.2, 1)"
                  : "none",
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {extendedCreators.map((creator, index) => (
                <motion.div
                  key={`${creator.id}-${index}`}
                  className={styles.creatorCard}
                  data-creator-id={creator.id}
                  style={{
                    opacity: visibleCards.has(index) ? 1 : 0.3,
                    transform: "translateZ(0)",
                    width: `${itemWidthPercent}%`,
                  }}
                  onClick={(e) => {
                    // Prevent click if touch moved or is dragging
                    if (touchMoved || isDragging) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    // Only allow clicks if it's a clean tap
                    if (!isScrolling.current) {
                      handleCardPress(creator);
                    }
                  }}
                >
                  {/* Image Container */}
                  <div
                    className={styles.imageContainer}
                    onClick={(e) => {
                      // Prevent image clicks during swipe
                      if (touchMoved || isDragging) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  >
                    {visibleCards.has(index) && (
                      <img
                        src={creator.image}
                        alt={creator.name}
                        className={styles.creatorImage}
                        loading={index <= currentIndex + 1 ? "eager" : "lazy"}
                      />
                    )}

                    {/* Gradient Overlay */}
                    <div className={styles.gradientOverlay} />

                    {/* Favorite Button */}
                    <motion.button
                      className={`${styles.favoriteButton} ${
                        favorites.has(creator.id) ? styles.favorited : ""
                      }`}
                      onClick={(e) => toggleFavorite(creator.id, e)}
                      whileTap={{ scale: 1.2 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={favorites.has(creator.id) ? "#ff6b6b" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        animate={
                          favorites.has(creator.id)
                            ? { scale: [1, 1.2, 1] }
                            : { scale: 1 }
                        }
                        transition={{ duration: 0.3 }}
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </motion.svg>
                    </motion.button>

                    {/* Plus Button */}
                    <motion.button
                      className={styles.plusButton}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.1 }}
                      animate={{
                        rotate: [0, 0, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className={styles.cardContent}>
                    <div className={styles.nameLocation}>
                      <h3 className={styles.creatorName}>{creator.name}</h3>
                      <p className={styles.creatorLocation}>
                        {creator.location}
                      </p>
                    </div>

                    <div className={styles.stats}>
                      <div className={styles.stat}>
                        <span className={styles.statValue}>
                          {creator.followers}
                        </span>
                        <span className={styles.statLabel}>Followers</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statValue}>
                          {creator.engagement}
                        </span>
                        <span className={styles.statLabel}>Engagement</span>
                      </div>
                    </div>

                    <div className={styles.categories}>
                      {creator.categories.slice(0, 2).map((category, idx) => (
                        <span key={idx} className={styles.categoryTag}>
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            className={`${styles.navButton} ${styles.navPrev}`}
            onClick={() => handleScroll("prev")}
            aria-label="Previous creator"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            className={`${styles.navButton} ${styles.navNext}`}
            onClick={() => handleScroll("next")}
            aria-label="Next creator"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Indicators */}
        <div className={styles.indicators}>
          {influencers.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${
                index === currentIndex % influencers.length
                  ? styles.indicatorActive
                  : ""
              }`}
              onClick={() => {
                setIsManualScroll(true);
                setIsTransitioning(true);
                setCurrentIndex(index);

                // Resume auto-scroll after 10 seconds
                if (scrollTimeoutRef.current) {
                  clearTimeout(scrollTimeoutRef.current);
                }
                scrollTimeoutRef.current = setTimeout(() => {
                  setIsManualScroll(false);
                }, 10000);
              }}
              aria-label={`Go to creator ${index + 1}`}
            />
          ))}
        </div>

        {/* Explore Button */}
        <motion.button
          className={styles.exploreButton}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => (window.location.href = "/creators")}
        >
          <span>✨ Explore All Creators</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M12 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      </div>

      {/* Profile Preview Popup */}
      <AnimatePresence>
        {showProfilePreview && selectedCreator && (
          <motion.div
            className={styles.profilePreviewOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProfilePreview(false)}
          >
            <motion.div
              className={styles.profilePreviewCard}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.profileCloseButton}
                onClick={() => setShowProfilePreview(false)}
              >
                ×
              </button>

              <div className={styles.profilePreviewContent}>
                <img
                  src={selectedCreator.image}
                  alt={selectedCreator.name}
                  className={styles.profilePreviewImage}
                />
                <div className={styles.profilePreviewInfo}>
                  <h3>{selectedCreator.name}</h3>
                  <p>{selectedCreator.location}</p>
                  <p className={styles.profileBio}>{selectedCreator.bio}</p>

                  <div className={styles.profileStats}>
                    <div className={styles.profileStat}>
                      <span>{selectedCreator.followers}</span>
                      <span>Followers</span>
                    </div>
                    <div className={styles.profileStat}>
                      <span>{selectedCreator.engagement}</span>
                      <span>Engagement</span>
                    </div>
                    <div className={styles.profileStat}>
                      <span>{selectedCreator.posts}</span>
                      <span>Posts</span>
                    </div>
                  </div>

                  <div className={styles.profileActions}>
                    <button
                      className={styles.profileActionButton}
                      onClick={() =>
                        window.open(selectedCreator.instagramUrl, "_blank")
                      }
                    >
                      View Profile
                    </button>
                    <button className={styles.profileActionButtonSecondary}>
                      Collaborate
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FeaturedCreators;
