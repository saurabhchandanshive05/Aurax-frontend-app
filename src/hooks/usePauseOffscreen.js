import { useEffect } from "react";

// Pauses a section's looping CSS animations while it is off screen and resumes them before it
// scrolls back into view. Uses the Web Animations API on the section's own animations rather
// than an attribute + CSS selector: toggling an attribute that matches `[attr] *` made the
// browser recalculate the style of every element in the section (a long task on slow devices).
// No React state, so scrolling never re-renders. Sections still waiting for the hero
// (useDeferredStart, data-defer-idle) start before they come within this margin.
//
// Animations that START while the section is off screen are paused as they start. Sections that
// wait for the hero (data-defer-idle) or mount after the first paint begin their animations after
// the first "off screen" pass; without this they then ran off screen until the visitor scrolled
// past them, and every running animation adds to the browser's per-frame compositing work.
export default function usePauseOffscreen(ref, rootMargin = "200px 0px") {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined" || typeof el.getAnimations !== "function") return undefined;
    let paused = [];
    let offscreen = false;

    // A CSS animation began inside the section while it is off screen: pause it too
    const onStart = (e) => {
      if (!offscreen || !e.target || typeof e.target.getAnimations !== "function") return;
      e.target.getAnimations().forEach((a) => {
        if (a.playState === "running" && (!a.animationName || a.animationName === e.animationName)) {
          a.pause();
          paused.push(a);
        }
      });
    };
    el.addEventListener("animationstart", onStart, true);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          offscreen = false;
          paused.forEach((a) => {
            try { a.play(); } catch { /* animation removed */ }
          });
          paused = [];
        } else {
          offscreen = true;
          const running = el.getAnimations({ subtree: true }).filter((a) => a.playState === "running");
          running.forEach((a) => a.pause());
          paused = paused.concat(running);
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.removeEventListener("animationstart", onStart, true);
      paused.forEach((a) => {
        try { a.play(); } catch { /* animation removed */ }
      });
    };
  }, [ref, rootMargin]);
}
