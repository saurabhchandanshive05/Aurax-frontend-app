import React, { useEffect } from "react";
import Hero from "../components/Hero";
import ServicesCards from "../components/ServicesCards";
import BrandSuccessShowcase from "../components/BrandSuccessShowcase";
import Specialization from "../components/Specialization";
import BrandCollaborations from "../components/BrandCollaborations";
import ContactUs from "../components/ContactUs";
import SmartSearch from "../components/ui/SmartSearch";
import PWAInstallPrompt from "../components/pwa/PWAInstallPrompt";
import { FloatingActionButton } from "../components/ui/MicroInteractions";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (!isLoading && currentUser) {

      if (currentUser.role === 'creator') {
        // Check if minimal profile is completed
        if (currentUser.minimalProfileCompleted) {
          navigate('/creator/dashboard', { replace: true });
        } else {
          navigate('/creator/welcome', { replace: true });
        }
      } else if (currentUser.role === 'brand') {
        navigate('/brand/dashboard', { replace: true });
      }
    }
  }, [currentUser, isLoading, navigate]);

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
    <motion.div
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Hero />

      <ServicesCards />
      <BrandSuccessShowcase />
      <Specialization />
      <BrandCollaborations />
      <ContactUs />

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={
          <svg
            className="w-6 h-6"
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
        onClick={() => {
          // Open chat/support

        }}
        tooltip="Need help? Chat with us!"
        position="bottom-right"
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </motion.div>
  );
};

export default HomePage;
