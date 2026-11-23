import React from "react";
import styles from "./styles/HeroScene.module.css";

/*
 * The seven hero cards (creator, likes, brand, matched, post, followers, campaign).
 * Shared by the desktop orbit (HeroScene, three.js) and the mobile/tablet orbit
 * (HeroOrbitMobile, CSS transforms), so both always show exactly the same content.
 */

function Verified() {
  return (
    <svg className={styles.verified} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 .8l1.9 1.4 2.3-.2.7 2.2 1.9 1.4-.8 2.2.8 2.2-1.9 1.4-.7 2.2-2.3-.2L8 15.2l-1.9-1.4-2.3.2-.7-2.2L1.2 10.4 2 8.2 1.2 6l1.9-1.4.7-2.2 2.3.2z" />
      <path d="M5.2 8.2l1.9 1.9 3.8-3.9" fill="none" stroke="#0b2a33" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const Heart = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" /></svg>
);
const Bubble = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5v8a2.5 2.5 0 01-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 014 14.5z" /></svg>
);
const Send = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3L3 10.5l7 2.5 2.5 7z" /></svg>
);

// Instagram profile figures as supplied for @anitasdigitaldiaryy; photo is the one the
// Featured Creators section already uses.
// Shown at 44px: a 240px-wide resize (f_auto/q_auto, no crop) instead of the 434KB original.
const ANITA_PHOTO = "https://res.cloudinary.com/dzvtsnpr6/image/upload/f_auto,q_auto,c_limit,w_240/v1756719244/Aneeta_wzw8zb.webp";

function CreatorProfile() {
  return (
    <div className={`${styles.card} ${styles.profile}`}>
      <div className={styles.head}>
        <span className={styles.avatar} data-tone="rose">
          <img src={ANITA_PHOTO} alt="" decoding="async" draggable="false" />
        </span>
        <div className={styles.who}>
          <p className={`${styles.name} ${styles.nameLong}`}>@anitasdigitaldiaryy</p>
          <p className={styles.handle}>Digital creator</p>
        </div>
      </div>
      <div className={styles.stats}>
        <div><strong>804</strong><span>posts</span></div>
        <div><strong>105K</strong><span>followers</span></div>
        <div><strong>35</strong><span>following</span></div>
      </div>
      <div className={styles.grid}>
        <span data-tile="1" /><span data-tile="2" /><span data-tile="3" />
      </div>
    </div>
  );
}

function LikesChip() {
  return (
    <div className={`${styles.card} ${styles.chip} ${styles.likes}`}>
      <span className={styles.chipIcon} data-tone="rose"><Heart /></span>
      <div className={styles.chipText}>
        <strong>2,431 likes</strong>
        <span>“Need this routine!”</span>
      </div>
    </div>
  );
}

function FollowersChip() {
  return (
    <div className={`${styles.card} ${styles.chip}`}>
      <span className={styles.chipIcon} data-tone="signal">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16l5-5 4 4 7-7M15 8h5v5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <div className={styles.chipText}>
        <strong>+1.2K followers</strong>
        <span>this week</span>
      </div>
    </div>
  );
}

function CampaignCard() {
  return (
    <div className={`${styles.card} ${styles.campaign}`}>
      <div className={styles.rowBetween}>
        <span className={styles.kicker}>Campaign</span>
        <span className={styles.open}><i />Open</span>
      </div>
      <p className={styles.title}>Monsoon glow launch</p>
      <p className={styles.sub}>by Lumen Skincare</p>
      <div className={styles.tags}>
        <span>2 reels</span><span>3 stories</span>
      </div>
      <div className={styles.progress}><span style={{ width: "66%" }} /></div>
      <div className={styles.rowBetween}>
        <span className={styles.stack}>
          <span data-tone="rose">M</span><span data-tone="cyan">K</span><span data-tone="violet">A</span>
        </span>
        <span className={styles.sub}>8 of 12 creators</span>
      </div>
    </div>
  );
}

function BrandCard() {
  return (
    <div className={`${styles.card} ${styles.brand}`}>
      <div className={styles.head}>
        <span className={styles.logo}>L</span>
        <div className={styles.who}>
          <p className={styles.name}>Lumen Skincare</p>
          <p className={styles.handle}>Brand</p>
        </div>
      </div>
      <p className={styles.brief}>Looking for beauty and travel creators</p>
      <div className={styles.budget}>
        <span>Budget per creator</span>
        <strong>₹25K–₹60K</strong>
      </div>
      <div className={styles.rowBetween}>
        <span className={styles.sub}>Shortlist ready</span>
        <span className={styles.stack}>
          <span data-tone="rose">M</span><span data-tone="cyan">K</span>
        </span>
      </div>
    </div>
  );
}

function MatchedChip() {
  return (
    <div className={`${styles.card} ${styles.chip} ${styles.matched}`}>
      <span className={styles.chipIcon} data-tone="cyan">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <div className={styles.chipText}>
        <strong>Matched</strong>
        <span>Creator × Lumen Skincare</span>
      </div>
    </div>
  );
}

function CreatorPost() {
  return (
    <div className={`${styles.card} ${styles.post}`}>
      <div className={styles.head}>
        <span className={`${styles.avatar} ${styles.avatarSm}`} data-tone="rose"><span>IG</span></span>
        <div className={styles.who}>
          <p className={styles.name}>@instagram <Verified /></p>
          <p className={styles.handle}>Official account</p>
        </div>
      </div>
      <div className={styles.media}>
        <span className={styles.reel}>Reel</span>
      </div>
      <div className={styles.actions}>
        <span><Heart /></span>
        <span><Bubble /></span>
        <span><Send /></span>
      </div>
    </div>
  );
}

export const CONTENT = {
  creatorA: CreatorProfile,
  likes: LikesChip,
  followers: FollowersChip,
  campaign: CampaignCard,
  brand: BrandCard,
  matched: MatchedChip,
  creatorB: CreatorPost,
};
