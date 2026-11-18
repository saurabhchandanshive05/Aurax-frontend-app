import React, { useEffect, useRef, useState } from "react";
import useDeferredStart from "../hooks/useDeferredStart";
import styles from "./styles/ContactUs.module.css";

const ContactUs = () => {
  const containerRef = useRef(null);
  const started = useDeferredStart(containerRef);
  const stackRef = useRef(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText("connect@aurax.io");
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  // Reveal on entering the viewport (no scroll-linked library needed)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The invitation stack leans toward the pointer (CSS variables only)
  const onTilt = (e) => {
    if (e.pointerType !== "mouse" || !stackRef.current) return;
    const r = stackRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    stackRef.current.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
    stackRef.current.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
  };
  const resetTilt = () => {
    if (!stackRef.current) return;
    stackRef.current.style.setProperty("--ry", "0deg");
    stackRef.current.style.setProperty("--rx", "0deg");
  };

  return (
    <section
      ref={containerRef}
      data-defer-idle={started ? undefined : ""}
      className={`${styles.section} ${revealed ? styles.isRevealed : ""}`}
      aria-labelledby="contact-cta-title"
    >
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.light} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={`${styles.leftContent} contact-left`}>
            <h2 id="contact-cta-title" className={styles.heading}>
              <span className={styles.headingText}>Step Into the Aura — Let's Connect</span>
              <span className={styles.sparkle} role="img" aria-label="sparkle">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.5l1.9 6.1 6.1 1.9-6.1 1.9L12 18.5l-1.9-6.1L4 10.5l6.1-1.9z" fill="currentColor" />
                </svg>
              </span>
            </h2>

            <p className={styles.description}>
              Whether you're a visionary brand or a bold creator, AURAX is where
              influence meets innovation. Let's shape stories, spark
              connections, and achieve impact together.
            </p>

            <div className={styles.emailContainer}>
              <button
                type="button"
                className={`${styles.emailDisplay} ${emailCopied ? styles.isCopied : ""}`}
                onClick={copyToClipboard}
                aria-label="Copy email address"
              >
                <span className={styles.mailTile} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className={styles.emailLink}>hello@auraxai.in</span>
                <span className={styles.copyIcon} title="Copy to clipboard" aria-hidden="true">
                  {emailCopied ? (
                    <svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M16 5.5A2 2 0 0 0 14 4H6a2 2 0 0 0-2 2v8a2 2 0 0 0 1.5 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  )}
                  <span>{emailCopied ? "Copied" : "Copy"}</span>
                </span>
              </button>
              <span className={styles.srOnly} aria-live="polite">
                {emailCopied ? "Email address copied" : ""}
              </span>
            </div>
          </div>

          <div
            className={`${styles.rightContent} contact-right`}
            onPointerMove={onTilt}
            onPointerLeave={resetTilt}
          >
            <div className={styles.stack} ref={stackRef}>
              <span className={`${styles.layer} ${styles.layerBack}`} aria-hidden="true" />
              <span className={`${styles.layer} ${styles.layerMid}`} aria-hidden="true" />
              <div className={styles.contactCard}>
                <div className={styles.cardMark} aria-hidden="true">
                  <span className={styles.ring} />
                  <span className={styles.cardMarkText}>AURAX</span>
                </div>
                <p className={styles.cardText}>
                  Ready to take your digital presence to the next level? Let's
                  create something amazing together.
                </p>

                <a href="/contact" className={styles.contactButton}>
                  <span>Connect With Us</span>
                  <svg
                    className={styles.arrowIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12H19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 5L19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
