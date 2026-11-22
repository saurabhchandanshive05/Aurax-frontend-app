import { useEffect, useRef } from "react";
import styles from "./styles/CursorSpotlight.module.css";

// Cursor light: three soft layers (bright cyan core, violet glow, slower violet-cyan trail) that
// follow the pointer at different speeds, so movement leaves a short liquid trail that flows back
// into the core when it rests. Mouse/pen: follows the cursor at every screen width. Touch: shows
// under the finger while touching or swiping and fades out on release. Off with
// prefers-reduced-motion. One animation loop moves the layers with transforms (no layout, no
// React re-renders) and stops once everything has settled.
const QUERY = "(prefers-reduced-motion: no-preference)";

// Share of the remaining distance each layer covers per frame (60fps): the core stays on the
// cursor, the glow and the trail lag behind it a little more each.
const LAYERS = [
  { key: "trail", ease: 0.09 },
  { key: "glow", ease: 0.17 },
  { key: "core", ease: 0.34 },
];

const CursorSpotlight = () => {
  const refs = useRef({});

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const mq = window.matchMedia(QUERY);
    let stop = () => {};

    const start = () => {
      const layers = LAYERS.map((l) => ({ ...l, el: refs.current[l.key], x: 0, y: 0 })).filter((l) => l.el);
      if (layers.length !== LAYERS.length) return () => {};
      layers.forEach((l) => (l.half = l.el.offsetWidth / 2));
      const [trail, glow, core] = layers;
      let tx = 0, ty = 0, px = 0, py = 0;
      let vis = 0, visTarget = 0; // fade in/out (0..1)
      let energy = 0; // recent pointer speed (0..1): brightens and stretches the trail
      let raf = 0, last = 0, placed = false;

      const frame = (now) => {
        // Frame-rate independent easing (the factors above are per 60fps frame)
        const dt = last ? Math.min((now - last) / 16.67, 4) : 1;
        last = now;
        const k = (e) => 1 - Math.pow(1 - e, dt);

        const moved = Math.hypot(tx - px, ty - py);
        px = tx; py = ty;
        energy = Math.max(energy * Math.pow(0.9, dt), Math.min(1, moved / 28));
        vis += (visTarget - vis) * k(0.12);
        if (visTarget === 0 && vis < 0.01) {
          // Faded out: stop here; on return the light reappears at the cursor (no glide in)
          vis = 0; energy = 0; placed = false;
          layers.forEach((l) => (l.el.style.opacity = "0"));
          raf = 0; last = 0;
          return;
        }

        // Fade/energy below 1% is invisible: finish there instead of easing on for many frames
        let busy = Math.abs(visTarget - vis) > 0.01 || energy > 0.01;
        for (const l of layers) {
          l.x += (tx - l.x) * k(l.ease);
          l.y += (ty - l.y) * k(l.ease);
          if (Math.abs(tx - l.x) > 0.1 || Math.abs(ty - l.y) > 0.1) busy = true;
          else { l.x = tx; l.y = ty; }
        }
        // Last frame: land exactly on the final values before writing them
        if (!busy) { energy = 0; vis = visTarget; }

        core.el.style.transform = `translate3d(${core.x - core.half}px, ${core.y - core.half}px, 0)`;
        glow.el.style.transform = `translate3d(${glow.x - glow.half}px, ${glow.y - glow.half}px, 0)`;
        // The trail stretches along the way it is being pulled, like a drop of light
        const lx = tx - trail.x, ly = ty - trail.y, lag = Math.hypot(lx, ly);
        const s = 1 + Math.min(lag / 240, 0.6);
        trail.el.style.transform =
          `translate3d(${trail.x - trail.half}px, ${trail.y - trail.half}px, 0) ` +
          `rotate(${lag > 0.5 ? Math.atan2(ly, lx) : 0}rad) scale(${s}, ${1 / Math.sqrt(s)})`;

        core.el.style.opacity = vis.toFixed(3);
        glow.el.style.opacity = (vis * (0.75 + 0.25 * energy)).toFixed(3);
        trail.el.style.opacity = (vis * (0.45 + 0.55 * energy)).toFixed(3);

        raf = busy ? requestAnimationFrame(frame) : 0;
        if (!raf) last = 0;
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

      const moveTo = (x, y) => {
        tx = x;
        ty = y;
        if (!placed) {
          // First move (or first touch): start at the pointer, no glide in from elsewhere
          layers.forEach((l) => { l.x = tx; l.y = ty; });
          px = tx; py = ty;
          placed = true;
        }
        visTarget = 1;
        kick();
      };
      const hide = () => { visTarget = 0; kick(); };

      // Mouse and pen: follow the cursor (touch is handled below)
      const onMove = (e) => { if (e.pointerType !== "touch") moveTo(e.clientX, e.clientY); };
      const onOut = (e) => { if (e.pointerType !== "touch" && !e.relatedTarget) hide(); }; // left the window

      // Touch: light under the finger while it is down, fading out on release. Touch events,
      // not pointer events, because the browser cancels pointer events once a swipe starts
      // scrolling, while touchmove keeps firing. All passive: taps and scrolling are untouched.
      const onTouch = (e) => {
        const t = e.touches[0];
        if (t) moveTo(t.clientX, t.clientY);
      };
      const onTouchEnd = (e) => {
        if (e.touches.length) return;
        placed = false; // the next touch starts where that finger lands
        hide();
      };

      const passive = { passive: true };
      window.addEventListener("pointermove", onMove, passive);
      document.addEventListener("pointerout", onOut);
      window.addEventListener("touchstart", onTouch, passive);
      window.addEventListener("touchmove", onTouch, passive);
      window.addEventListener("touchend", onTouchEnd, passive);
      window.addEventListener("touchcancel", onTouchEnd, passive);
      window.addEventListener("blur", hide);
      return () => {
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerout", onOut);
        window.removeEventListener("touchstart", onTouch);
        window.removeEventListener("touchmove", onTouch);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("touchcancel", onTouchEnd);
        window.removeEventListener("blur", hide);
        cancelAnimationFrame(raf);
        layers.forEach((l) => (l.el.style.opacity = "0"));
      };
    };

    const sync = () => {
      stop();
      stop = mq.matches ? start() : () => {};
    };
    sync();
    mq.addEventListener?.("change", sync);
    return () => {
      mq.removeEventListener?.("change", sync);
      stop();
    };
  }, []);

  // Separate siblings, not wrapped: a wrapper would form its own stacking context and the
  // "screen" blend would no longer reach the page underneath
  return LAYERS.map(({ key }) => (
    <div
      key={key}
      ref={(el) => (refs.current[key] = el)}
      className={`${styles.layer} ${styles[key]}`}
      aria-hidden="true"
    />
  ));
};

export default CursorSpotlight;
