import React from "react";

/*
 * Isometric 3D service visuals for the "We Specialize In" section.
 * One shared material and light: violet top faces (lit from above), indigo and deep-indigo
 * side faces, and restrained cyan only for each object's "active" detail.
 * Pure SVG, no WebGL.
 */

const C30 = 0.866;
// world (x, y, z) -> screen; z is up
const P = (x, y, z) => [(x - y) * C30, (x + y) * 0.5 - z];
const pts = (...ps) => ps.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");

function Box({ x, y, z = 0, w, d, h, top, left, right, stroke = "rgba(255,255,255,0.18)" }) {
  return (
    <g>
      <polygon points={pts(P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h))} fill={left} />
      <polygon points={pts(P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h))} fill={right} />
      <polygon points={pts(P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h))} fill={top} stroke={stroke} strokeWidth="0.6" />
    </g>
  );
}

// A flat ellipse lying on the top plane at height z (for discs and tokens)
function Disc({ cx, cy, z, r, fill, stroke }) {
  const [sx, sy] = P(cx, cy, z);
  return <ellipse cx={sx} cy={sy} rx={r * C30 * 1.414} ry={r * 0.5 * 1.414} fill={fill} stroke={stroke} strokeWidth={stroke ? 0.8 : 0} />;
}

function Defs({ id }) {
  return (
    <defs>
      <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#a9bcff" />
        <stop offset="1" stopColor="#6c80f0" />
      </linearGradient>
      <linearGradient id={`${id}-left`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4a5ccc" />
        <stop offset="1" stopColor="#303f9c" />
      </linearGradient>
      <linearGradient id={`${id}-right`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#28316f" />
        <stop offset="1" stopColor="#1a2050" />
      </linearGradient>
      <linearGradient id={`${id}-cyan`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#a5f0fa" />
        <stop offset="1" stopColor="#4fd1e8" />
      </linearGradient>
      <radialGradient id={`${id}-glow`}>
        <stop offset="0" stopColor="#4fd1e8" stopOpacity="0.55" />
        <stop offset="1" stopColor="#4fd1e8" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

const mat = (id) => ({ top: `url(#${id}-top)`, left: `url(#${id}-left)`, right: `url(#${id}-right)` });
const cyan = (id) => ({ top: `url(#${id}-cyan)`, left: "#2fa9c0", right: "#1d7487" });

/* 1. AI-Powered Marketing: a processor with a lit core and circuit traces */
function AiChip({ id }) {
  const m = mat(id);
  const pins = [-22, -8, 6, 20];
  return (
    <g>
      {pins.map((p) => <Box key={`a${p}`} x={p} y={30} z={2} w={5} d={7} h={3} {...m} stroke="none" />)}
      {pins.map((p) => <Box key={`b${p}`} x={30} y={p} z={2} w={7} d={5} h={3} {...m} stroke="none" />)}
      <Box x={-30} y={-30} w={60} d={60} h={9} {...m} />
      {[[-24, -6, -10, -6], [10, -6, 24, -6], [-6, -24, -6, -10], [-6, 10, -6, 24]].map(([x1, y1, x2, y2], i) => (
        <polyline key={i} points={pts(P(x1, y1, 9), P(x2, y2, 9))} stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      ))}
      <ellipse cx={P(0, 0, 18)[0]} cy={P(0, 0, 18)[1]} rx="30" ry="16" fill={`url(#${id}-glow)`} />
      <Box x={-12} y={-12} z={9} w={24} d={24} h={7} {...cyan(id)} stroke="rgba(255,255,255,0.5)" />
    </g>
  );
}

/* 2. UGC Automation: a stack of video frames, the top one playing */
function VideoStack({ id }) {
  const m = mat(id);
  const [px, py] = P(0, 0, 30);
  return (
    <g>
      <Box x={-30} y={-22} z={0} w={56} d={42} h={4} {...m} />
      <Box x={-26} y={-24} z={13} w={56} d={42} h={4} {...m} />
      <Box x={-22} y={-26} z={26} w={56} d={42} h={4} {...m} />
      <ellipse cx={px} cy={py + 1} rx="24" ry="12" fill={`url(#${id}-glow)`} />
      <polygon points={pts(P(-2, -14, 30), P(-2, 6, 30), P(16, -4, 30))} fill={`url(#${id}-cyan)`} stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
    </g>
  );
}

/* 3. Creator CRM Systems: creator tokens on a plate, linked to one active contact */
function CrmNetwork({ id }) {
  const m = mat(id);
  const tokens = [[-18, -14, 14], [18, -18, 10], [-14, 18, 8]];
  const hub = [10, 12];
  return (
    <g>
      <Box x={-34} y={-34} w={68} d={68} h={6} {...m} />
      {tokens.map(([x, y]) => (
        <polyline key={`l${x}`} points={pts(P(x, y, 6), P(hub[0], hub[1], 6))} stroke="#4fd1e8" strokeOpacity="0.7" strokeWidth="1.3" fill="none" />
      ))}
      {tokens.map(([x, y, h]) => (
        <g key={`t${x}`}>
          <Box x={x - 5} y={y - 5} z={6} w={10} d={10} h={h} {...m} stroke="none" />
          <Disc cx={x} cy={y} z={6 + h} r={7.5} fill={`url(#${id}-top)`} stroke="rgba(255,255,255,0.35)" />
          <Disc cx={x} cy={y} z={6 + h + 0.1} r={3.2} fill="#303f9c" />
        </g>
      ))}
      <ellipse cx={P(hub[0], hub[1], 20)[0]} cy={P(hub[0], hub[1], 20)[1]} rx="18" ry="10" fill={`url(#${id}-glow)`} />
      <Box x={hub[0] - 6} y={hub[1] - 6} z={6} w={12} d={12} h={14} {...cyan(id)} stroke="rgba(255,255,255,0.5)" />
    </g>
  );
}

/* 4. Trend Forecasting: rising bars with the forecast line projected ahead */
function TrendBars({ id }) {
  const m = mat(id);
  const bars = [[-26, 10], [-12, 18], [2, 26], [16, 36]];
  const line = bars.map(([x, h]) => P(x + 4, 4, h + 10));
  const ahead = P(34, 4, 54);
  return (
    // compact footprint: scaled up to sit at the same visual weight as the other objects
    <g transform="translate(6 8) scale(1.3)">
      <Box x={-34} y={-14} w={66} d={30} h={5} {...m} />
      {bars.map(([x, h], i) => (
        <Box key={x} x={x} y={-6} z={5} w={9} d={14} h={h} {...(i === bars.length - 1 ? cyan(id) : m)} stroke={i === bars.length - 1 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.18)"} />
      ))}
      <polyline points={pts(...line)} stroke="rgba(255,255,255,0.75)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts(line[line.length - 1], ahead)} stroke="#4fd1e8" strokeWidth="1.6" strokeDasharray="3 3" fill="none" strokeLinecap="round" />
      <circle cx={ahead[0]} cy={ahead[1]} r="3.2" fill="#4fd1e8" />
      <circle cx={ahead[0]} cy={ahead[1]} r="8" fill={`url(#${id}-glow)`} />
    </g>
  );
}

/* 5. Influencer Discovery: a grid of creator tiles, one picked out under the lens */
function DiscoveryLens({ id }) {
  const m = mat(id);
  const tiles = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) tiles.push([-27 + i * 19, -27 + j * 19]);
  const [lx, ly] = P(-8, 11, 30);
  return (
    <g>
      <Box x={-32} y={-32} w={64} d={64} h={5} {...m} />
      {tiles.map(([x, y]) => {
        const picked = x === -8 && y === 11;
        return <Box key={`${x}${y}`} x={x} y={y} z={5} w={14} d={14} h={picked ? 8 : 3} {...(picked ? cyan(id) : m)} stroke={picked ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.15)"} />;
      })}
      {/* lens */}
      <line x1={lx + 14} y1={ly + 12} x2={lx + 30} y2={ly + 27} stroke="#303f9c" strokeWidth="6" strokeLinecap="round" />
      <line x1={lx + 14} y1={ly + 12} x2={lx + 30} y2={ly + 27} stroke="#8b7cf6" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r="17" fill="rgba(165,240,250,0.12)" stroke={`url(#${id}-top)`} strokeWidth="4.5" />
      <path d={`M ${lx - 9} ${ly - 7} A 11 11 0 0 1 ${lx + 3} ${ly - 11}`} stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* 6. Data-Driven Growth: rising steps with an upward marker on the top step */
function GrowthSteps({ id }) {
  const m = mat(id);
  const [ax, ay] = P(16, -2, 50);
  return (
    <g>
      <Box x={-34} y={-12} w={18} d={26} h={12} {...m} />
      <Box x={-14} y={-12} w={18} d={26} h={24} {...m} />
      <Box x={6} y={-12} w={18} d={26} h={36} {...cyan(id)} stroke="rgba(255,255,255,0.5)" />
      <circle cx={ax} cy={ay + 10} r="16" fill={`url(#${id}-glow)`} />
      <path d={`M ${ax} ${ay - 14} L ${ax + 9} ${ay - 3} L ${ax + 3.5} ${ay - 3} L ${ax + 3.5} ${ay + 9} L ${ax - 3.5} ${ay + 9} L ${ax - 3.5} ${ay - 3} L ${ax - 9} ${ay - 3} Z`}
        fill="#e6edff" stroke="rgba(255,255,255,0.7)" strokeWidth="0.6" />
    </g>
  );
}

const SHAPES = {
  "AI-Powered Marketing": AiChip,
  "UGC Automation": VideoStack,
  "Creator CRM Systems": CrmNetwork,
  "Trend Forecasting": TrendBars,
  "Influencer Discovery": DiscoveryLens,
  "Data-Driven Growth": GrowthSteps,
};

export default function ServiceVisual({ name, uid, className }) {
  const Shape = SHAPES[name];
  if (!Shape) return null;
  const id = `sv-${uid}`;
  return (
    <svg className={className} viewBox="-80 -70 160 120" aria-hidden="true" focusable="false">
      <Defs id={id} />
      <Shape id={id} />
    </svg>
  );
}
