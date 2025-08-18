import React, { useEffect, useRef } from "react";
import styles from "./HeroSection.module.css";

const CustomCursor = () => {
  const cursorRef = useRef();
  useEffect(() => {
    let mouseX = window.innerWidth / 2,
      mouseY = window.innerHeight / 2;
    let x = mouseX,
      y = mouseY,
      raf;

    const move = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const update = () => {
      x += (mouseX - x) * 0.23;
      y += (mouseY - y) * 0.23;
      if (cursorRef.current)
        cursorRef.current.style.transform = `translate3d(${x - 23}px,${
          y - 23
        }px,0)`;
      raf = requestAnimationFrame(update);
    };
    document.addEventListener("mousemove", move);
    raf = requestAnimationFrame(update);

    // Pulse (scale) cursor on hover over all buttons, links, .ctaButton
    const grow = () =>
      cursorRef.current && cursorRef.current.classList.add(styles.cursorGrow);
    const shrink = () =>
      cursorRef.current &&
      cursorRef.current.classList.remove(styles.cursorGrow);
    document.querySelectorAll("button, a, .ctaButton").forEach((el) => {
      el.addEventListener("mouseenter", grow);
      el.addEventListener("mouseleave", shrink);
    });
    return () => {
      document.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
      document.querySelectorAll("button, a, .ctaButton").forEach((el) => {
        el.removeEventListener("mouseenter", grow);
        el.removeEventListener("mouseleave", shrink);
      });
    };
  }, []);

  return <div ref={cursorRef} className={styles.cursor} />;
};

export default CustomCursor;
