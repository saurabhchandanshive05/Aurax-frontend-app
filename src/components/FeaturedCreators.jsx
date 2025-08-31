import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useTheme } from "../context/ThemeContext";
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

  const influencers = [
    {
      id: 1,
      name: "Ahsaas Channa",
      location: "Mumbai, India",
      image: "/images/sutej-pannu.png",
      instagramUrl: "https://instagram.com/sutejpannu",
      youtubeUrl: "https://youtube.com/sutejpannu",
      bio: "Fashion influencer with 1.2M followers. Known for luxury brand collaborations and style transformations.",
      categories: ["Fashion", "Lifestyle", "Travel"],
      followers: "1.2M",
      engagement: "8.5%",
      posts: "2.1K",
    },
    {
      id: 2,
      name: "Aashi Sahni",
      location: "Delhi, India",
      image: "/images/priyam-saraswat.png",
      instagramUrl: "https://instagram.com/priyamsaraswat",
      youtubeUrl: "https://youtube.com/priyamsaraswat",
      bio: "Tech reviewer and gadget enthusiast. Specializes in smartphone reviews and tech tutorials.",
      categories: ["Tech", "Gadgets", "Reviews"],
      followers: "890K",
      engagement: "12.3%",
      posts: "1.8K",
    },
    {
      id: 3,
      name: "anitasdigitaldiaryy",
      location: "Mumbai, India",
      image: "/images/mumbiker-nikhil.png",
      instagramUrl: "https://instagram.com/mumbikernikhil",
      youtubeUrl: "https://youtube.com/mumbikernikhil",
      bio: "Bike enthusiast and travel vlogger. Creates adventure content and motorcycle reviews.",
      categories: ["Travel", "Adventure", "Automotive"],
      followers: "2.1M",
      engagement: "6.8%",
      posts: "3.2K",
    },
    {
      id: 4,
      name: "Amee Alee",
      location: "Punjab, India",
      image: "/images/harsh-likhari.png",
      instagramUrl: "https://instagram.com/harshlikhari",
      youtubeUrl: "https://youtube.com/harshlikhari",
      bio: "Comedian and content creator known for relatable skits and funny commentary on daily life.",
      categories: ["Comedy", "Entertainment", "Social"],
      followers: "1.5M",
      engagement: "11.2%",
      posts: "2.7K",
    },
    {
      id: 5,
      name: "Ranveer Allahbadia",
      location: "Mumbai, India",
      image: "/images/ranveer-allahbadia.png",
      instagramUrl: "https://instagram.com/ranveerallahbadia",
      youtubeUrl: "https://youtube.com/ranveerallahbadia",
      bio: "Fitness expert and motivational speaker. Focuses on health, wellness, and personal development.",
      categories: ["Fitness", "Health", "Motivation"],
      followers: "3.2M",
      engagement: "9.1%",
      posts: "4.1K",
    },
    {
      id: 6,
      name: "Gaurav Taneja",
      location: "Delhi, India",
      image: "/images/dolly-singh.png",
      instagramUrl: "https://instagram.com/dollysingh",
      youtubeUrl: "https://youtube.com/dollysingh",
      bio: "Actress and content creator known for character sketches and relatable comedy content.",
      categories: ["Comedy", "Acting", "Entertainment"],
      followers: "2.8M",
      engagement: "7.6%",
      posts: "1.9K",
    },
  ];

  // Duplicate some creators to increase variety without requiring new assets
  // ...existing code...
  // Duplicate some creators to increase variety without requiring new assets
  const extraInfluencers = [
    {
      id: 106,
      name: "Bhuvan Bam",
      location: "Delhi, India",
      image: "/images/bhuvan-bam.png",
      instagramUrl: "https://instagram.com/bhuvan.bam22",
      youtubeUrl: "https://youtube.com/bbkvines",
      bio: "Comedian, singer, and YouTube sensation known for BB Ki Vines.",
      categories: ["Comedy", "Music", "Entertainment"],
      followers: "16M",
      engagement: "10.2%",
      posts: "1.5K",
    },
    {
      id: 102,
      name: "Dhruv Rathee",
      location: "Germany / India",
      image: "/images/dhruv-rathee.png",
      instagramUrl: "https://instagram.com/dhruvrathee",
      youtubeUrl: "https://youtube.com/dhruvrathee",
      bio: "Popular educator and social commentator creating informative videos.",
      categories: ["Education", "Politics", "Social"],
      followers: "2.2M",
      engagement: "8.7%",
      posts: "900",
    },
    {
      id: 103,
      name: "Kusha Kapila",
      location: "Delhi, India",
      image: "/images/kusha-kapila.png",
      instagramUrl: "https://instagram.com/kushakapila",
      youtubeUrl: "https://youtube.com/kushakapila",
      bio: "Actor, comedian, and digital creator known for her witty sketches.",
      categories: ["Comedy", "Acting", "Fashion"],
      followers: "3.5M",
      engagement: "9.8%",
      posts: "2.3K",
    },
    {
      id: 104,
      name: "Jannat Zubair",
      location: "Mumbai, India",
      image: "/images/jannat-zubair.png",
      instagramUrl: "https://instagram.com/jannatzubair29",
      youtubeUrl: "https://youtube.com/jannatzubair",
      bio: "Actress and social media star popular for her music and lifestyle content.",
      categories: ["Acting", "Music", "Lifestyle"],
      followers: "45M",
      engagement: "7.5%",
      posts: "3.8K",
    },
  ];
  // ...existing code...
  const baseCreators = [...influencers, ...extraInfluencers];
  const total = baseCreators.length;
  const extendedCreators = [...baseCreators, ...baseCreators, ...baseCreators];

  // Start from the middle block to allow backward/forward instant wrap
  useEffect(() => {
    setCurrentIndex(total); // center block start
  }, [total]);

  // Lazy loading implementation
  useEffect(() => {
    const updateVisibleCards = () => {
      const newVisible = new Set();
      for (let i = currentIndex - 2; i <= currentIndex + 2; i++) {
        if (i >= 0 && i < extendedCreators.length) newVisible.add(i);
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

  const handleCardTap = (creator) => {
    // Quick scale animation
    const cardElement = document.querySelector(
      `[data-creator-id="${creator.id}"]`
    );
    if (cardElement) {
      cardElement.style.transform = "scale(1.03)";
      setTimeout(() => {
        cardElement.style.transform = "scale(1)";
      }, 150);
    }
  };

  // Touch/swipe handling
  const handleTouchStart = useRef({ x: 0, time: 0 });
  const handleTouchEnd = useRef({ x: 0, time: 0 });

  const onTouchStart = (e) => {
    handleTouchStart.current = {
      x: e.touches[0].clientX,
      time: Date.now(),
    };
  };

  const onTouchEnd = (e) => {
    handleTouchEnd.current = {
      x: e.changedTouches[0].clientX,
      time: Date.now(),
    };

    const deltaX = handleTouchStart.current.x - handleTouchEnd.current.x;
    const deltaTime =
      handleTouchEnd.current.time - handleTouchStart.current.time;

    // Swipe detection (minimum 50px distance, maximum 500ms duration)
    if (Math.abs(deltaX) > 50 && deltaTime < 500) {
      if (deltaX > 0) {
        handleScroll("next");
      } else {
        handleScroll("prev");
      }
    }
  };

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
        <div className={styles.carouselWrapper}>
          <div
            className={styles.carousel}
            ref={carouselRef}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div
              className={styles.carouselTrack}
              style={{
                transform: `translateX(-${currentIndex * itemWidthPercent}%)`,
                transition: isTransitioning
                  ? "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                  : "none",
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {extendedCreators.map((creator, index) => (
                <motion.div
                  key={creator.id}
                  className={`${styles.creatorCard} ${
                    index === currentIndex ? styles.active : ""
                  }`}
                  data-creator-id={creator.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: visibleCards.has(index) ? 1 : 0.3,
                    y: 0,
                    scale: index === currentIndex ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleCardTap(creator)}
                  onMouseDown={() => handleCardPress(creator)}
                  onTouchStart={() => handleCardPress(creator)}
                  whileTap={{ scale: 1.03 }}
                  whileHover={{ y: -8 }}
                >
                  {/* Image Container */}
                  <div className={styles.imageContainer}>
                    {visibleCards.has(index) && (
                      <img
                        src={creator.image}
                        alt={creator.name}
                        className={styles.creatorImage}
                        loading={visibleCards.has(index) ? "eager" : "lazy"}
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
                index === currentIndex ? styles.indicatorActive : ""
              }`}
              onClick={() => {
                setCurrentIndex(index);
                setIsManualScroll(true);
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
