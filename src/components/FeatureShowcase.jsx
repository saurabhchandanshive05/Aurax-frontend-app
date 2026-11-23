import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import Icon from "./ui/Icon";
import useDialog from "../hooks/useDialog";
import { useAuth } from "../context/AuthContext";
import { areaForUser } from "./layout/appNav";
import usePauseOffscreen from "../hooks/usePauseOffscreen";
import ServiceVisual from "./FeatureShowcaseVisuals";
import { webglTier } from "../utils/webglSupport";
import styles from "./styles/FeatureShowcase.module.css";

/*
 * Three connected blocks, laid out like the reference design:
 *   1. "Everything to get you noticed": service cards; each opens a details panel
 *      (how we do it, platforms, all details, a note and a call to action).
 *   2. "4 steps": the campaign process as a numbered timeline.
 *   3. "Made for you": audience tabs with a highlight panel and tiles.
 * Service cards use the names and lines given for the reference. "Get a quote" opens the contact
 * form. The steps and audience blocks describe AURAX; their links depend on who is signed in.
 */

// Account-aware calls to action
const quoteCta = (area) =>
  area === "brand"
    ? { to: "/campaigns/create", label: "Get a quote for this" }
    : area
      ? { to: "/inquiry/form?purpose=campaign", label: "Get a quote for this" }
      : { to: "/brand/signup", label: "Sign up to get a quote" };
const creatorCta = (area) =>
  area === "creator"
    ? { to: "/creator/dashboard", label: "Open your dashboard" }
    : { to: "/creator/signup", label: "Join as a creator" };

// "Get a quote for this" opens the contact form, which sends the request to the AURAX team.
const contactQuote = () => ({ to: "/contact", label: "Get a quote for this" });

// Cards: names and lines as given in the reference. Panel copy is taken from the reference
// panels where they exist; mentions of plans or a client portal (which AURAX has no page for)
// are left out. Services without a reference panel show only their own line.
const SERVICES = [
  {
    id: "social",
    icon: "calendar",
    card: "Social media",
    cardText: "Posts and reels, every month.",
    title: "Social media management",
    intro: "We plan, create, publish and look after your social channels every month.",
    steps: [
      ["Plan", "Build the monthly content calendar from the strategy."],
      ["Create", "Design static and carousel posts. Shoot or make reels."],
      ["Approve", "The client checks the calendar before anything goes live."],
      ["Publish", "Schedule on each platform at the agreed times."],
    ],
    platforms: ["Reddit", "Discord", "Instagram", "Facebook", "YouTube", "Twitter", "LinkedIn", "Threads"],
    note: "Ad spend is always paid by the client, directly to Meta.",
    cta: contactQuote,
  },
  {
    id: "strategy",
    icon: "sparkle",
    card: "Content strategy",
    cardText: "Ideas that make sense.",
    title: "Content strategy",
    intro: "Ideas that make sense.",
    cta: contactQuote,
  },
  {
    id: "shoots",
    icon: "image",
    card: "Shoots and edits",
    cardText: "Reels that look pro.",
    title: "Content creation",
    intro: "Shoots, creators and edits, delivered for each platform.",
    steps: [
      ["Shoot or source", "Plan the shot list, run the shoot, manage creators."],
      ["Edit and deliver", "Edit for each platform and deliver."],
    ],
    cta: contactQuote,
  },
  {
    id: "meta",
    icon: "target",
    card: "Meta ads",
    cardText: "Reach people nearby.",
    title: "Meta ads management",
    intro: "Campaigns that follow your content strategy and are checked every week.",
    steps: [
      ["Agree the goal", "Agree the goal and the audience with the client."],
      ["Set up", "Set up the campaigns and creatives."],
      ["Check weekly", "Check results every week."],
      ["Report and adjust", "Report and adjust. The client pays the ad spend."],
    ],
    note: "Ad spend is paid by the client directly to Meta. We only manage the campaigns.",
    cta: contactQuote,
  },
  {
    id: "influencers",
    icon: "users",
    card: "Influencers",
    cardText: "Creators who fit you.",
    title: "Influencer collaborations",
    intro: "Creators who fit your audience, briefed with your script.",
    steps: [
      ["Find creators", "Find creators who fit the audience."],
      ["Brief", "Brief them with the script."],
      ["Manage", "Manage the shoot and the delivery."],
      ["Edit and post", "Edit, post and add to the calendar."],
    ],
    note: "Every creator on AURAX is reviewed by the team.",
    cta: contactQuote,
    more: { to: "/creators", label: "Browse creators" },
  },
  {
    id: "seo",
    icon: "map-pin",
    card: "Google and SEO",
    cardText: "Show up on Google Maps.",
    title: "Google and SEO",
    intro: "Show up on Google Maps.",
    cta: contactQuote,
  },
  {
    id: "websites",
    icon: "smartphone",
    card: "Websites",
    cardText: "Fast, mobile, WhatsApp-ready.",
    title: "Websites",
    intro: "Fast, mobile, WhatsApp-ready.",
    cta: contactQuote,
  },
];

