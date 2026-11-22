import { useEffect } from "react";

// Pauses a section's looping CSS animations while it is off screen and resumes them before it
// scrolls back into view. Uses the Web Animations API on the section's own animations rather
// than an attribute + CSS selector: toggling an attribute that matches `[attr] *` made the
// browser recalculate the style of every element in the section (a long task on slow devices).
// No React state, so scrolling never re-renders. Sections still waiting for the hero
// (useDeferredStart, data-defer-idle) start before they come within this margin.
export default function usePauseOffscreen(ref, rootMargin = "200px 0px") {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined" || typeof el.getAnimations !== "function") return undefined;
    let paused = [];
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          paused.forEach((a) => {
            try { a.play(); } catch { /* animation removed */ }
          });
          paused = [];
        } else {
          paused = el.getAnimations({ subtree: true }).filter((a) => a.playState === "running");
          paused.forEach((a) => a.pause());
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      paused.forEach((a) => {
        try { a.play(); } catch { /* animation removed */ }
      });
    };
  }, [ref, rootMargin]);
}
