import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import styles from "./styles/Hero.module.css";
import HeroScene from "./HeroScene";

const Hero = () => {
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);
  const buttonRef = useRef(null);
  const cursorRef = useRef(null);
  const voiceTextRef = useRef(null);

  // Animation on mount
  useEffect(() => {
    gsap.fromTo(
      subheadingRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
    );

    gsap.fromTo(
      headingRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.4 }
    );

    gsap.fromTo(
      buttonRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.6 }
    );

    // Animate "Voice" underline
    const underline = voiceTextRef.current.querySelector(
      `.${styles.voiceUnderline}`
    );
    gsap.to(underline, {
      scaleX: 1,
      duration: 1.5,
      ease: "power3.out",
      scrollTrigger: {
        trigger: headingRef.current,
        start: "top 80%",
      },
    });
  }, []);

  // Custom cursor effect
  useEffect(() => {
    const onMouseMove = (e) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    };

    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h6 ref={subheadingRef} className={styles.subheading}>
          WE AT TELIVUS MEDIA
        </h6>
        <h1 ref={headingRef} className={styles.heading}>
          Provide{" "}
          <span ref={voiceTextRef} className={styles.voiceText}>
            Voice
            <span className={styles.voiceUnderline}></span>
          </span>{" "}
          To Your Brand
        </h1>
        <button ref={buttonRef} className={styles.ctaButton}>
          Check out Our Services <span className={styles.arrow}>→</span>
        </button>
      </div>

      <div className={styles.canvasContainer}>
        <HeroScene />
      </div>

      <div ref={cursorRef} className={styles.cursor}></div>
    </section>
  );
};

export default Hero;
