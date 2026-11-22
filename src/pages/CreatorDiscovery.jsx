import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getApiEndpoint } from "../utils/getApiUrl";
import styles from "./CreatorDiscovery.module.css";

// Find creators: approved AURAX creators who have published a public page. Real data from
// GET /api/public/creators; each card opens the creator's existing public page (/creator/:slug).

const PAGE_SIZE = 24;

const formatCount = (n) => {
  if (n === null || n === undefined) return null;
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, "")}K`;
  return String(n);
};

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M20 20l-3.5-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CreatorCard = ({ c }) => {
  const verified = c.followers !== null && c.followers !== undefined;
  const count = formatCount(verified ? c.followers : c.declaredFollowers);
  return (
    <li className={styles.card}>
      <Link to={`/creator/${c.slug}`} className={styles.cardLink} aria-label={`View ${c.name}'s profile`}>
        <div className={styles.cardTop}>
          {c.image ? (
            <img className={styles.avatar} src={c.image} alt="" loading="lazy" decoding="async" />
          ) : (
            <span className={styles.avatarFallback} aria-hidden="true">
              {(c.name || "?").trim().charAt(0).toUpperCase()}
            </span>
          )}
          <div className={styles.who}>
            <h3 className={styles.name}>{c.name}</h3>
            {c.instagram && <p className={styles.handle}>@{c.instagram.replace(/^@/, "")}</p>}
          </div>
        </div>
        {c.bio && <p className={styles.bio}>{c.bio}</p>}
        <div className={styles.meta}>
          {c.niche && <span className={styles.chip}>{c.niche}</span>}
          {c.location && (
            <span className={styles.metaItem}>
              <PinIcon />
              {c.location}
            </span>
          )}
        </div>
        <div className={styles.stats}>
          {count ? (
            <span className={styles.followers}>
              <strong>{count}</strong> followers
              {verified ? (
                <span className={styles.verified} title="From the creator's connected Instagram account">
                  <CheckIcon />
                  Verified
                </span>
              ) : (
                <span className={styles.declared}>self-reported</span>
              )}
            </span>
          ) : (
            <span className={styles.followersMuted}>Follower count not shared</span>
          )}
          <span className={styles.cta}>View profile</span>
        </div>
      </Link>
    </li>
  );
};

const CreatorDiscovery = () => {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [niche, setNiche] = useState("");
  const [niches, setNiches] = useState([]);
  const [creators, setCreators] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [loadingMore, setLoadingMore] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    document.title = "Find creators | AURAX";
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(
    async (nextPage) => {
      const id = ++requestId.current;
      const params = new URLSearchParams({ page: String(nextPage), limit: String(PAGE_SIZE) });
      if (debounced) params.set("q", debounced);
      if (niche) params.set("niche", niche);
      if (nextPage === 1) setStatus("loading");
      else setLoadingMore(true);
      try {
        const res = await fetch(getApiEndpoint(`/api/public/creators?${params}`));
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) throw new Error(json?.message || `HTTP ${res.status}`);
        if (id !== requestId.current) return; // a newer search replaced this one
        setCreators((prev) => (nextPage === 1 ? json.creators : [...prev, ...json.creators]));
        setNiches(json.niches || []);
        setTotal(json.total || 0);
        setHasMore(!!json.hasMore);
        setPage(nextPage);
        setStatus("ready");
      } catch {
        if (id !== requestId.current) return;
        if (nextPage === 1) setStatus("error");
      } finally {
        if (id === requestId.current) setLoadingMore(false);
      }
    },
    [debounced, niche]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const filtered = !!(debounced || niche);
  const clearFilters = () => {
    setQuery("");
    setDebounced("");
    setNiche("");
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Find creators</h1>
        <p className={styles.lede}>
          Every creator here has been reviewed by the AURAX team and has a public page you can open.
        </p>
      </header>

      <form className={styles.filters} role="search" onSubmit={(e) => e.preventDefault()}>
        <label className={styles.searchField}>
          <span className={styles.srOnly}>Search creators</span>
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, niche or city"
            maxLength={60}
          />
        </label>
        <label className={styles.selectField}>
          <span className={styles.srOnly}>Niche</span>
          <select value={niche} onChange={(e) => setNiche(e.target.value)}>
            <option value="">All niches</option>
            {niches.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </form>

      <p className={styles.count} aria-live="polite">
        {status === "ready" &&
          (total === 1 ? "1 creator" : `${total} creators`) + (filtered ? " match your search" : "")}
      </p>

      {status === "loading" && (
        <ul className={styles.grid} aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className={`${styles.card} ${styles.placeholder}`} />
          ))}
        </ul>
      )}

      {status === "error" && (
        <div className={styles.state} role="alert">
          <h2>We couldn't load creators</h2>
          <p>Check your connection and try again.</p>
          <button type="button" className="ax-btn ax-btn--primary" onClick={() => load(1)}>
            Try again
          </button>
        </div>
      )}

      {status === "ready" && creators.length === 0 && (
        <div className={styles.state}>
          {filtered ? (
            <>
              <h2>No creators match that search</h2>
              <p>Try a different name, niche or city.</p>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={clearFilters}>
                Clear search
              </button>
            </>
          ) : (
            <>
              <h2>No public creator pages yet</h2>
              <p>
                Creators appear here once they're approved and publish their page. Tell us what you
                need and we'll shortlist creators for you.
              </p>
              <Link to="/inquiry/form?purpose=campaign" className="ax-btn ax-btn--primary">
                Post a requirement
              </Link>
            </>
          )}
        </div>
      )}

      {status === "ready" && creators.length > 0 && (
        <>
          <ul className={styles.grid}>
            {creators.map((c) => (
              <CreatorCard key={c.slug} c={c} />
            ))}
          </ul>
          {hasMore && (
            <div className={styles.more}>
              <button
                type="button"
                className="ax-btn ax-btn--ghost"
                onClick={() => load(page + 1)}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : "Load more creators"}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default CreatorDiscovery;
