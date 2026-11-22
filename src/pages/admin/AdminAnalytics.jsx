import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { getApiEndpoint } from "../../utils/getApiUrl";
import styles from "./AdminAnalytics.module.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

// Series colours validated for the dark night surface (dataviz validator: lightness band, CVD,
// contrast all pass). Tritan separation is in the 6-8 floor band, so brands also get a dashed
// line and both series are labelled: identity never relies on colour alone.
const SERIES = {
  creator: { label: "Creators", color: "#22a0b8", dash: [] },
  brand: { label: "Brands", color: "#8b7cf6", dash: [6, 4] },
};
const RANGES = [7, 30, 90];

const ROLE_LABELS = { creator: "Creators", brand: "Brands", admin: "Admins", none: "No role" };
const REVIEW = [
  { key: "approved", label: "Approved", tone: "success" },
  { key: "pending", label: "Waiting for review", tone: "warning" },
  { key: "rejected", label: "Rejected", tone: "danger" },
  { key: "not_submitted", label: "Not submitted yet", tone: "muted" },
];
const CAMPAIGN_LABELS = { live: "Live", draft: "Draft", paused: "Paused", closed: "Closed" };
const PURPOSE_LABELS = { campaign: "Campaign brief", connect: "Connect", chat: "Chat", call: "Call" };

const fmtDay = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
};

// Horizontal bar list: label, bar (share of the largest), value. No axes needed.
const BarList = ({ rows, tone }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className={styles.barList}>
      {rows.map((r) => (
        <li key={r.label} className={styles.barRow}>
          <span className={styles.barLabel}>{r.label}</span>
          <span className={styles.barTrack} aria-hidden="true">
            <span
              className={`${styles.barFill} ${styles[r.tone || tone || "neutral"]}`}
              style={{ width: `${r.value ? Math.max(2, (r.value / max) * 100) : 0}%` }}
            />
          </span>
          <span className={styles.barValue}>{r.value.toLocaleString("en-IN")}</span>
        </li>
      ))}
    </ul>
  );
};

