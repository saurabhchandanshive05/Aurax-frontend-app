import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";
import styles from "./styles/HeroScene.module.css";
import { CONTENT } from "./HeroCards";

/*
 * Homepage hero visual: the AURAX ecosystem.
 * Creator, brand, campaign and engagement cards revolve slowly around the hero copy on one
 * elliptical orbit, coming forward on the sides and receding as they pass above and below.
 * Cards are DOM (crisp text, real shadows) placed in the three.js scene with drei
 * <Html transform>; the orbit line, travelling pulses and nodes are WebGL.
 *
 * The orbit is authored in design frames (1440x900, 1024x768) in px from the hero centre and
 * fitted around the copy; on top of that, any card whose on-screen box would meet the
 * headline, copy, buttons, features or navbar fades out until it is clear.
 * Purely decorative: aria-hidden, no pointer capture.
 */

const CAMERA_Z = 10;
const FOV = 35;

// The seven cards revolve, evenly spaced, around the hero copy. Order around the ring
// alternates big cards and small notifications so the spacing reads evenly.
// phase: independent float offset. (Positions come from the orbit, not from fixed spots.)
const NODES = [
  { id: "creatorA", phase: 0.0 },
  { id: "likes", phase: 1.3 },
  { id: "brand", phase: 1.9 },
  { id: "matched", phase: 0.4 },
  { id: "creatorB", phase: 2.6 },
  { id: "followers", phase: 2.1 },
  { id: "campaign", phase: 0.7 },
];

// Orbit in design px from the hero centre, y pointing DOWN (screen sense):
// x = rx cos(t), y = cy + (top ? ryTop : ryBottom) sin(t).
// The ring passes between the navbar and the badge at the top and below the feature row at
// the bottom, and out past the headline on both sides.
const ORBIT_WIDE = { frameW: 1440, frameH: 900, rx: 578, cy: 36, ryTop: 316, ryBottom: 340 };
// Narrow desktops (hero under 1300px wide): smaller ring, smaller cards.
const COMPACT_W = 1300;
const ORBIT_COMPACT = { frameW: 1024, frameH: 768, rx: 442, cy: 28, ryTop: 282, ryBottom: 300 };

