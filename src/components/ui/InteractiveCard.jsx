import React, { useState, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useDragControls,
} from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/design-system.css";

const InteractiveCard = ({
  children,
  className = "",
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  dragEnabled = true,
  hoverEffects = true,
  glowIntensity = "medium",
  cardType = "glass", // glass, neu, neon
  ...props
}) => {
  const { currentTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const { offset, velocity } = info;

    // Swipe detection thresholds
    const swipeThreshold = 100;
    const velocityThreshold = 500;

    if (
      Math.abs(offset.x) > swipeThreshold ||
      Math.abs(velocity.x) > velocityThreshold
    ) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    if (
      Math.abs(offset.y) > swipeThreshold ||
      Math.abs(velocity.y) > velocityThreshold
    ) {
      if (offset.y > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (offset.y < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    // Reset position
    x.set(0);
    y.set(0);
  };

  const getCardClasses = () => {
    const baseClasses = "relative overflow-hidden transition-all duration-300";
    const typeClasses = {
      glass: "glass-card",
      neu: "neu-card",
      neon: "neon-glow-card",
    };

    const glowClasses = {
      low: "glow-sm",
      medium: "glow-md",
      high: "glow-lg",
      intense: "glow-xl",
    };

    return `${baseClasses} ${typeClasses[cardType]} ${glowClasses[glowIntensity]} ${className}`;
  };

  const cardVariants = {
    initial: {
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      z: 0,
    },
    hover: hoverEffects
      ? {
          scale: 1.02,
          rotateX: rotateX,
          rotateY: rotateY,
          z: 50,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
          },
        }
      : {},
    drag: {
      scale: 1.05,
      rotateZ: x.get() * 0.1,
      transition: {
        type: "spring",
        stiffness: 600,
        damping: 30,
      },
    },
  };

  const glowVariants = {
    initial: { opacity: 0 },
    hover: {
      opacity: isHovered ? 1 : 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      className={getCardClasses()}
      variants={cardVariants}
      initial="initial"
      animate={isDragging ? "drag" : isHovered ? "hover" : "initial"}
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      drag={dragEnabled}
      dragControls={dragControls}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      style={{
        x,
        y,
        rotateX: hoverEffects ? rotateX : 0,
        rotateY: hoverEffects ? rotateY : 0,
      }}
      {...props}
    >
      {/* Dynamic glow effect */}
      {hoverEffects && (
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${currentTheme.accent}40 0%, transparent 70%)`,
            filter: "blur(20px)",
          }}
          variants={glowVariants}
          animate="hover"
        />
      )}

      {/* Shine effect on hover */}
      {hoverEffects && (
        <motion.div
          className="absolute inset-0 opacity-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
          }}
          animate={{
            opacity: isHovered ? [0, 1, 0] : 0,
            x: isHovered ? [-100, 100] : -100,
            transition: {
              duration: 0.6,
              ease: "easeInOut",
            },
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Drag indicator */}
      {dragEnabled && isDragging && (
        <motion.div
          className="absolute top-2 right-2 text-xs opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
};

export default InteractiveCard;

