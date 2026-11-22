import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CONTENT } from "./HeroCards";
import styles from "./styles/HeroOrbitFlat.module.css";
import { markHeroReady } from "../utils/heroReady";

/*
 * Desktop hero visual for computers without GPU-accelerated WebGL (see utils/webglSupport.js).
 *
 * Same composition as the three.js orbit in HeroScene: the seven cards revolve on the same
 * elliptical orbit (same design frames, card scale, depth shrink and perspective), with the same
 * gradient ring, travelling light pulses and nodes, and the same rule that a card fades out
 * wherever it would cover the hero copy, buttons or navbar.
 *
 * Lightweight: no WebGL and no JavaScript per frame. The orbit is turned into CSS @keyframes once
 * (on mount, resize and font load): 72 steps per lap of transform + opacity, which the browser
 * animates on the compositor. Only transform and opacity animate, on pre-rasterised layers.
 * Animations pause while the hero is off screen; with prefers-reduced-motion the cards hold
 * their starting positions. Decorative: aria-hidden, no pointer capture.
 *
 * Constants mirror HeroScene.jsx: keep the two in step if the orbit changes.
 */

const CAMERA_Z = 10;
const NODES = [
  { id: "creatorA", phase: 0.0 },
  { id: "likes", phase: 1.3 },
  { id: "brand", phase: 1.9 },
  { id: "matched", phase: 0.4 },
  { id: "creatorB", phase: 2.6 },
  { id: "followers", phase: 2.1 },
  { id: "campaign", phase: 0.7 },
];
const ORBIT_WIDE = { frameW: 1440, frameH: 900, rx: 578, cy: 36, ryTop: 316, ryBottom: 340 };
const COMPACT_W = 1300;
const ORBIT_COMPACT = { frameW: 1024, frameH: 768, rx: 442, cy: 28, ryTop: 282, ryBottom: 300 };
const LAP_SECONDS = 110;
const START_ANGLE = Math.PI;
const RING_COLORS = ["#4fd1e8", "#8b7cf6", "#f4b740", "#f06bb4", "#4fd1e8"];
const PULSES = [
  { color: "#4fd1e8", offset: 0 },
  { color: "#f4b740", offset: 0.25 },
  { color: "#f06bb4", offset: 0.5 },
  { color: "#8b7cf6", offset: 0.75 },
];
// Pulses travel faster than the cards: d(theta)/dt = 3.2 x card speed + 0.12 rad/s (HeroScene)
const PULSE_SECONDS = (Math.PI * 2) / (((Math.PI * 2) / LAP_SECONDS) * 3.2 + 0.12);
const STEPS = 72; // keyframes per lap (chord error under 1px on the widest ring)
const RING_SEGMENTS = 96;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const step = (Math.PI * 2) / NODES.length;

// Orbit geometry for a hero of w x h CSS px (same formulas as HeroScene's useLayout)
function layoutFor(w, h) {
  const compact = w < COMPACT_W;
  const orbit = compact ? ORBIT_COMPACT : ORBIT_WIDE;
  const sx = compact ? w / orbit.frameW : clamp(w / orbit.frameW, 0.74, 1.12);
  const sy = compact ? clamp(h / orbit.frameH, 0.9, 1.1) : clamp(h / orbit.frameH, 0.86, 1.1);
  const cardScale = compact ? 0.58 * clamp(w / 1024, 1, 1.12) : clamp(w / 1440, 0.8, 1.08);
  const orbitPx = (theta) => {
    const sin = Math.sin(theta);
    return [orbit.rx * Math.cos(theta) * sx, (orbit.cy + (sin < 0 ? orbit.ryTop : orbit.ryBottom) * sin) * sy];
  };
  return { cardScale, orbitPx };
}

// Depth along the ring (HeroScene's depthAt) folded into a 2D scale: the card shrinks while
// passing above and below the copy, and perspective makes nearer cards slightly larger.
function depthScale(theta) {
  const v = Math.abs(Math.sin(theta));
  const z = 0.6 - 3.0 * v;
  return (1 - 0.3 * v) * (CAMERA_Z / (CAMERA_Z - z));
}

