import React from "react";
import styles from "./AuraLogo.module.css";

const AuraLogo = ({
  isMenuOpen = false,
  size = "medium",
  className = "",
  showText = true,
  animated = true,
  showVortex = true,
  onClick = null,
  "aria-label": ariaLabel = "AURA AI Logo",
}) => {
  return (
    <div
      className={`${styles.logoWrapper} ${styles[size]} ${className} ${
        isMenuOpen ? styles.outro : ""
      }`}
      onClick={onClick}
      role={onClick ? "button" : "img"}
      aria-label={ariaLabel}
      tabIndex={onClick ? 0 : -1}
    >
      {/* Main Logo Container */}
      <div className={styles.logoContainer}>
        {/* Grid Background */}
        <div className={styles.gridBackground} aria-hidden="true" />

        {/* AURAX Brand Text */}
        <div className={styles.logoMark} aria-hidden="true">
          <div className={styles.brandName}>AURAX</div>
        </div>

        {/* Minimal Accent Elements */}
        {showVortex && (
          <div className={styles.accentContainer} aria-hidden="true">
            {/* Subtle accent dots */}
            <div className={styles.accentDots}>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={styles.accentDot}
                  style={{ "--dot-index": i }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Logo Text */}
      {showText && (
        <div className={styles.logoText}>
          <span className={styles.brandText}>AURAX</span>
        </div>
      )}
    </div>
  );
};

export default AuraLogo;
