import React, { useEffect, useRef } from "react";
import styles from "./styles/Hero.module.css";

const CursorEffect = () => {
  const cursorRef = useRef();

  useEffect(() => {
    const move = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 15}px, ${
          e.clientY - 15
        }px)`;
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Hide cursor on mobile/touch devices
  useEffect(() => {
    const handleTouch = () => {
      if (cursorRef.current) cursorRef.current.style.display = "none";
    };
    window.addEventListener("touchstart", handleTouch);
    return () => window.removeEventListener("touchstart", handleTouch);
  }, []);

  return <div ref={cursorRef} className={styles.cursor} />;
};

export default CursorEffect;
