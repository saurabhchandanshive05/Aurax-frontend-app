import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiEndpoint } from "../utils/getApiUrl";
import Icon from "../components/ui/Icon";
import styles from "./BrandDashboard.module.css";

/*
 * Brand home. Shows only real data: the LIVE board counts come from
 * /api/public/campaigns/stats/overview (read-only, no view tracking).
 * "Your campaigns" lists the brand's own self-service campaigns from
 * /api/campaigns/mine, with their review status.
 */
const STATUS = {
  draft: { label: "In review", tone: "review" },
  live: { label: "Live", tone: "live" },
  paused: { label: "Paused", tone: "muted" },
  closed: { label: "Closed", tone: "muted" },
  archived: { label: "Archived", tone: "muted" },
};

const formatBudget = (b) => {
  if (!b || (b.min == null && b.max == null)) return "Budget not set";
  const f = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  if (b.min != null && b.max != null) return b.min === b.max ? f(b.min) : `${f(b.min)} – ${f(b.max)}`;
  return b.min != null ? `From ${f(b.min)}` : `Up to ${f(b.max)}`;
};

const BrandDashboard = () => {
  const { currentUser } = useAuth();
  const [live, setLive] = useState({ status: "loading", total: 0, handPicked: 0 });
  const [mine, setMine] = useState({ status: "loading", list: [] });

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    fetch(getApiEndpoint("/api/campaigns/mine"), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => !cancelled && setMine({ status: "ready", list: json.campaigns || [] }))
      .catch(() => !cancelled && setMine({ status: "error", list: [] }));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(getApiEndpoint("/api/public/campaigns/stats/overview"))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        if (cancelled) return;
        setLive({
          status: "ready",
          total: json?.data?.totalLiveCampaigns ?? 0,
          handPicked: json?.data?.handPickedCampaigns ?? 0,
        });
      })
      .catch(() => !cancelled && setLive((s) => ({ ...s, status: "error" })));
    return () => {
      cancelled = true;
    };
  }, []);

  const name = currentUser?.companyName || currentUser?.fullName || currentUser?.name || currentUser?.username;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{name ? `Welcome, ${name}` : "Welcome"}</h1>
        <p>Create campaigns, find creators, and watch the LIVE board for creators ready to work.</p>
      </header>

      <Link to="/live/campaigns" className={styles.liveStrip}>
        <span className={styles.liveDot} aria-hidden="true" />
        <span className={styles.liveText}>
          <strong>LIVE board</strong>
          {live.status === "ready" && (
            <span>
              {live.total} live {live.total === 1 ? "campaign" : "campaigns"}
              {live.handPicked > 0 ? `, ${live.handPicked} hand-picked by our team` : ""}
            </span>
          )}
          {live.status === "loading" && <span>Checking what's live…</span>}
          {live.status === "error" && <span>See what brands are running right now</span>}
        </span>
        <span className={styles.liveGo}>
          Open board <Icon name="arrow-right" size={16} />
        </span>
      </Link>

      <div className={styles.grid}>
        <section className={styles.panel} aria-labelledby="bd-campaigns">
          <div className={styles.panelHead}>
            <h2 id="bd-campaigns">Your campaigns</h2>
            {mine.list.length > 0 && (
              <Link to="/campaigns/create" className="ax-btn ax-btn--ghost">
                <Icon name="plus" size={16} /> New campaign
              </Link>
            )}
          </div>
          {mine.status === "loading" && <p className={styles.panelText}>Loading your campaigns…</p>}
          {mine.status === "error" && (
            <p className={styles.panelText} role="alert">
              Your campaigns couldn't be loaded. Refresh the page to try again.
            </p>
          )}
          {mine.status === "ready" && mine.list.length > 0 && (
            <ul className={styles.campaignList}>
              {mine.list.map((c) => {
                const st = STATUS[c.status] || { label: c.status, tone: "muted" };
                const body = (
                  <>
                    <span className={styles.campaignMain}>
                      <span className={styles.campaignTitle}>{c.intent}</span>
                      <span className={styles.campaignMeta}>
                        {[c.platform, formatBudget(c.budget), `${c.creatorsNeeded || 1} ${c.creatorsNeeded === 1 ? "creator" : "creators"}`]
                          .filter(Boolean)
                          .join(" • ")}
                      </span>
                    </span>
                    <span className={`${styles.status} ${styles[`status_${st.tone}`]}`}>{st.label}</span>
                  </>
                );
                return (
                  <li key={c.id}>
                    {c.status === "live" ? (
                      <Link to={`/live/campaigns/${c.id}`} className={styles.campaignRow}>
                        {body}
                      </Link>
                    ) : (
                      <div className={styles.campaignRow}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {mine.status === "ready" && mine.list.some((c) => c.status === "draft") && (
            <p className={styles.panelNote}>
              Campaigns in review go live on the LIVE board once the AURAX team has checked them.
            </p>
          )}
          {mine.status !== "loading" && mine.list.length === 0 && (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>
                <Icon name="megaphone" size={24} />
              </span>
              <p className={styles.emptyTitle}>No campaigns yet</p>
              <p className={styles.emptyText}>
                Describe what you need: platform, niche, city, budget and timeline. Our team reviews it and publishes it
                on the LIVE board for creators.
              </p>
              <Link to="/campaigns/create" className="ax-btn ax-btn--primary">
                Create a campaign
              </Link>
            </div>
          )}
        </section>

        <div className={styles.side}>
          <section className={styles.panel} aria-labelledby="bd-find">
            <h2 id="bd-find">Find creators</h2>
            <p className={styles.panelText}>Browse reviewed creators by niche, city and audience size.</p>
            <Link to="/creators" className="ax-btn ax-btn--ghost">
              <Icon name="search" size={16} /> Browse creators
            </Link>
          </section>

          <section className={styles.panel} aria-labelledby="bd-help">
            <h2 id="bd-help">Need a hand?</h2>
            <p className={styles.panelText}>Planning a launch or a large campaign? Message the AURAX team directly.</p>
            <Link to="/messages?new=1" className={styles.textLink}>
              Message the team <Icon name="arrow-right" size={16} />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;