const PROCESS = [
  { icon: "megaphone", title: "Post", text: "Your brief in a few minutes" },
  { icon: "shield-check", title: "Review", text: "Checked by the AURAX team" },
  { icon: "users", title: "Match", text: "A shortlist of reviewed creators" },
  { icon: "send", title: "Collaborate", text: "We connect you" },
];

const AUDIENCES = [
  {
    id: "brand",
    tab: "Brand",
    icon: "building",
    heading: "What we do for brands",
    quote: "“Great product, but the right creators don't know you exist?”",
    who: "Brands, startups and local businesses",
    wins: ["Reviewed creators only", "Verified numbers", "One point of contact"],
    tiles: [
      { icon: "users", label: "Influencers", open: "influencers" },
      { icon: "image", label: "Shoots and edits", open: "shoots" },
      { icon: "calendar", label: "Social media", open: "social" },
      { icon: "search", label: "Creator discovery", to: "/creators" },
      { icon: "live", label: "LIVE board", to: "/live/campaigns" },
      { icon: "instagram", label: "Verified numbers", to: "/for-creators" },
    ],
    cta: quoteCta,
  },
  {
    id: "creator",
    tab: "Creator",
    icon: "user",
    heading: "What we do for creators",
    quote: "“Great content, but brands can't find you?”",
    who: "Instagram creators in every niche and city",
    wins: ["A public page", "LIVE brand campaigns", "Free to join"],
    tiles: [
      { icon: "link", label: "Your public page", to: "/for-creators" },
      { icon: "instagram", label: "Instagram connect", to: "/for-creators" },
      { icon: "live", label: "LIVE campaigns", to: "/live/campaigns" },
      { icon: "tag", label: "Services and rates", to: "/for-creators" },
      { icon: "check-circle", label: "Team review", to: "/for-creators" },
      { icon: "chat", label: "Contact the team", to: "/contact" },
    ],
    cta: creatorCta,
  },
];