// What the cards must never cover (same elements HeroScene measures), px from the hero centre
function measureBlockers(wrap) {
  const hero = wrap.closest("section");
  if (!hero) return [];
  const c = wrap.getBoundingClientRect();
  const ox = c.left + c.width / 2;
  const oy = c.top + c.height / 2;
  const boxes = [];
  const add = (r, pad = 14) => {
    if (r.width < 2 || r.height < 2) return;
    boxes.push({ l: r.left - ox - pad, r: r.right - ox + pad, t: r.top - oy - pad, b: r.bottom - oy + pad });
  };
  const main = hero.querySelector('[class*="mainContent"]');
  if (main) {
    main.querySelectorAll("h1, p").forEach((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      Array.from(range.getClientRects()).forEach((r) => add(r));
    });
    main.querySelectorAll('button, a, [class*="badge"], [class*="featureItem"], [class*="statCard"]').forEach((el) => add(el.getBoundingClientRect()));
  }
  // The fixed navbar, measured where it sits over the hero at the top of the page
  const nav = Array.from(document.querySelectorAll("nav, header"))
    .map((el) => el.getBoundingClientRect())
    .find((r) => r.top <= 1 && r.height > 30 && r.width > window.innerWidth * 0.5);
  if (nav) {
    const scrolled = window.scrollY || 0;
    add({ left: nav.left, right: nav.right, top: nav.top - scrolled, bottom: nav.bottom - scrolled, width: nav.width, height: nav.height }, 10);
  }
  const hw = c.width / 2, hh = c.height / 2;
  boxes.push({ l: -1e5, r: -hw + 6, t: -1e5, b: 1e5 });
  boxes.push({ l: hw - 6, r: 1e5, t: -1e5, b: 1e5 });
  boxes.push({ l: -1e5, r: 1e5, t: hh - 6, b: 1e5 });
  return boxes;
}

const pct = (k) => ((k / STEPS) * 100).toFixed(3) + "%";
const px = (v) => v.toFixed(1) + "px";

// Builds every @keyframes rule for the current hero size, card sizes and blockers
function buildCss({ w, h, sizes, blockers, uid }) {
  const { cardScale, orbitPx } = layoutFor(w, h);
  let css = "";
  NODES.forEach((n, i) => {
    const sz = sizes[n.id];
    const frames = [];
    const vis = [];
    for (let k = 0; k <= STEPS; k++) {
      const theta = START_ANGLE + i * step + (k / STEPS) * Math.PI * 2;
      const [x, y] = orbitPx(theta);
      const s = depthScale(theta) * cardScale;
      // same margin as HeroScene: covers the float and the 3D tilt the prediction ignores
      const hw = (sz[0] / 2) * s * 1.06 + 6;
      const hh = (sz[1] / 2) * s * 1.06 + 13;
      const hit = blockers.some((b) => x + hw > b.l && x - hw < b.r && y + hh > b.t && y - hh < b.b);
      vis.push(hit ? 0 : 1);
      frames.push([x, y, s]);
    }
    // Fade over one step on either side of a blocked stretch (about 1.5s, like the 3D fade)
    const body = frames
      .map(([x, y, s], k) => `${pct(k)}{transform:translate3d(${px(x)},${px(y)},0) scale(${s.toFixed(4)});opacity:${vis[k]}}`)
      .join("");
    css += `@keyframes axoCard${uid}_${i}{${body}}`;
  });
  // Pulses and nodes share one track each (they differ only by delay)
  const track = (name, offset) => {
    let body = "";
    for (let k = 0; k <= STEPS; k++) {
      const [x, y] = orbitPx(START_ANGLE + offset + (k / STEPS) * Math.PI * 2);
      body += `${pct(k)}{transform:translate3d(${px(x)},${px(y)},0)}`;
    }
    css += `@keyframes ${name}{${body}}`;
  };
  track(`axoPulse${uid}`, 0);
  track(`axoDot${uid}`, 0.5 * step);
  return css;
}

