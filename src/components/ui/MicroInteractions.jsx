import React, { useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

// Floating Action Button with ripple effect
export const FloatingActionButton = ({
  icon,
  onClick,
  position = "bottom-right",
  tooltip = "",
  color = "primary",
}) => {
  const { currentTheme } = useTheme();
  const [isRippling, setIsRippling] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const getPositionClasses = () => {
    const positions = {
      "bottom-right": "bottom-6 right-6",
      "bottom-left": "bottom-6 left-6",
      "top-right": "top-6 right-6",
      "top-left": "top-6 left-6",
    };
    return positions[position];
  };

  const handleClick = (e) => {
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 600);
    onClick?.(e);
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-40`}>
      <motion.div
        className="relative"
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
      >
        <motion.button
          className={`w-14 h-14 rounded-full shadow-lg backdrop-blur-sm border border-white/20 flex items-center justify-center text-white relative overflow-hidden ${
            color === "primary"
              ? "bg-gradient-to-r from-blue-500 to-purple-600"
              : color === "success"
              ? "bg-gradient-to-r from-green-500 to-emerald-600"
              : "bg-gradient-to-r from-gray-500 to-gray-600"
          }`}
          onClick={handleClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {icon}

          {/* Ripple effect */}
          {isRippling && (
            <motion.div
              className="absolute inset-0 bg-white/30 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </motion.button>

        {/* Tooltip */}
        {tooltip && showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-full mb-2 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
          >
            {tooltip}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

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
