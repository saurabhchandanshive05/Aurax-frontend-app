import React, { useEffect, useLayoutEffect, useRef } from "react";
import { CONTENT } from "./HeroCards";
import styles from "./styles/HeroOrbitMobile.module.css";

/*
 * Phone and tablet hero visual (under 1024px; desktop keeps the three.js orbit in HeroScene).
 *
 * A compact elliptical orbit sits in the page flow between the hero copy and the buttons, so
 * it can never cover text or controls. Four carriers travel the ring; whenever a carrier
 * passes behind the AURAX mark at the back of the ring it fades out and comes back with the
 * next of the seven cards, so all seven take turns without crowding a small screen.
 *
 * Lightweight: plain DOM + CSS transforms written from one requestAnimationFrame loop (no
 * WebGL, no React state per frame). The loop stops while the hero is off screen or the tab is
 * hidden, and does not run at all with prefers-reduced-motion (a still composition instead).
 * Decorative (aria-hidden). Tapping a card pauses the orbit and lifts it; tapping again or
 * elsewhere on the orbit resumes. touch-action: pan-y keeps page scrolling untouched.
 */

// Same seven cards, same order as the desktop orbit.
const ORDER = ["creatorA", "likes", "brand", "matched", "creatorB", "followers", "campaign"];
const PHASE = { creatorA: 0.0, likes: 1.3, brand: 1.9, matched: 0.4, creatorB: 2.6, followers: 2.1, campaign: 0.7 };
const CARRIERS = 4;
const STEP = (Math.PI * 2) / CARRIERS;
const BACK = -Math.PI / 2; // top of the ring (y points down), behind the AURAX mark
const LAP_SECONDS = 46; // one revolution; a new card arrives every quarter lap
const PULSES = [0, 0.5]; // two light pulses, half a ring apart

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const damp = (cur, target, k, dt) => cur + (target - cur) * (1 - Math.exp(-k * dt));
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
// angular distance from the back of the ring, 0..PI
const fromBack = (theta) => {
  const d = Math.abs((((theta - BACK) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
  return d;
};

const prefersReduced = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function HeroOrbitMobile() {
  const stageRef = useRef(null);
  const ringRef = useRef(null);
  const glowRef = useRef(null);
  const cardRefs = useRef({});
  const pulseRefs = useRef([]);
  const geo = useRef({ w: 0, h: 0, rx: 0, ry: 0, cy: 0, base: 0.7, tilt: 0 });
  const sizes = useRef({});
  // phi starts at a quarter step: one card behind the mark, one on each side, one in front
  const st = useRef({ phi: STEP / 2, speed: 1, pinned: null, lift: {}, t: 0 });
  const drawRef = useRef(null);

  // Geometry from the stage size (ResizeObserver; no React state, so no re-render)
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const measure = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const g = geo.current;
      g.w = w;
      g.h = h;
      // compact stage: a wide, shallow ring. Front card largest; cards shrink with depth.
      // Phones: side cards sit out at the edges so they clear the front card.
      const phone = w < 560;
      g.base = phone ? clamp(w / 400, 0.82, 0.9) : 0.94;
      g.rx = phone ? w / 2 - 40 : Math.max(w / 2 - 120, w * 0.25);
      g.ry = h / 2 - (phone ? 46 : 64);
      g.cy = phone ? 6 : 0;
      // the orbit plane is tilted a little, so the two lower positions sit at different
      // heights and cards passing each other overlap less on a narrow screen
      g.tilt = ((phone ? -6 : -5) * Math.PI) / 180;
      ORDER.forEach((id) => {
        const el = cardRefs.current[id]?.firstElementChild;
        if (el) sizes.current[id] = [el.offsetWidth, el.offsetHeight];
      });
      const ring = ringRef.current;
      if (ring) {
        ring.setAttribute("cx", String(w / 2));
        ring.setAttribute("cy", String(h / 2 + g.cy));
        ring.setAttribute("rx", String(g.rx));
        ring.setAttribute("ry", String(g.ry));
        ring.setAttribute("transform", `rotate(${((g.tilt * 180) / Math.PI).toFixed(2)} ${w / 2} ${h / 2 + g.cy})`);
      }
      drawRef.current?.(0);
    };
    measure();
    // also re-measure when a card changes size (web fonts arriving), so the clamp stays exact
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(stage);
    ORDER.forEach((id) => {
      const el = cardRefs.current[id]?.firstElementChild;
      if (el) ro?.observe(el);
    });
    return () => ro?.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const reduced = prefersReduced();
    const s = st.current;

    // Place every card for the current orbit angle.
    const draw = (dt) => {
      const g = geo.current;
      if (!g.w) return;
      const assigned = {};
      for (let i = 0; i < CARRIERS; i++) {
        // carrier i starts (i + 0.5) quarter laps behind the back, so carriers cross the back
        // in order 0,1,2,3,0,...; each crossing hands that carrier the next card (4 on stage,
        // all consecutive, never a duplicate).
        const rel = s.phi - (i + 0.5) * STEP; // angle travelled past the back point
        const laps = Math.floor((rel + Math.PI * 2) / (Math.PI * 2));
        const id = ORDER[(i + CARRIERS * laps) % ORDER.length];
        const theta = BACK + rel;
        const sin = Math.sin(theta);
        const near = (1 + sin) / 2; // 0 at the back, 1 at the front
        const lift = (s.lift[id] = damp(s.lift[id] || 0, s.pinned === id ? 1 : 0, 10, dt || 1));
        const sc = g.base * (0.6 + 0.4 * near) * (1 + lift * 0.05);
        const size = sizes.current[id] || [200, 120];
        // + margin for the slight turn (its near edge grows under perspective) and the float
        const hw = (size[0] / 2) * sc * 1.05 + 3;
        const hh = (size[1] / 2) * sc * 1.05 + 6;
        const float = reduced ? 0 : Math.sin(s.t * 0.55 + PHASE[id]) * 4;
        const ox = Math.cos(theta) * g.rx;
        const oy = sin * g.ry;
        let x = ox * Math.cos(g.tilt) - oy * Math.sin(g.tilt);
        let y = g.cy + ox * Math.sin(g.tilt) + oy * Math.cos(g.tilt) + float - lift * 6;
        // keep the whole card inside the stage (the stage is in the page flow, between the
        // copy and the buttons, so staying inside it means never touching them)
        x = clamp(x, -g.w / 2 + hw + 2, g.w / 2 - hw - 2);
        y = clamp(y, -g.h / 2 + hh + 2, g.h / 2 - hh - 2);
        const turn = -Math.cos(theta) * 16; // face slightly toward the centre
        // fade out behind the AURAX mark (where cards swap), slight haze with depth
        const op = (reduced ? 1 : smooth(0.3, 1.05, fromBack(theta))) * (0.66 + 0.34 * near);
        assigned[id] = { x, y, sc, turn, op, z: Math.round(near * 100) + (lift > 0.05 ? 200 : 0) };
      }
      ORDER.forEach((id) => {
        const el = cardRefs.current[id];
        if (!el) return;
        const a = assigned[id];
        if (!a || a.op < 0.01) {
          if (el.style.visibility !== "hidden") {
            el.style.visibility = "hidden";
            el.style.opacity = "0";
          }
          return;
        }
        el.style.visibility = "visible";
        el.style.opacity = a.op.toFixed(3);
        el.style.zIndex = String(a.z);
        el.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0) rotateY(${a.turn.toFixed(2)}deg) scale(${a.sc.toFixed(4)})`;
        el.classList.toggle(styles.lifted, s.pinned === id);
      });
      PULSES.forEach((off, k) => {
        const p = pulseRefs.current[k];
        if (!p) return;
        const th = BACK + s.phi * 2.4 + off * Math.PI * 2 + (reduced ? 1.1 : 0);
        const sin = Math.sin(th);
        const ox = Math.cos(th) * g.rx;
        const oy = sin * g.ry;
        const px = ox * Math.cos(g.tilt) - oy * Math.sin(g.tilt);
        const py = g.cy + ox * Math.sin(g.tilt) + oy * Math.cos(g.tilt);
        p.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) scale(${(0.7 + 0.3 * (1 + sin) / 2).toFixed(3)})`;
        p.style.opacity = (0.35 + 0.65 * (1 + sin) / 2).toFixed(3);
      });
      if (glowRef.current && !reduced) {
        glowRef.current.style.opacity = (0.82 + Math.sin(s.t * 0.6) * 0.12).toFixed(3);
      }
    };
    drawRef.current = draw;
    draw(0);
    stage.classList.add(styles.ready);
    if (reduced) return () => { drawRef.current = null; };

    // Animation loop: only while the orbit is on screen and the tab is visible
    let raf = 0;
    let last = 0;
    let onScreen = false;
    const frame = (now) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      s.t += dt;
      s.speed = damp(s.speed, s.pinned ? 0 : 1, 3.5, dt);
      s.phi += ((Math.PI * 2) / LAP_SECONDS) * s.speed * dt;
      draw(dt);
      raf = requestAnimationFrame(frame);
    };
    const run = () => {
      if (raf || !onScreen || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver((entries) => {
          // several entries can arrive in one batch: the last one is the current state
          onScreen = entries[entries.length - 1].isIntersecting;
          if (onScreen) run();
          else stop();
        }, { threshold: 0 })
      : null;
    if (io) io.observe(stage);
    else {
      onScreen = true;
      run();
    }
    const onVis = () => (document.hidden ? stop() : run());
    document.addEventListener("visibilitychange", onVis);

    // Tap (click fires only for a tap, never after a scroll) or mouse hover: pause + lift
    const cardAt = (target) => target.closest?.("[data-orbit-card]")?.getAttribute("data-orbit-card") || null;
    const onClick = (e) => {
      const id = cardAt(e.target);
      s.pinned = id && s.pinned !== id ? id : null;
    };
    const fineHover = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
    const onOver = (e) => {
      if (fineHover && e.pointerType === "mouse") s.pinned = cardAt(e.target);
    };
    const onLeave = (e) => {
      if (fineHover && e.pointerType === "mouse") s.pinned = null;
    };
    stage.addEventListener("click", onClick);
    stage.addEventListener("pointerover", onOver);
    stage.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      stage.removeEventListener("click", onClick);
      stage.removeEventListener("pointerover", onOver);
      stage.removeEventListener("pointerleave", onLeave);
      drawRef.current = null;
    };
  }, []);

  return (
    <div ref={stageRef} className={styles.stage} aria-hidden="true">
      <div ref={glowRef} className={styles.glow} />
      <svg className={styles.rings} width="100%" height="100%">
        <defs>
          <linearGradient id="axOrbitStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4fd1e8" />
            <stop offset="0.55" stopColor="#8b7cf6" />
            <stop offset="1" stopColor="#f06bb4" />
          </linearGradient>
          <linearGradient id="axOrbitFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.2" stopColor="#fff" stopOpacity="0.25" />
            <stop offset="0.75" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="axOrbitMask">
            <rect width="100%" height="100%" fill="url(#axOrbitFade)" />
          </mask>
        </defs>
        <ellipse ref={ringRef} className={styles.ring} mask="url(#axOrbitMask)" />
      </svg>
      <span className={styles.mark}>AURAX</span>
      {PULSES.map((_, k) => (
        <span key={k} ref={(el) => (pulseRefs.current[k] = el)} className={styles.pulse} data-tone={k ? "violet" : "cyan"} />
      ))}
      {ORDER.map((id) => {
        const Content = CONTENT[id];
        return (
          <div key={id} data-orbit-card={id} ref={(el) => (cardRefs.current[id] = el)} className={styles.slot}>
            <Content />
          </div>
        );
      })}
    </div>
  );
}
