import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiEndpoint } from "../utils/getApiUrl";
import Icon from "../components/ui/Icon";
import styles from "./BrandDashboard.module.css";

/*
 * Brand home. Shows only real data: the LIVE board counts come from
 * /api/public/campaigns/stats/overview (read-only, no view tracking).
 * Brand-side campaign tracking has no backend yet, so that area is an
 * honest empty state pointing at the features that do work.
 */
const BrandDashboard = () => {
  const { currentUser } = useAuth();
  const [live, setLive] = useState({ status: "loading", total: 0, handPicked: 0 });

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
        <p>Find creators, post what you need, and watch the LIVE board for creators ready to work.</p>
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
          <h2 id="bd-campaigns">Your campaigns</h2>
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <Icon name="megaphone" size={24} />
            </span>
            <p className={styles.emptyTitle}>No campaigns yet</p>
            <p className={styles.emptyText}>
              Tell us what you need: niche, city, budget and timeline. Our team shortlists reviewed creators and
              gets back to you.
            </p>
            <Link to="/inquiry/form" className="ax-btn ax-btn--primary">
              Post a requirement
            </Link>
          </div>
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
            <p className={styles.panelText}>Planning a launch or a large campaign? Talk to the AURAX team directly.</p>
            <Link to="/contact" className={styles.textLink}>
              Contact us <Icon name="arrow-right" size={16} />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;
