import React, { useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import fab from "./MicroInteractions.module.css";

// Floating action button (homepage "contact the team" shortcut). Styled with AURAX tokens in
// MicroInteractions.module.css (it used Tailwind classes, which this project doesn't load, so it
// rendered unstyled). The label shows on hover and keyboard focus.
export const FloatingActionButton = ({
  icon,
  onClick,
  position = "bottom-right",
  tooltip = "",
}) => (
  <div className={`${fab.wrap} ${fab[position] || fab["bottom-right"]}`}>
    <button type="button" className={fab.button} onClick={onClick} aria-label={tooltip || undefined}>
      <span className={fab.icon} aria-hidden="true">
        {icon}
      </span>
    </button>
    {tooltip && (
      <span className={fab.tooltip} aria-hidden="true">
        {tooltip}
      </span>
    )}
  </div>
);

// Magnetic button effect
export const MagneticButton = ({ children, className = "", ...props }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      className={`relative ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Pulse animation for notifications
export const PulseIndicator = ({
  color = "red",
  size = "small",
  intensity = "medium",
}) => {
  const sizeClasses = {
    small: "w-2 h-2",
    medium: "w-3 h-3",
    large: "w-4 h-4",
  };

  const colorClasses = {
    red: "bg-red-500",
    green: "bg-green-500",
    blue: "bg-blue-500",
    yellow: "bg-yellow-500",
  };

  return (
    <div className="relative">
      <motion.div
        className={`rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
        animate={{
          scale: intensity === "high" ? [1, 1.3, 1] : [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: intensity === "high" ? 1 : 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={`absolute inset-0 rounded-full ${colorClasses[color]} opacity-30`}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: intensity === "high" ? 1 : 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

// Hover reveal card
export const HoverRevealCard = ({
  children,
  revealContent,
  className = "",
  direction = "up",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    hidden: {
      y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
      x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
      opacity: 0,
    },
    visible: {
      y: 0,
      x: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div
      className={`relative ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {children}

      <motion.div
        className="absolute inset-0 glass-card flex items-center justify-center"
        variants={variants}
        initial="hidden"
        animate={isHovered ? "visible" : "hidden"}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ pointerEvents: isHovered ? "auto" : "none" }}
      >
        {revealContent}
      </motion.div>
    </motion.div>
  );
};

// Loading dots animation
export const LoadingDots = ({ size = "medium", color = "white" }) => {
  const sizeClasses = {
    small: "w-1 h-1",
    medium: "w-2 h-2",
    large: "w-3 h-3",
  };

  const colorClasses = {
    white: "bg-white",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default {
  FloatingActionButton,
  MagneticButton,
  PulseIndicator,
  HoverRevealCard,
  LoadingDots,
};
