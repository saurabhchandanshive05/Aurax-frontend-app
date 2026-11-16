import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./WelcomeScreen.module.css";

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading } = useAuth();

  // Only redirect if user shouldn't be here
  // Don't redirect during auth loading - AuthGate handles that
  useEffect(() => {
    if (isLoading || !currentUser) return;
    
    const { reviewStatus, isApproved, role, roles } = currentUser;
    const hasAdminRole = roles?.includes('admin') || role === 'admin';
    const hasCreatorRole = roles?.includes('creator') || role === 'creator';
    // If admin, redirect to admin dashboard
    if (hasAdminRole) {
      navigate('/admin/campaigns', { replace: true });
      return;
    }
    
    // If not a creator, redirect to brand dashboard
    if (!hasCreatorRole) {
      navigate('/brand/dashboard', { replace: true });
      return;
    }
    
    // If creator with approved profile, redirect to dashboard
    if (reviewStatus === 'approved' && isApproved) {
      navigate('/creator/dashboard', { replace: true });
    } else if (reviewStatus === 'pending') {
      navigate('/creator/under-review', { replace: true });
    }
    // If reviewStatus is null/undefined or 'rejected', stay on welcome page
  }, [currentUser, isLoading, navigate]);

  const handleGetStarted = () => {
    navigate("/creator/profile-setup");
  };

  // Don't show anything while loading - AuthGate handles the loading screen
  if (isLoading || !currentUser) {
    return null;
  }

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.contentWrapper}>
        {/* Mobile-First Headline */}
        <h1 className={styles.welcomeTitle}>
          Welcome to AURAX
        </h1>
        
        <p className={styles.welcomeSubtitle}>
          Set up your creator profile to get access to hand-picked brand campaigns.
        </p>

        {/* Why This Matters (Mobile Info Box) */}
        <div className={styles.whyBox}>
          <div className={styles.whyIcon}>✓</div>
          <div className={styles.whyContent}>
            <h3 className={styles.whyTitle}>Human-Verified Network</h3>
            <p className={styles.whyText}>
              Every creator is manually reviewed. Your profile helps brands find the right match.
            </p>
          </div>
        </div>

        {/* What Happens Next (Mobile Timeline) */}
        <div className={styles.timelineBox}>
          <h3 className={styles.timelineTitle}>What happens next?</h3>
          <div className={styles.timelineSteps}>
            <div className={styles.timelineStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Set up your profile</strong>
                <span>Takes 2-3 minutes</span>
              </div>
            </div>
            <div className={styles.timelineStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>We review your info</strong>
                <span>Usually within 24-48 hours</span>
              </div>
            </div>
            <div className={styles.timelineStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Start collaborating</strong>
                <span>Access verified brand campaigns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Single Primary CTA (Mobile-First) */}
        <div className={styles.ctaSection}>
          <button onClick={handleGetStarted} className={styles.primaryCta}>
            Start profile setup
            <svg className={styles.ctaArrow} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <p className={styles.ctaHelper}>Takes about 3 minutes. Required to apply to campaigns.</p>
        </div>

        {/* Secondary Actions (Mobile) */}
        <div className={styles.secondaryActions}>
          <button onClick={() => navigate('/help')} className={styles.secondaryBtn}>
            Get help
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