const AdminAnalytics = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    document.title = "Analytics | AURAX admin";
  }, []);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch(getApiEndpoint(`/api/admin/analytics?days=${days}`), {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.message || `HTTP ${res.status}`);
      setData(json);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const chart = useMemo(() => {
    if (!data) return null;
    const labels = data.signups.map((d) => fmtDay(d.day));
    const datasets = ["creator", "brand"].map((key) => ({
      label: SERIES[key].label,
      data: data.signups.map((d) => d[key]),
      borderColor: SERIES[key].color,
      backgroundColor: SERIES[key].color,
      borderWidth: 2,
      borderDash: SERIES[key].dash,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHitRadius: 12,
      tension: 0.25,
    }));
    return { labels, datasets };
  }, [data]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? false : { duration: 300 },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          align: "start",
          labels: { color: "#c9c4e8", usePointStyle: true, pointStyle: "line", boxWidth: 24 },
        },
        tooltip: {
          backgroundColor: "#0f0c24",
          borderColor: "rgba(196, 188, 255, 0.24)",
          borderWidth: 1,
          titleColor: "#f3f1ff",
          bodyColor: "#c9c4e8",
          padding: 10,
          callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}` },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { color: "rgba(196, 188, 255, 0.24)" },
          ticks: { color: "#9a94c2", maxTicksLimit: 8, maxRotation: 0 },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(196, 188, 255, 0.08)" },
          border: { display: false },
          ticks: { color: "#9a94c2", precision: 0, maxTicksLimit: 5 },
        },
      },
    }),
    []
  );

  const totals = useMemo(() => {
    if (!data) return null;
    return data.signups.reduce((a, d) => ({ creator: a.creator + d.creator, brand: a.brand + d.brand }), { creator: 0, brand: 0 });
  }, [data]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.lede}>Live counts from the AURAX database.</p>
        </div>
        <div className={styles.range} role="group" aria-label="Time range">
          {RANGES.map((d) => (
            <button
              key={d}
              type="button"
              className={`${styles.rangeBtn} ${d === days ? styles.rangeActive : ""}`}
              aria-pressed={d === days}
              onClick={() => setDays(d)}
            >
              {d} days
            </button>
          ))}
        </div>
      </header>

      {status === "error" && (
        <div className={styles.state} role="alert">
          <h2>Analytics couldn't load</h2>
          <p>Check your connection and try again.</p>
          <button type="button" className="ax-btn ax-btn--primary" onClick={load}>
            Try again
          </button>
        </div>
      )}

      {status === "loading" && !data && (
        <div className={styles.tiles} aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={`${styles.tile} ${styles.placeholder}`} />
          ))}
        </div>
      )}

      {data && (
        <div className={status === "loading" ? styles.refreshing : undefined} aria-busy={status === "loading"}>
          <dl className={styles.tiles}>
            <div className={styles.tile}>
              <dt>Accounts</dt>
              <dd>{data.users.total.toLocaleString("en-IN")}</dd>
              <span className={styles.tileNote}>{data.users.emailVerified.toLocaleString("en-IN")} email-verified</span>
            </div>
            <div className={styles.tile}>
              <dt>Creators with a public page</dt>
              <dd>{data.creators.publicPages.toLocaleString("en-IN")}</dd>
              <span className={styles.tileNote}>{(data.creators.byReviewStatus.pending || 0).toLocaleString("en-IN")} waiting for review</span>
            </div>
            <div className={styles.tile}>
              <dt>Live campaigns</dt>
              <dd>{(data.campaigns.byStatus.live || 0).toLocaleString("en-IN")}</dd>
              <span className={styles.tileNote}>{data.campaigns.brandDraftsAwaitingReview} brand drafts to review</span>
            </div>
            <div className={styles.tile}>
              <dt>Open conversations</dt>
              <dd>{data.messages.open.toLocaleString("en-IN")}</dd>
              <span className={styles.tileNote}>{data.messages.waitingForTeam} waiting for a reply</span>
            </div>
          </dl>

          <section className={styles.card} aria-labelledby="signups-title">
            <div className={styles.cardHead}>
              <h2 id="signups-title">New accounts per day</h2>
              <button type="button" className={styles.linkBtn} onClick={() => setShowTable((v) => !v)} aria-expanded={showTable}>
                {showTable ? "Show chart" : "Show as table"}
              </button>
            </div>
            <p className={styles.cardNote}>
              Last {data.days} days: {totals.creator} creators, {totals.brand} brands
            </p>
            {showTable ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <caption className={styles.srOnly}>New accounts per day</caption>
                  <thead>
                    <tr><th scope="col">Day</th><th scope="col">Creators</th><th scope="col">Brands</th></tr>
                  </thead>
                  <tbody>
                    {[...data.signups].reverse().map((d) => (
                      <tr key={d.day}><th scope="row">{fmtDay(d.day)}</th><td>{d.creator}</td><td>{d.brand}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.chartBox}>
                <Line data={chart} options={chartOptions} aria-label="Line chart of new creator and brand accounts per day" role="img" />
                <ul className={styles.endLabels} aria-hidden="true">
                  <li style={{ color: SERIES.creator.color }}>Creators</li>
                  <li style={{ color: SERIES.brand.color }}>Brands</li>
                </ul>
              </div>
            )}
          </section>

          <div className={styles.grid}>
            <section className={styles.card} aria-labelledby="roles-title">
              <h2 id="roles-title">Accounts by role</h2>
              <BarList
                rows={Object.entries(data.users.byRole)
                  .map(([k, v]) => ({ label: ROLE_LABELS[k] || k, value: v }))
                  .sort((a, b) => b.value - a.value)}
              />
            </section>
            <section className={styles.card} aria-labelledby="review-title">
              <h2 id="review-title">Creator review</h2>
              <BarList rows={REVIEW.map((r) => ({ label: r.label, value: data.creators.byReviewStatus[r.key] || 0, tone: r.tone }))} />
            </section>
            <section className={styles.card} aria-labelledby="campaigns-title">
              <h2 id="campaigns-title">Campaigns by status</h2>
              <BarList rows={Object.keys(CAMPAIGN_LABELS).map((k) => ({ label: CAMPAIGN_LABELS[k], value: data.campaigns.byStatus[k] || 0 }))} />
              <p className={styles.cardNote}>{data.campaigns.totalViews.toLocaleString("en-IN")} campaign views in total</p>
            </section>
            <section className={styles.card} aria-labelledby="inquiries-title">
              <h2 id="inquiries-title">Inquiries</h2>
              <BarList rows={Object.keys(PURPOSE_LABELS).map((k) => ({ label: PURPOSE_LABELS[k], value: data.inquiries.byPurpose[k] || 0 }))} />
              <p className={styles.cardNote}>{data.inquiries.inPeriod} in the last {data.days} days</p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
