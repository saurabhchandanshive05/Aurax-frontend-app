import { useEffect, useRef } from "react";

const useRippleEffect = (rippleRef, containerRef) => {
  useEffect(() => {
    const ripple = rippleRef.current;
    const container = containerRef.current;

    if (!ripple || !container) return;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      ripple.style.left = `${mouseX}px`;
      ripple.style.top = `${mouseY}px`;
    };

    const handleMouseDown = () => {
      ripple.style.transform = "translate(-50%, -50%) scale(2)";
      ripple.style.opacity = "0.4";

      setTimeout(() => {
        ripple.style.transform = "translate(-50%, -50%) scale(1)";
        ripple.style.opacity = "0.2";
      }, 300);
    };

    const handleMouseUp = () => {
      ripple.style.opacity = "0.1";
    };

    const handleMouseEnter = (e) => {
      ripple.style.opacity = "0.2";
    };

    const handleMouseLeave = () => {
      ripple.style.opacity = "0";
    };

    // Add touch event handlers for mobile
    const handleTouchMove = (e) => {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;

      ripple.style.left = `${mouseX}px`;
      ripple.style.top = `${mouseY}px`;
    };

    const handleTouchStart = () => {
      ripple.style.transform = "translate(-50%, -50%) scale(2)";
      ripple.style.opacity = "0.4";

      setTimeout(() => {
        ripple.style.transform = "translate(-50%, -50%) scale(1)";
        ripple.style.opacity = "0.2";
      }, 300);
    };

    const handleTouchEnd = () => {
      ripple.style.opacity = "0.1";
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Add touch events
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);

      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [rippleRef, containerRef]);
};

export default useRippleEffect;