/* ---------- Details panel ---------- */
const ServiceDialog = ({ service, area, onClose }) => {
  const ref = useDialog(true, onClose);
  const [showDetails, setShowDetails] = useState(false);
  const cta = service.cta(area);
  const titleId = `fs-title-${service.id}`;
  const detailsId = `fs-details-${service.id}`;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return createPortal(
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={styles.panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close details">
          <Icon name="x" size={20} strokeWidth={2.2} />
        </button>
        <div className={styles.panelHead}>
          <span className={styles.iconBadge} aria-hidden="true">
            <Icon name={service.icon} size={26} />
          </span>
          <h3 id={titleId} className={styles.panelTitle}>{service.title}</h3>
        </div>
        <p className={styles.panelIntro}>{service.intro}</p>

        {service.steps && (
          <>
        <h4 className={styles.panelLabel}>How we do it</h4>
        <ol className={styles.stepRail} tabIndex={0} aria-label={`How we do it: ${service.steps.length} steps`}>
          {service.steps.map(([title, text], i) => (
            <li key={title} className={styles.stepCard}>
              <span className={styles.stepHead}>
                <span className={styles.stepNum} aria-hidden="true">{i + 1}</span>
                <span className={styles.stepTitle}>{title}</span>
              </span>
              <span className={styles.stepText}>{text}</span>
            </li>
          ))}
        </ol>
          </>
        )}

        {service.platforms && (
          <>
            <h4 className={styles.panelLabel}>Platforms</h4>
            <ul className={styles.chips}>
              {service.platforms.map((p) => (
                <li key={p} className={styles.chip}>{p}</li>
              ))}
            </ul>
          </>
        )}

        {service.details && (
          <div className={styles.accordion}>
            <button
              type="button"
              className={styles.accordionBtn}
              aria-expanded={showDetails}
              aria-controls={detailsId}
              onClick={() => setShowDetails((v) => !v)}
            >
              {service.details.label}
              <Icon name={showDetails ? "x" : "plus"} size={18} strokeWidth={2.4} />
            </button>
            {showDetails && (
              <ul id={detailsId} className={styles.accordionList}>
                {service.details.items.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={16} strokeWidth={2.4} />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {service.note && <p className={styles.note}>{service.note}</p>}

        <div className={styles.actions}>
          <Link to={cta.to} className={styles.ctaBtn} onClick={onClose}>
            {cta.label}
            <Icon name="arrow-right" size={18} strokeWidth={2.2} />
          </Link>
          {service.more && (
            <Link to={service.more.to} className={styles.moreLink} onClick={onClose}>
              {service.more.label}
            </Link>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// Light that follows the pointer across a card (pointer devices only; sets two CSS variables)
const spotlight = (e) => {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
};

const FeatureShowcase = () => {
  const [openId, setOpenId] = useState(null);
  const [audienceId, setAudienceId] = useState("brand");
  const [switched, setSwitched] = useState(false);
  const tabRefs = useRef([]);
  const sectionRef = useRef(null);
  // Looping scenes only where the graphics are hardware-accelerated (same rule as the 3D hero);
  // without a GPU, or with reduced motion, every scene shows a complete still frame.
  const [still] = useState(
    () =>
      webglTier() !== "hardware" ||
      (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
  );
  // The card scenes loop; they stop while the section is scrolled away
  usePauseOffscreen(sectionRef);
  const area = areaForUser(useAuth().currentUser);
  const open = SERVICES.find((s) => s.id === openId);
  const audience = AUDIENCES.find((a) => a.id === audienceId);
  const audienceCta = audience.cta(area);

  // Arrow keys move between the audience tabs
  const onTabKey = (e, i) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + AUDIENCES.length) % AUDIENCES.length;
    setAudienceId(AUDIENCES[next].id);
    setSwitched(true);
    tabRefs.current[next]?.focus();
  };

  return (
    <section ref={sectionRef} className={`${styles.section} ${still ? styles.still : ""}`} aria-labelledby="feature-showcase-title">
      <div className={styles.inner}>
        {/* 1. Everything to get you noticed */}
        <header className={styles.blockHead}>
          <span className={styles.pill}>what we do</span>
          <h2 id="feature-showcase-title" className={styles.title}>
            Everything to get you <span className={styles.mark}>noticed</span>
          </h2>
          <p className={styles.subtitle}>Tap any card to see how it works.</p>
        </header>

        <ul className={styles.grid}>
          {SERVICES.map((s) => (
            <li key={s.id} className={`${styles.cell} ${styles[`at_${s.id}`]}`}>
              <button
                type="button"
                className={styles.card}
                onClick={() => setOpenId(s.id)}
                onPointerMove={spotlight}
                aria-haspopup="dialog"
                aria-label={`${s.card}: ${s.cardText} See how it works`}
              >
                <span className={styles.visual} aria-hidden="true">
                  <ServiceVisual id={s.id} />
                </span>
                <span className={styles.plus} aria-hidden="true">
                  <Icon name="plus" size={18} strokeWidth={2.2} />
                </span>
                <span className={styles.cardBody}>
                  <span className={styles.iconBadge} aria-hidden="true">
                    <Icon name={s.icon} size={20} />
                  </span>
                  <span className={styles.cardTitle}>{s.card}</span>
                  <span className={styles.cardText}>{s.cardText}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* 2. How it works */}
        <header className={`${styles.blockHead} ${styles.spaced}`}>
          <span className={styles.pill}>how it works</span>
          <h2 className={styles.title}>4 steps. Every campaign.</h2>
          <p className={styles.subtitle}>The team reviews everything before it goes live.</p>
        </header>
        <ol className={styles.process}>
          {PROCESS.map((p, i) => (
            <li key={p.title} className={styles.processStep}>
              <span className={`${styles.processCircle} ${i % 2 === 0 ? styles.filled : ""}`} aria-hidden="true">
                <Icon name={p.icon} size={34} strokeWidth={1.9} />
                <span className={styles.processNum}>{i + 1}</span>
              </span>
              <span className={styles.processTitle}>{p.title}</span>
              <span className={styles.processText}>{p.text}</span>
            </li>
          ))}
        </ol>

        {/* 3. Made for you */}
        <header className={`${styles.blockHead} ${styles.spaced}`}>
          <span className={styles.pill}>made for you</span>
          <h2 className={styles.title} aria-live="polite">{audience.heading}</h2>
        </header>
        <div className={styles.tabs} role="tablist" aria-label="Who it's for">
          {AUDIENCES.map((a, i) => (
            <button
              key={a.id}
              ref={(el) => (tabRefs.current[i] = el)}
              type="button"
              role="tab"
              id={`fs-tab-${a.id}`}
              aria-selected={a.id === audienceId}
              aria-controls="fs-audience-panel"
              tabIndex={a.id === audienceId ? 0 : -1}
              className={`${styles.tab} ${a.id === audienceId ? styles.tabActive : ""}`}
              onClick={() => { setAudienceId(a.id); setSwitched(true); }}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              <Icon name={a.icon} size={18} strokeWidth={2} />
              {a.tab}
            </button>
          ))}
        </div>

        <div id="fs-audience-panel" role="tabpanel" aria-labelledby={`fs-tab-${audience.id}`} className={`${styles.highlight} ${switched ? styles.switched : ""}`} key={audience.id}>
          <div className={styles.highlightCopy}>
            <p className={styles.quote}>{audience.quote}</p>
            <p className={styles.who}>{audience.who}</p>
            <ul className={styles.wins}>
              {audience.wins.map((w) => (
                <li key={w} className={styles.win}>
                  <Icon name="check" size={15} strokeWidth={3} />
                  {w}
                </li>
              ))}
            </ul>
            <Link to={audienceCta.to} className={styles.ctaBtn}>
              {audienceCta.label}
              <Icon name="arrow-right" size={18} strokeWidth={2.2} />
            </Link>
          </div>
          <ul className={styles.tiles}>
            {audience.tiles.map((t) => (
              <li key={t.label}>
                {t.open ? (
                  <button type="button" className={styles.tile} onClick={() => setOpenId(t.open)} aria-haspopup="dialog">
                    <Icon name={t.icon} size={26} />
                    <span>{t.label}</span>
                  </button>
                ) : (
                  <Link to={t.to} className={styles.tile}>
                    <Icon name={t.icon} size={26} />
                    <span>{t.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {open && <ServiceDialog service={open} area={area} onClose={() => setOpenId(null)} />}
    </section>
  );
};

export default FeatureShowcase;
