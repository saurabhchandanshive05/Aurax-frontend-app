import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./UnderReview.module.css";

const UnderReview = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading: authLoading } = useAuth();
  const [onboardingData, setOnboardingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!authLoading && !currentUser) {
      navigate('/creator/login', { replace: true });
      return;
    }
    
    if (!authLoading && currentUser) {
      fetchOnboardingStatus();
    }
    
    // Poll every 30 seconds for status updates
    const interval = setInterval(() => {
      fetchOnboardingStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [authLoading, currentUser, navigate]);

  const fetchOnboardingStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5002/api/onboarding/status", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setOnboardingData(data.data);
        
        // Redirect if status changed
        if (data.data.reviewStatus === "approved") {
          navigate("/creator/dashboard");
        } else if (data.data.reviewStatus === "rejected") {
          navigate("/creator/rejected");
        } else if (data.data.reviewStatus === "not_submitted") {
          navigate("/creator/profile-setup");
        }
      }
    } catch (error) {
      console.error("Error fetching onboarding status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your status...</p>
      </div>
    );
  }

  return (
    <div className={styles.reviewContainer}>
      <div className={styles.reviewCard}>
        {/* Animated Icon */}
        <div className={styles.iconSection}>
          <div className={styles.pendingIcon}>
            <svg className={styles.clockIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
            </svg>
          </div>
        </div>

        {/* Main Message */}
        <h1 className={styles.title}>Profile Under Review</h1>
        <p className={styles.message}>
          Thank you for submitting your creator profile! Our team is currently reviewing your application to ensure the best experience for both creators and brands.
        </p>

        {/* Timeline */}
        <div className={styles.timeline}>
          <div className={styles.timelineItem}>
            <div className={`${styles.timelineDot} ${styles.completed}`}>✓</div>
            <div className={styles.timelineContent}>
              <h3 className={styles.timelineTitle}>Profile Submitted</h3>
              <p className={styles.timelineDate}>
                {onboardingData?.profileSubmittedAt 
                  ? new Date(onboardingData.profileSubmittedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Just now'}
              </p>
            </div>
          </div>

          <div className={styles.timelineConnector}></div>

          <div className={styles.timelineItem}>
            <div className={`${styles.timelineDot} ${styles.current}`}>
              <div className={styles.pulse}></div>
            </div>
            <div className={styles.timelineContent}>
              <h3 className={styles.timelineTitle}>Under Review</h3>
              <p className={styles.timelineDate}>Typically 24-48 hours</p>
            </div>
          </div>

          <div className={styles.timelineConnector}></div>

          <div className={styles.timelineItem}>
            <div className={`${styles.timelineDot} ${styles.pending}`}>3</div>
            <div className={styles.timelineContent}>
              <h3 className={styles.timelineTitle}>Dashboard Access</h3>
              <p className={styles.timelineDate}>After approval</p>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className={styles.infoSection}>
          <h2 className={styles.infoTitle}>What happens next?</h2>
          <div className={styles.infoCards}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📧</div>
              <h3 className={styles.infoCardTitle}>Email Notification</h3>
              <p className={styles.infoCardText}>
                You'll receive an email as soon as our team completes the review
              </p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🔍</div>
              <h3 className={styles.infoCardTitle}>Quality Check</h3>
              <p className={styles.infoCardText}>
                We're verifying your profile details and social media presence
              </p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>✨</div>
              <h3 className={styles.infoCardTitle}>Get Approved</h3>
              <p className={styles.infoCardText}>
                Access your dashboard and start connecting with premium brands
              </p>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        {onboardingData && (
          <div className={styles.profileSummary}>
            <h2 className={styles.summaryTitle}>Your Submitted Profile</h2>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Username</span>
                <span className={styles.summaryValue}>@{onboardingData.creatorUsername}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Instagram</span>
                <span className={styles.summaryValue}>{onboardingData.instagramHandle}</span>
              </div>
              {onboardingData.country && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Country</span>
                  <span className={styles.summaryValue}>{onboardingData.country}</span>
                </div>
              )}
              {onboardingData.primaryNiche && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Primary Niche</span>
                  <span className={styles.summaryValue}>{onboardingData.primaryNiche}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button 
            className={styles.refreshButton}
            onClick={fetchOnboardingStatus}
          >
            <svg className={styles.refreshIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh Status
          </button>
          
          <button 
            className={styles.homeButton}
            onClick={() => window.location.href = 'https://www.auraxai.in'}
          >
            <svg className={styles.homeIcon} viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Back to Home
          </button>
        </div>
        
        {/* Branding Link */}
        <div className={styles.brandingSection}>
          <p className={styles.brandingText}>
            Learn more about{" "}
            <a href="https://www.auraxai.in" target="_blank" rel="noopener noreferrer" className={styles.brandLink}>
              AURAX AI
            </a>
          </p>
        </div>

        {/* Help Text */}
        <p className={styles.helpText}>
          Need help or have questions?{" "}
          <a href="mailto:hello@auraxai.in" className={styles.link}>
            Contact us at hello@auraxai.in
          </a>
        </p>
      </div>
    </div>
  );
};

export default UnderReview;
