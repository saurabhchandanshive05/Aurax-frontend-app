import React, { useEffect, useState } from "react";
import { getApiEndpoint } from "../../utils/getApiUrl";
import Icon from "../../components/ui/Icon";
import styles from "./AdLibrary.module.css";

// Admin research: what a brand's Facebook page is advertising, from Meta's Ad Library (official
// Graph API). Results are cached by the backend for 6 hours. POST /api/meta/ad-library/fetch.
const COUNTRIES = [
  ["IN", "India"],
  ["US", "United States"],
  ["GB", "United Kingdom"],
  ["AE", "United Arab Emirates"],
  ["SG", "Singapore"],
];

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null);

const AdLibrary = () => {
  const [pageId, setPageId] = useState("");
  const [country, setCountry] = useState("IN");
  const [activeStatus, setActiveStatus] = useState("ACTIVE");
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    document.title = "Ad Library research | AURAX admin";
  }, []);

  const search = async (e, forceRefresh = false) => {
    if (e) e.preventDefault();
    const id = pageId.trim();
    if (!/^\d{5,20}$/.test(id)) {
      setError({ title: "Enter a Facebook page ID", text: "Page IDs are numbers, e.g. 123456789012345. You'll find it under the page's About → Page transparency." });
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(getApiEndpoint("/api/meta/ad-library/fetch"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ pageId: id, country, activeStatus, limit: 50, forceRefresh }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        const notConfigured = /not configured/i.test(json?.message || "");
        setError(
          notConfigured
            ? { title: "Meta Ad Library isn't connected", text: "The server has no Meta Ad Library access token. Set META_AD_LIBRARY_ACCESS_TOKEN in the backend environment, then try again." }
            : res.status === 403
            ? { title: "Admins only", text: "Ad Library research is available to the AURAX team." }
            : { title: "Meta didn't return the ads", text: json?.message || "Please try again in a moment." }
        );
        setStatus("error");
        return;
      }
      setResult(json);
      setStatus("ready");
    } catch {
      setError({ title: "We couldn't reach AURAX", text: "Check your connection and try again." });
      setStatus("error");
    }
  };

  const s = result?.summary;
  const libraryUrl = s ? `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${encodeURIComponent(s.country || country)}&view_all_page_id=${encodeURIComponent(s.pageId)}` : null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ad Library research</h1>
        <p className={styles.lede}>
          See which ads a brand's Facebook page is running, straight from Meta's Ad Library. Results
          are cached for 6 hours.
        </p>
      </header>

      <form className={styles.search} onSubmit={search}>
        <label className={styles.field}>
          <span>Facebook page ID</span>
          <input
            value={pageId}
            onChange={(e) => setPageId(e.target.value.replace(/[^\d]/g, ""))}
            inputMode="numeric"
            placeholder="e.g. 123456789012345"
            maxLength={20}
          />
        </label>
        <label className={styles.field}>
          <span>Country</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {COUNTRIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className={styles.field}>
          <span>Ads</span>
          <select value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)}>
            <option value="ACTIVE">Active now</option>
            <option value="ALL">All</option>
          </select>
        </label>
        <button type="submit" className="ax-btn ax-btn--primary" disabled={status === "loading"}>
          <Icon name="search" size={16} /> {status === "loading" ? "Looking up…" : "Look up ads"}
        </button>
      </form>

      {status === "error" && error && (
        <div className={styles.notice} role="alert">
          <Icon name="alert" size={20} />
          <div>
            <strong>{error.title}</strong>
            <p>{error.text}</p>
            {pageId && error.title !== "Admins only" && (
              <a
                className={styles.noticeLink}
                href={`https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${encodeURIComponent(country === "ALL" ? "ALL" : country)}&view_all_page_id=${encodeURIComponent(pageId)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open this page in Meta's public Ad Library <Icon name="external" size={14} />
              </a>
            )}
          </div>
        </div>
      )}

      {status === "idle" && (
        <div className={styles.state}>
          <Icon name="radar" size={28} />
          <p>Enter a page ID to see its ads.</p>
        </div>
      )}

      {status === "ready" && s && (
        <>
          <section className={styles.summary} aria-label="Page summary">
            <div>
              <h2>{s.pageName || `Page ${s.pageId}`}</h2>
              <p className={styles.muted}>
                Page ID {s.pageId} · {(COUNTRIES.find(([v]) => v === s.country) || [s.country, s.country])[1]} ·{" "}
                {result.cached ? `Cached ${fmtDate(s.lastFetchedAt) || ""}` : "Just fetched from Meta"}
              </p>
            </div>
            <dl className={styles.facts}>
              <div><dt>Active ads</dt><dd>{(s.activeAdsCount ?? result.ads.length).toLocaleString("en-IN")}</dd></div>
              <div><dt>Platforms</dt><dd>{(s.platforms || []).length ? s.platforms.join(", ") : "—"}</dd></div>
            </dl>
            <div className={styles.summaryActions}>
              <a href={libraryUrl} target="_blank" rel="noopener noreferrer" className="ax-btn ax-btn--ghost">
                Open in Meta Ad Library <Icon name="external" size={14} />
              </a>
              {result.cached && (
                <button type="button" className="ax-btn ax-btn--ghost" onClick={() => search(null, true)}>
                  <Icon name="refresh" size={14} /> Refresh from Meta
                </button>
              )}
            </div>
          </section>

          {result.ads.length === 0 ? (
            <div className={styles.state}>
              <p>No {activeStatus === "ACTIVE" ? "active " : ""}ads found for this page in this country.</p>
            </div>
          ) : (
            <ul className={styles.ads}>
              {result.ads.map((ad) => (
                <li key={ad.id} className={styles.ad}>
                  {ad.title && <h3>{ad.title}</h3>}
                  {ad.body ? <p className={styles.body}>{ad.body}</p> : <p className={styles.muted}>No ad text (image or video only).</p>}
                  <div className={styles.adMeta}>
                    {ad.platforms?.length > 0 && <span>{ad.platforms.join(", ")}</span>}
                    {ad.startedAt && <span>Running since {fmtDate(ad.startedAt)}</span>}
                    {ad.stoppedAt && <span>Stopped {fmtDate(ad.stoppedAt)}</span>}
                    <a href={ad.libraryUrl} target="_blank" rel="noopener noreferrer">
                      View ad <Icon name="external" size={12} />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default AdLibrary;
