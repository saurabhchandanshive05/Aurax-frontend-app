import React from "react";
import Icon from "./ui/Icon";
import styles from "./styles/FeatureShowcase.module.css";

/*
 * One small animated scene per service card. Decorative only (aria-hidden on the wrapper):
 * no numbers, names or results, just a picture of what the service is.
 * Everything animates with transform/opacity, so it runs on the compositor; the section pauses
 * these animations while it's off screen, and reduced motion stops them.
 */

const Social = () => (
  <div className={styles.vSocial}>
    <div className={styles.phone}>
      <span className={styles.phoneNotch} />
      <div className={styles.feed}>
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className={`${styles.post} ${i === 4 ? styles.reel : ""}`} style={{ "--i": i }}>
            {i === 4 && <span className={styles.play} />}
          </span>
        ))}
      </div>
      <div className={styles.days}>
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className={styles.day} style={{ "--i": i }} />
        ))}
      </div>
    </div>
    <span className={`${styles.bubble} ${styles.bubbleA}`}><Icon name="heart" size={16} strokeWidth={2.2} /></span>
    <span className={`${styles.bubble} ${styles.bubbleB}`}><Icon name="chat" size={16} strokeWidth={2.2} /></span>
    <span className={`${styles.bubble} ${styles.bubbleC}`}><Icon name="send" size={15} strokeWidth={2.2} /></span>
  </div>
);

// Content strategy: static connecting lines (SVG, never animated) with HTML nodes on top,
// so the pulsing runs on the compositor.
const NODES = [
  [100, 60, 9], [34, 28, 5], [170, 24, 5], [28, 96, 5], [172, 98, 5], [66, 12, 3.5], [138, 112, 3.5],
];
const LINKS = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 5], [4, 6]];
const Strategy = () => (
  <div className={styles.vStrategy}>
    <svg className={styles.links} viewBox="0 0 200 124" preserveAspectRatio="none">
      <defs>
        <linearGradient id="fsStratLine" x1="0" x2="1">
          <stop offset="0" stopColor="#f4b740" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#f06bb4" stopOpacity="0.75" />
          <stop offset="1" stopColor="#f4b740" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {LINKS.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} stroke="url(#fsStratLine)" />
      ))}
    </svg>
    <span className={styles.coreHalo} style={{ left: "50%", top: `${(60 / 124) * 100}%` }} />
    {NODES.map(([x, y, r], i) => (
      <span
        key={i}
        className={i === 0 ? styles.coreNode : styles.node}
        style={{ left: `${(x / 200) * 100}%`, top: `${(y / 124) * 100}%`, "--d": `${r * 2.4}px`, "--i": i }}
      />
    ))}
  </div>
);

const CLIPS = [
  [[0, 34], [38, 22], [64, 30]],
  [[8, 26], [40, 40], [84, 14]],
  [[0, 52], [56, 40]],
];
const Shoots = () => (
  <div className={styles.vShoots}>
    <span className={styles.rec}><span className={styles.recDot} />REC</span>
    <div className={styles.tracks}>
      {CLIPS.map((row, r) => (
        <div key={r} className={styles.track}>
          {row.map(([left, width], c) => (
            <span key={c} className={styles.clip} style={{ left: `${left}%`, width: `${width}%`, "--r": r }} />
          ))}
        </div>
      ))}
      <div className={styles.scan}><span className={styles.playhead} /></div>
    </div>
  </div>
);

const BLIPS = [[28, 30], [70, 24], [78, 66], [34, 74], [56, 46], [20, 56]];
const Meta = () => (
  <div className={styles.vMeta}>
    <div className={styles.radar}>
      <span className={styles.ring} style={{ "--s": 1 }} />
      <span className={styles.ring} style={{ "--s": 0.68 }} />
      <span className={styles.ring} style={{ "--s": 0.36 }} />
      <span className={styles.sweep} />
      {BLIPS.map(([x, y], i) => (
        <span key={i} className={styles.blip} style={{ left: `${x}%`, top: `${y}%`, "--i": i }} />
      ))}
      <span className={styles.radarCore}><Icon name="map-pin" size={18} strokeWidth={2.2} /></span>
    </div>
  </div>
);

const Influencers = () => (
  <div className={styles.vInfluencers}>
    <span className={styles.orbitPath} />
    <div className={styles.orbit}>
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <span key={deg} className={styles.sat} style={{ "--deg": `${deg}deg`, "--i": i }}>
          <span className={styles.avatar}><Icon name="user" size={14} strokeWidth={2.2} /></span>
        </span>
      ))}
    </div>
    <span className={styles.hub}><Icon name="sparkle" size={18} strokeWidth={2.2} /></span>
  </div>
);

const Seo = () => (
  <div className={styles.vSeo}>
    <div className={styles.map}>
      <span className={`${styles.road} ${styles.roadA}`} />
      <span className={`${styles.road} ${styles.roadB}`} />
      <span className={`${styles.road} ${styles.roadC}`} />
      <span className={styles.ripple} />
      <span className={styles.pin}><Icon name="map-pin" size={22} strokeWidth={2.2} /></span>
    </div>
    <div className={styles.search}>
      <Icon name="search" size={13} strokeWidth={2.4} />
      <span className={styles.searchBar} />
    </div>
  </div>
);

const Websites = () => (
  <div className={styles.vWebsites}>
    <div className={styles.browser}>
      <div className={styles.browserBar}><i /><i /><i /><span className={styles.url} /></div>
      <span className={styles.load} />
      <div className={styles.page}>
        <span className={styles.pageHero} />
        <span className={styles.pageLine} />
        <span className={`${styles.pageLine} ${styles.short}`} />
        <div className={styles.pageCards}><span /><span /><span /></div>
      </div>
    </div>
    <div className={styles.mini}>
      <span className={styles.miniNotch} />
      <span className={`${styles.msg} ${styles.msgIn}`} />
      <span className={`${styles.msg} ${styles.msgOut}`}><Icon name="chat" size={11} strokeWidth={2.4} /></span>
      <span className={`${styles.msg} ${styles.msgIn2}`} />
    </div>
  </div>
);

const SCENES = {
  social: Social,
  strategy: Strategy,
  shoots: Shoots,
  meta: Meta,
  influencers: Influencers,
  seo: Seo,
  websites: Websites,
};

const ServiceVisual = ({ id }) => {
  const Scene = SCENES[id];
  return Scene ? <Scene /> : null;
};

export default ServiceVisual;