// Ring as short coloured segments (SVG can't colour a stroke along its length)
function ringSegments(w, h) {
  const { orbitPx } = layoutFor(w, h);
  const color = (u) => {
    const f = u * (RING_COLORS.length - 1);
    const a = Math.floor(f);
    const b = Math.min(a + 1, RING_COLORS.length - 1);
    const mix = (ca, cb, t) => Math.round(parseInt(ca, 16) * (1 - t) + parseInt(cb, 16) * t);
    const [A, B] = [RING_COLORS[a].slice(1), RING_COLORS[b].slice(1)];
    const t = f - a;
    return `rgb(${mix(A.slice(0, 2), B.slice(0, 2), t)},${mix(A.slice(2, 4), B.slice(2, 4), t)},${mix(A.slice(4, 6), B.slice(4, 6), t)})`;
  };
  return Array.from({ length: RING_SEGMENTS }, (_, i) => {
    const pts = [0, 0.5, 1].map((d) => orbitPx(((i + d) / RING_SEGMENTS) * Math.PI * 2));
    return { d: `M${pts.map(([x, y]) => `${(x + w / 2).toFixed(1)},${(y + h / 2).toFixed(1)}`).join("L")}`, color: color((i + 0.5) / RING_SEGMENTS) };
  });
}

let uidCounter = 0;

export default function HeroOrbitFlat() {
  const wrapRef = useRef(null);
  const cardRefs = useRef({});
  const uid = useMemo(() => `${(uidCounter += 1)}`, []);
  const [size, setSize] = useState(null); // hero size in CSS px
  const [css, setCss] = useState("");
  const [paused, setPaused] = useState(false);

  // Hero size: measured now and on every resize
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const read = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setSize((s) => (s && s.w === Math.round(r.width) && s.h === Math.round(r.height) ? s : { w: Math.round(r.width), h: Math.round(r.height) }));
    };
    read();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", read);
      return () => window.removeEventListener("resize", read);
    }
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Build the keyframes once the cards and the copy have their size; again after web fonts and
  // the live stats arrive (both can move the copy), and on resize.
  useEffect(() => {
    if (!size) return undefined;
    let cancelled = false;
    const build = () => {
      if (cancelled || !wrapRef.current) return;
      const sizes = {};
      for (const n of NODES) {
        const el = cardRefs.current[n.id];
        if (!el || !el.offsetWidth) return;
        sizes[n.id] = [el.offsetWidth, el.offsetHeight];
      }
      setCss(buildCss({ w: size.w, h: size.h, sizes, blockers: measureBlockers(wrapRef.current), uid }));
    };
    build();
    const t1 = setTimeout(build, 1200);
    document.fonts?.ready?.then(build).catch(() => {});
    return () => {
      cancelled = true;
      clearTimeout(t1);
    };
  }, [size, uid]);

  // First placement done: release the rest of the homepage
  useEffect(() => {
    if (css) markHeroReady();
  }, [css]);

  // Pause every animation while the hero is off screen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => setPaused(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const ring = useMemo(() => (size ? ringSegments(size.w, size.h) : []), [size]);

  return (
    <div ref={wrapRef} className={`${styles.wrap} ${css ? styles.isReady : ""} ${paused ? styles.paused : ""}`} aria-hidden="true">
      {css && <style>{css}</style>}
      {size && (
        <svg className={styles.ring} width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`}>
          {ring.map((s, i) => (
            <path key={i} d={s.d} stroke={s.color} />
          ))}
        </svg>
      )}
      <div className={styles.origin}>
        {NODES.map((n, i) => (
          <span
            key={`dot-${n.id}`}
            className={styles.dot}
            style={{ animationName: `axoDot${uid}`, animationDelay: `${-(i / NODES.length) * LAP_SECONDS}s` }}
          />
        ))}
        {PULSES.map((p, k) => (
          <span
            key={`pulse-${k}`}
            className={styles.pulse}
            style={{ "--pulse": p.color, animationName: `axoPulse${uid}`, animationDuration: `${PULSE_SECONDS.toFixed(2)}s`, animationDelay: `${-p.offset * PULSE_SECONDS}s` }}
          />
        ))}
        {NODES.map((n, i) => {
          const Content = CONTENT[n.id];
          return (
            <div key={n.id} className={styles.orbit} style={{ animationName: `axoCard${uid}_${i}` }}>
              <div className={styles.float} style={{ animationDelay: `${-(n.phase / 0.55).toFixed(2)}s` }}>
                <div className={styles.node} data-orbit-card={n.id} ref={(el) => (cardRefs.current[n.id] = el)}>
                  <Content />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
