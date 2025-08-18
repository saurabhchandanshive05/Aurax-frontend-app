import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./styles/ContactUs.module.css";

gsap.registerPlugin(ScrollTrigger);

const ContactUs = () => {
  const containerRef = useRef(null);
  const [emailCopied, setEmailCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText("connect@aurax.io");
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  useEffect(() => {
    const contactLeft = gsap.utils.toArray(".contact-left");
    const contactRight = gsap.utils.toArray(".contact-right");

    gsap.fromTo(
      contactLeft,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: contactLeft,
          start: "top 90%",
        },
      }
    );

    gsap.fromTo(
      contactRight,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.3,
        scrollTrigger: {
          trigger: contactRight,
          start: "top 90%",
        },
      }
    );

    // Background animation
    gsap.fromTo(
      containerRef.current,
      { backgroundPosition: "0% 0%" },
      {
        backgroundPosition: "100% 100%",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      }
    );
  }, []);

  return (
    <section ref={containerRef} className={styles.section}>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={`${styles.leftContent} contact-left`}>
            <h2 className={styles.heading}>
              Step Into the Aura — Let's Connect
              <span className={styles.sparkle}>✨</span>
            </h2>

            <div className={styles.emailContainer}>
              <div className={styles.emailDisplay} onClick={copyToClipboard}>
                <span className={styles.emailLink}>connect@aurax.io</span>
                <span className={styles.copyIcon} title="Copy to clipboard">
                  {emailCopied ? "✅" : "📋"}
                </span>
              </div>
            </div>

            <p className={styles.description}>
              Whether you're a visionary brand or a bold creator, AURAX is where
              influence meets innovation. Let's shape stories, spark
              connections, and achieve impact together.
            </p>
          </div>

          <div className={`${styles.rightContent} contact-right`}>
            <div className={styles.contactCard}>
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
    </section>
  );
};

export default ContactUs;
