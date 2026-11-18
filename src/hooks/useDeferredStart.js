import { useEffect, useState } from "react";
import { isHeroReady, onHeroReady } from "../utils/heroReady";

// True once a below-the-fold section may start its expensive work: when the homepage hero is
// ready, or earlier if the section comes within `rootMargin` of the viewport (a visitor who
// scrolls straight down never waits). Stays true once set.
// After the hero is ready each section starts in the browser's idle time (within 1.5s), so the
// sections spread their start-up over a few frames instead of all starting in the same one.
export default function useDeferredStart(ref, rootMargin = "400px 0px") {
  const [started, setStarted] = useState(isHeroReady);

  useEffect(() => {
    if (started) return undefined;
    const start = () => setStarted(true);
    let idleId = null;
    let timer = null;
    const offReady = onHeroReady(() => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(start, { timeout: 1500 });
      } else {
        timer = window.setTimeout(start, 50);
      }
    });
    let io;
    const el = ref.current;
    if (el && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) start();
        },
        { rootMargin }
      );
      io.observe(el);
    }
    return () => {
      offReady();
      io?.disconnect();
      if (idleId !== null) window.cancelIdleCallback?.(idleId);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [started, ref, rootMargin]);

  return started;
}
