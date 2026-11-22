import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiEndpoint } from "../utils/getApiUrl";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/ui/Icon";
import styles from "./CreateCampaign.module.css";

// Self-service campaign for brands. It is saved as a draft and the AURAX team reviews it before
// it goes live on the LIVE board (POST /api/campaigns).
const EMPTY = {
  brandName: "",
  intent: "",
  objective: "",
  description: "",
  deliverables: "",
  platform: "Instagram",
  category: "",
  locations: "",
  budgetMin: "",
  budgetMax: "",
  followersMin: "",
  followersMax: "",
  creatorsNeeded: "1",
  timeline: "",
};

const Field = ({ id, label, hint, error, children }) => (
  <div className={styles.field}>
    <label htmlFor={id} className={styles.label}>{label}</label>
    {hint && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}
    {children}
    {error && <p id={`${id}-error`} className={styles.error}>{error}</p>}
  </div>
);

const CreateCampaign = () => {
  const { currentUser } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [platforms, setPlatforms] = useState(["Instagram"]);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | saving | done | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.title = "Create a campaign | AURAX";
    fetch(getApiEndpoint("/api/campaigns/options"), {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.platforms?.length && setPlatforms(j.platforms))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (currentUser?.name && !form.brandName) setForm((f) => ({ ...f, brandName: currentUser.name }));
    // only prefill once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };

  const fieldProps = (key) => ({
    id: `cc-${key}`,
    name: key,
    value: form[key],
    onChange: set(key),
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `cc-${key}-error` : undefined,
  });

  const submit = async (e) => {
    e.preventDefault();
    if (status === "saving") return;
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch(getApiEndpoint("/api/campaigns"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          ...form,
          deliverables: form.deliverables.split("\n"),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setErrors(json?.errors || {});
        setMessage(json?.message || "The campaign wasn't saved. Please try again.");
        setStatus("error");
        const first = json?.errors && Object.keys(json.errors)[0];
        if (first) document.getElementById(`cc-${first}`)?.focus();
        return;
      }
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setMessage("We couldn't reach AURAX. Check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <main className={styles.page}>
        <section className={styles.done} role="status">
          <span className={styles.doneIcon}><Icon name="check" size={28} strokeWidth={2.4} /></span>
          <h1>Campaign submitted for review</h1>
          <p>
            The AURAX team checks every campaign before it goes live. Once it's approved it appears on
            the LIVE board and creators who fit can tell us they're interested. You'll find it under
            "Your campaigns" on your dashboard.
          </p>
          <div className={styles.actions}>
            <Link to="/brand/dashboard" className="ax-btn ax-btn--primary">Go to your dashboard</Link>
            <button type="button" className="ax-btn ax-btn--ghost" onClick={() => { setForm({ ...EMPTY, brandName: form.brandName }); setStatus("idle"); }}>
              Create another
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Create a campaign</h1>
        <p className={styles.lede}>
          Describe what you need. The AURAX team reviews it, then publishes it on the LIVE board for
          reviewed creators.
        </p>
      </header>

      <form className={styles.form} onSubmit={submit} noValidate>
        <fieldset className={styles.group}>
          <legend>The brief</legend>
          <Field id="cc-brandName" label="Brand name" error={errors.brandName}>
            <input {...fieldProps("brandName")} maxLength={120} required />
          </Field>
          <Field id="cc-intent" label="What do you need?" hint="One line creators will see first, e.g. “Reels reviewing our new running shoe”" error={errors.intent}>
            <input {...fieldProps("intent")} maxLength={200} required />
          </Field>
          <Field id="cc-objective" label="Goal" hint="Awareness, sales, app installs…" error={errors.objective}>
            <input {...fieldProps("objective")} maxLength={600} required />
          </Field>
          <Field id="cc-description" label="Details (optional)" error={errors.description}>
            <textarea {...fieldProps("description")} rows={4} maxLength={3000} />
          </Field>
          <Field id="cc-deliverables" label="Deliverables (optional)" hint="One per line, e.g. “1 reel”, “3 stories”" error={errors.deliverables}>
            <textarea {...fieldProps("deliverables")} rows={3} />
          </Field>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Who you're looking for</legend>
          <div className={styles.row}>
            <Field id="cc-platform" label="Platform" error={errors.platform}>
              <select {...fieldProps("platform")}>
                {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field id="cc-creatorsNeeded" label="Creators needed" error={errors.creatorsNeeded}>
              <input {...fieldProps("creatorsNeeded")} type="number" min={1} max={500} inputMode="numeric" />
            </Field>
          </div>
          <Field id="cc-category" label="Niches (optional)" hint="Separate with commas, e.g. Fitness, Lifestyle" error={errors.category}>
            <input {...fieldProps("category")} />
          </Field>
          <Field id="cc-locations" label="Cities (optional)" hint="Separate with commas" error={errors.locations}>
            <input {...fieldProps("locations")} />
          </Field>
          <div className={styles.row}>
            <Field id="cc-followersMin" label="Followers, from (optional)" error={errors.followersMin}>
              <input {...fieldProps("followersMin")} type="number" min={0} inputMode="numeric" />
            </Field>
            <Field id="cc-followersMax" label="Followers, up to (optional)" error={errors.followersMax}>
              <input {...fieldProps("followersMax")} type="number" min={0} inputMode="numeric" />
            </Field>
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Budget and timing</legend>
          <div className={styles.row}>
            <Field id="cc-budgetMin" label="Budget from, ₹ (optional)" error={errors.budgetMin}>
              <input {...fieldProps("budgetMin")} type="number" min={0} inputMode="numeric" />
            </Field>
            <Field id="cc-budgetMax" label="Budget up to, ₹ (optional)" error={errors.budgetMax}>
              <input {...fieldProps("budgetMax")} type="number" min={0} inputMode="numeric" />
            </Field>
          </div>
          <Field id="cc-timeline" label="Timeline (optional)" hint="e.g. “Posts in the first week of March”" error={errors.timeline}>
            <input {...fieldProps("timeline")} maxLength={120} />
          </Field>
        </fieldset>

        {message && <p className={styles.formError} role="alert">{message}</p>}
        <div className={styles.actions}>
          <button type="submit" className="ax-btn ax-btn--primary" disabled={status === "saving"}>
            {status === "saving" ? "Submitting…" : "Submit for review"}
          </button>
          <Link to="/brand/dashboard" className="ax-btn ax-btn--ghost">Cancel</Link>
        </div>
      </form>
    </main>
  );
};

export default CreateCampaign;
