import React, { useEffect, useState } from "react";
import Hero from "../components/Hero";
import ServicesCards from "../components/ServicesCards";
import BrandSuccessShowcase from "../components/BrandSuccessShowcase";
import Specialization from "../components/Specialization";
import BrandCollaborations from "../components/BrandCollaborations";
import ContactUs from "../components/ContactUs";
import PWAInstallPrompt from "../components/pwa/PWAInstallPrompt";
import { FloatingActionButton } from "../components/ui/MicroInteractions";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";

// Fresh visit (not a reload or Back/Forward, where the browser restores a scroll position and
// needs the full page height straight away)
const isFreshVisit = () => {
  if (typeof performance === "undefined" || !performance.getEntriesByType) return false;
  const nav = performance.getEntriesByType("navigation")[0];
  return !nav || nav.type === "navigate";
};

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navType = useNavigationType();

  // The sections below the hero are mounted right after the hero's first paint instead of in the
  // same render: rendering the whole homepage at once kept the main thread busy for seconds before
  // anything could be shown. They still appear long before anyone can scroll to them (and a
  // placeholder holds their space meanwhile). Reloads, Back/Forward and links to a section render
  // everything at once, as before.
  const [showRest, setShowRest] = useState(
    () =>
      !!location.state?.scrollToServices ||
      !!location.hash ||
      (location.key !== "default" && navType === "POP") ||
      (location.key === "default" && !isFreshVisit())
  );
  useEffect(() => {
    if (showRest) return undefined;
    let timer = 0;
    // After the next frame has been painted
    const raf = requestAnimationFrame(() => {
      timer = setTimeout(() => setShowRest(true), 0);
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [showRest]);

  useEffect(() => {
    // Scroll to services section if navigated from Services link
    if (location.state?.scrollToServices) {
      const servicesSection = document.getElementById("services");
      if (servicesSection) {
        setTimeout(() => {
          servicesSection.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location.state]);

  const handleQuickSearch = (query, category) => {

    // Implement search functionality
  };

  const handleResultSelect = (result) => {

    // Navigate to selected result
  };

  return (
    // 0.8s fade-in done in CSS (index.css, .home-page) so it runs on the compositor and is not held
    // back while the main thread is busy starting the page
    <div className="home-page">
      <Hero />

      {showRest ? (
        <>
          <ServicesCards />
          <BrandSuccessShowcase />
          <Specialization />
          <BrandCollaborations />
          <ContactUs />
        </>
      ) : (
        <div style={{ minHeight: "100vh" }} aria-hidden="true" />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        }
        onClick={() => navigate("/contact")}
        tooltip="Contact the AURAX team"
        position="bottom-right"
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export default HomePage;
