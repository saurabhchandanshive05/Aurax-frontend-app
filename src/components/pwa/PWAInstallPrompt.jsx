import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./PWAInstallPrompt.module.css";

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isAppInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://");

    setIsInstalled(isAppInstalled);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show prompt after a delay if not already installed
      if (!isAppInstalled) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  // Don't show if already installed or recently dismissed
  const recentlyDismissed = localStorage.getItem("pwa-prompt-dismissed");
  if (
    isInstalled ||
    !deferredPrompt ||
    (recentlyDismissed &&
      Date.now() - parseInt(recentlyDismissed) < 24 * 60 * 60 * 1000)
  ) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
          className={styles.prompt}
          role="dialog"
          aria-labelledby="pwa-install-title"
        >
          <div className={styles.body}>
            <h3 id="pwa-install-title" className={styles.title}>Install AURAX</h3>
            <p className={styles.text}>
              Add AURAX to your home screen to open it in one tap, like an app.
            </p>
            <div className={styles.actions}>
              <button type="button" onClick={handleInstall} className="ax-btn ax-btn--primary">
                Install
              </button>
              <button type="button" onClick={handleDismiss} className="ax-btn ax-btn--ghost">
                Not now
              </button>
            </div>
          </div>
          <button type="button" onClick={handleDismiss} className={styles.close} aria-label="Close">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