const LAP_SECONDS = 110; // one full revolution
const START_ANGLE = Math.PI; // the first card starts on the left side
const RING_COLORS = ["#4fd1e8", "#8b7cf6", "#f4b740", "#f06bb4", "#4fd1e8"];
const RING_POINTS = 160;
const PULSES = [
  { color: "#4fd1e8", offset: 0 },
  { color: "#f4b740", offset: 0.25 },
  { color: "#f06bb4", offset: 0.5 },
  { color: "#8b7cf6", offset: 0.75 },
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const damp = (cur, target, k, dt) => cur + (target - cur) * (1 - Math.exp(-k * dt));

/* ---------- scene ---------- */

function useLayout() {
  const size = useThree((s) => s.size);
  return useMemo(() => {
    const w = size.width || 1440;
    const h = size.height || 900;
    // world units per CSS px on the z=0 plane
    const upp = (2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / h;
    const compact = w < COMPACT_W;
    const orbit = compact ? ORBIT_COMPACT : ORBIT_WIDE;
    const sx = compact ? w / orbit.frameW : clamp(w / orbit.frameW, 0.74, 1.12);
    const sy = compact ? clamp(h / orbit.frameH, 0.9, 1.1) : clamp(h / orbit.frameH, 0.86, 1.1);
    const cardScale = compact ? 0.58 * clamp(w / 1024, 1, 1.12) : clamp(w / 1440, 0.8, 1.08);
    // Orbit point in screen px from the canvas centre (y down)
    const orbitPx = (theta) => {
      const sin = Math.sin(theta);
      return [orbit.rx * Math.cos(theta) * sx, (orbit.cy + (sin < 0 ? orbit.ryTop : orbit.ryBottom) * sin) * sy];
    };
    // screen px (y down) at depth z -> world position; z compensates perspective so the point
    // lands on its screen px whatever its depth
    const toWorld = (px, py, z = 0) => {
      const k = upp * ((CAMERA_Z - z) / CAMERA_Z);
      return [px * k, -py * k];
    };
    return { upp, cardScale, orbitPx, toWorld };
  }, [size.width, size.height]);
}

// Depth along the ring: near on the sides, receding while passing above and below the copy
const depthAt = (theta) => {
  const v = Math.abs(Math.sin(theta));
  return { z: 0.6 - 3.0 * v, scale: 1 - 0.3 * v };
};

function Ecosystem({ reduced, hovered }) {
  const { upp, cardScale, orbitPx, toWorld } = useLayout();
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const rig = useRef();
  const nodeRefs = useRef({});
  const cardEls = useRef({});
  const pulseRefs = useRef([]);
  const dotRefs = useRef([]);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const lift = useRef(Object.fromEntries(NODES.map((n) => [n.id, 0])));
  const alpha = useRef(Object.fromEntries(NODES.map((n) => [n.id, 1])));
  const spin = useRef({ angle: 0, speed: 1 });
  const blockers = useRef([]); // hero copy, buttons, features and navbar, px from canvas centre
  const cardSize = useRef({}); // card CSS size, measured once mounted

  // Pointer parallax, normalised to the viewport (the canvas sits under the hero copy).
  useEffect(() => {
    if (reduced) return undefined;
    const onMove = (e) => {
      pointer.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  // Measure what the cards must never cover: the hero's text lines, badge, buttons, feature
  // and stat tiles, plus the fixed navbar. Re-measured on resize and every 600ms (fonts,
  // live stats and the navbar position can change).
  useEffect(() => {
    const measure = () => {
      const canvas = gl.domElement;
      const hero = canvas.closest("section");
      if (!hero) return;
      const c = canvas.getBoundingClientRect();
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
      const nav = Array.from(document.querySelectorAll("nav, header"))
        .map((el) => el.getBoundingClientRect())
        .find((r) => r.top <= 1 && r.height > 30 && r.width > window.innerWidth * 0.5);
      if (nav) add(nav, 10);
      // the hero's own edges: a card leaving the canvas fades rather than showing clipped
      const hw = c.width / 2, hh = c.height / 2;
      boxes.push({ l: -1e5, r: -hw + 6, t: -1e5, b: 1e5 });
      boxes.push({ l: hw - 6, r: 1e5, t: -1e5, b: 1e5 });
      boxes.push({ l: -1e5, r: 1e5, t: hh - 6, b: 1e5 });
      blockers.current = boxes;
      Object.entries(cardEls.current).forEach(([id, el]) => {
        if (el && el.offsetWidth) cardSize.current[id] = [el.offsetWidth, el.offsetHeight];
      });
    };
    measure();
    const iv = setInterval(measure, 600);
    window.addEventListener("resize", measure);
    return () => {
      clearInterval(iv);
      window.removeEventListener("resize", measure);
    };
  }, [gl, size.width, size.height]);

  const ringPoints = useMemo(
    () => Array.from({ length: RING_POINTS + 1 }, (_, i) => {
      const th = (i / RING_POINTS) * Math.PI * 2;
      const [px, py] = orbitPx(th);
      const [x, y] = toWorld(px, py, -0.6);
      return [x, y, -0.6];
    }),
    [orbitPx, toWorld]
  );
  const ringColors = useMemo(
    () => Array.from({ length: RING_POINTS + 1 }, (_, i) => {
      const u = (i / RING_POINTS) * (RING_COLORS.length - 1);
      const a = Math.floor(u);
      const b = Math.min(a + 1, RING_COLORS.length - 1);
      return new THREE.Color(RING_COLORS[a]).lerp(new THREE.Color(RING_COLORS[b]), u - a).toArray();
    }),
    []
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = reduced ? 0 : state.clock.elapsedTime;
    const p = pointer.current;
    p.x = damp(p.x, p.tx, 3, dt);
    p.y = damp(p.y, p.ty, 3, dt);

    // Orbit: integrate the angle so pausing (hover) and resuming ease without a jump
    const sp = spin.current;
    sp.speed = damp(sp.speed, hovered.current ? 0 : 1, 3.5, dt);
    if (!reduced) sp.angle += ((Math.PI * 2) / LAP_SECONDS) * sp.speed * dt;

    // Scroll: the whole ring eases up and tilts back slightly as the hero leaves.
    const scroll = reduced ? 0 : clamp(window.scrollY / Math.max(size.height, 1), 0, 1);

    camera.position.x = p.x * 0.45;
    camera.position.y = -p.y * 0.28;
    camera.lookAt(0, 0, 0);

    if (rig.current) {
      rig.current.rotation.y = p.x * 0.05;
      rig.current.rotation.x = p.y * 0.035 - scroll * 0.18;
      rig.current.position.y = scroll * 1.1;
    }

    const step = (Math.PI * 2) / NODES.length;
    NODES.forEach((n, i) => {
      const g = nodeRefs.current[n.id];
      if (!g) return;
      const theta = START_ANGLE + i * step + sp.angle;
      const [px, py0] = orbitPx(theta);
      const { z, scale } = depthAt(theta);
      const floatPx = Math.sin(t * 0.55 + n.phase) * 7; // independent gentle float
      const py = py0 + floatPx;
      const l = (lift.current[n.id] = damp(lift.current[n.id], hovered.current === n.id ? 1 : 0, 8, dt));
      const [x, y] = toWorld(px, py, z);
      g.position.set(x, y, z + l * 0.45);
      // Readable: no spin, only a slight turn toward the centre plus a gentle sway
      const turn = -0.24 * Math.cos(theta);
      g.rotation.set(
        Math.sin(t * 0.4 + n.phase) * 0.03 + p.y * 0.06,
        turn + Math.sin(t * 0.35 + n.phase) * 0.04 + p.x * 0.1 - l * turn * 0.6,
        Math.sin(t * 0.3 + n.phase) * 0.012
      );
      const s = scale * (1 + l * 0.04);
      g.scale.set(s, s, s);

      // Never cover the copy: fade out while the card's on-screen box meets a blocker
      const el = cardEls.current[n.id];
      const sz = cardSize.current[n.id];
      let hit = false;
      if (sz) {
        const persp = CAMERA_Z / (CAMERA_Z - z);
        // margin covers what the prediction ignores: pointer parallax and the card's tilt
        const hw = (sz[0] / 2) * cardScale * s * persp * 1.06 + 6;
        const hh = (sz[1] / 2) * cardScale * s * persp * 1.06 + 6;
        const cl = px - hw, cr = px + hw, ct = py - hh, cb = py + hh;
        hit = blockers.current.some((b) => cr > b.l && cl < b.r && cb > b.t && ct < b.b);
      }
      const a = (alpha.current[n.id] = reduced ? (hit ? 0 : 1) : damp(alpha.current[n.id], hit ? 0 : 1, hit ? 16 : 5, dt));
      if (el) {
        el.style.opacity = a.toFixed(3);
        el.style.visibility = a < 0.02 ? "hidden" : "visible";
      }
    });

    // Pulses travel the ring faster than the cards; small nodes ride between the cards
    PULSES.forEach((pl, k) => {
      const m = pulseRefs.current[k];
      if (!m) return;
      const theta = START_ANGLE + (reduced ? pl.offset * Math.PI * 2 : sp.angle * 3.2 + t * 0.12 + pl.offset * Math.PI * 2);
      const [px, py] = orbitPx(theta);
      const [x, y] = toWorld(px, py, -0.6);
      m.position.set(x, y, -0.6);
    });
    NODES.forEach((n, i) => {
      const d = dotRefs.current[i];
      if (!d) return;
      const theta = START_ANGLE + (i + 0.5) * step + sp.angle;
      const [px, py] = orbitPx(theta);
      const [x, y] = toWorld(px, py, -0.6);
      d.position.set(x, y, -0.6);
    });
  });

  const pxToWorld = upp * 400 * cardScale; // drei Html transform: 1 css px = distanceFactor / 400 units

  return (
    <group ref={rig}>
      <Line
        points={ringPoints}
        vertexColors={ringColors}
        lineWidth={1.4}
        transparent
        opacity={0.36}
        depthWrite={false}
      />

      {NODES.map((n, i) => (
        <mesh key={`dot-${n.id}`} ref={(el) => (dotRefs.current[i] = el)}>
          <circleGeometry args={[upp * 3, 16]} />
          <meshBasicMaterial color="#b9afff" transparent opacity={0.7} depthWrite={false} />
        </mesh>
      ))}

      {PULSES.map((pl, k) => (
        <group key={`pulse-${k}`} ref={(el) => (pulseRefs.current[k] = el)}>
          <mesh>
            <circleGeometry args={[upp * 4, 20]} />
            <meshBasicMaterial color={pl.color} transparent opacity={0.95} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0, -0.001]}>
            <circleGeometry args={[upp * 11, 24]} />
            <meshBasicMaterial color={pl.color} transparent opacity={0.16} depthWrite={false} />
          </mesh>
        </group>
      ))}

      {NODES.map((n) => {
        const Content = CONTENT[n.id];
        return (
          <group key={n.id} ref={(el) => (nodeRefs.current[n.id] = el)}>
            <Html transform distanceFactor={pxToWorld} pointerEvents="none" zIndexRange={[20, 0]}>
              <div data-eco-card={n.id} className={styles.node} ref={(el) => (cardEls.current[n.id] = el)}>
                <Content />
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// The canvas renders on demand. While the hero is on screen (and motion is allowed) each
// frame requests the next one; off screen the loop simply stops, and coming back into view
// kicks it again. No frameloop switching, so the clock never resets.
// Every kick (mount, resize, back in view) also renders for a short settle window: the card
// layers mount asynchronously and need a frame after mounting to take their place, which a
// single on-demand frame would miss under reduced motion.
const SETTLE_MS = 1500;
function FrameDriver({ visibleRef, reduced, kickRef }) {
  const invalidate = useThree((s) => s.invalidate);
  const size = useThree((s) => s.size);
  const settleUntil = useRef(0);
  useEffect(() => {
    kickRef.current = () => {
      settleUntil.current = performance.now() + SETTLE_MS;
      invalidate();
    };
    kickRef.current();
    return () => { kickRef.current = null; };
  }, [invalidate, kickRef, reduced, size.width, size.height]);
  useFrame(() => {
    if (!visibleRef.current) return;
    if (!reduced || performance.now() < settleUntil.current) invalidate();
  });
  return null;
}

const HeroScene = () => {
  const wrapRef = useRef(null);
  const hovered = useRef(null);
  const visibleRef = useRef(true);
  const kickRef = useRef(null);
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return undefined;
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  // Only render frames while the hero is on screen.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => {
      visibleRef.current = e.isIntersecting;
      if (e.isIntersecting) kickRef.current?.();
    }, { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Hover: the canvas sits beneath the hero copy, so hit-test the cards against the pointer.
  useEffect(() => {
    if (reduced) return undefined;
    let raf = 0;
    let last = null;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        let hit = null;
        wrap.querySelectorAll("[data-eco-card]").forEach((el) => {
          if (parseFloat(el.style.opacity || "1") < 0.5) return; // faded while clear of the copy
          const r = el.getBoundingClientRect();
          if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) hit = el;
        });
        // ignore the pointer when it is over the hero's own content (buttons, copy)
        const top = document.elementFromPoint(e.clientX, e.clientY);
        if (top && top.closest("a,button,h1,p") && !wrap.contains(top)) hit = null;
        const id = hit ? hit.getAttribute("data-eco-card") : null;
        if (id !== last) {
          if (last) wrap.querySelector(`[data-eco-card="${last}"]`)?.classList.remove(styles.isHover);
          if (hit) hit.classList.add(styles.isHover);
          last = id;
          hovered.current = id;
        }
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className={styles.wrap} aria-hidden="true">
      {/* Same backdrop tint the previous scene painted, so the hero background is unchanged */}
      <div className={styles.backdrop} />
      <Canvas
        className={styles.canvas}
        camera={{ position: [0, 0, CAMERA_Z], fov: FOV, near: 0.1, far: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop="demand"
      >
        <FrameDriver visibleRef={visibleRef} reduced={reduced} kickRef={kickRef} />
        <Ecosystem reduced={reduced} hovered={hovered} />
      </Canvas>
    </div>
  );
};

export default HeroScene;
