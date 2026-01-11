import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./ProfileSetup.module.css";

const NICHE_OPTIONS = [
  "Fashion",
  "Beauty & Makeup",
  "Fitness & Wellness",
  "Food & Cooking",
  "Travel & Adventure",
  "Technology & Gadgets",
  "Gaming & Esports",
  "Lifestyle & Home",
  "Parenting & Family",
  "Business & Finance",
  "Education & Learning",
  "Entertainment & Comedy",
  "Health & Nutrition",
  "Sports & Athletics",
  "Art & Design",
  "Music & Dance",
  "Other"
];

const BRAND_CATEGORIES = [
  "Fashion & Apparel",
  "Beauty & Cosmetics",
  "Health & Wellness",
  "Food & Beverage",
  "Technology",
  "Fitness Equipment",
  "Home & Lifestyle",
  "Travel & Hospitality",
  "Automotive",
  "Entertainment",
  "Education",
  "Finance",
  "Jewelry & Accessories"
];

const COLLABORATION_TYPES = [
  { value: "paid", label: "Paid Partnerships" },
  { value: "barter", label: "Product Collaborations (Barter)" },
  { value: "long-term", label: "Long-term Brand Deals" },
  { value: "one-time", label: "One-time Campaigns" }
];

const MONTHLY_GOALS = [
  { value: "1-2", label: "1-2 brands per month" },
  { value: "3-5", label: "3-5 brands per month" },
  { value: "5+", label: "5+ brands per month" },
  { value: "flexible", label: "Flexible (based on fit)" }
];

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Check profile/review status and redirect if already submitted or approved
  // Don't redirect during loading - AuthGate handles that
  useEffect(() => {
    if (isLoading || !currentUser) return;
    
    const { reviewStatus, isApproved, role, roles } = currentUser;
    const hasAdminRole = roles?.includes('admin') || role === 'admin';
    
    console.log('📊 ProfileSetup - checking user status:', { role, roles, hasAdminRole, reviewStatus, isApproved });
    
    // If admin, redirect to admin dashboard
    if (hasAdminRole) {
      console.log('🔀 Admin user, redirecting to admin dashboard');
      navigate('/admin/campaigns', { replace: true });
      return;
    }
    
    // Redirect based on review status
    if (reviewStatus === 'approved' && isApproved) {
      console.log('✅ Profile approved - redirecting to dashboard');
      navigate('/creator/dashboard', { replace: true });
    } else if (reviewStatus === 'pending') {
      console.log('⏳ Profile pending - redirecting to under-review');
      navigate('/creator/under-review', { replace: true });
    }
    // If reviewStatus is null, undefined, or 'rejected', stay on this page to allow (re)submission
  }, [currentUser, isLoading, navigate]);
  
  const [formData, setFormData] = useState({
    creatorUsername: "",
    instagramHandle: "",
    country: "",
    primaryNiche: "",
    followerCount: "",
    portfolioLinks: [""],
    pastCollaborations: "",
    collaborationType: [],
    monthlyBrandGoal: "",
    preferredBrandCategories: [],
    openToUGC: false
  });

  // Pre-fill creatorUsername from currentUser.username
  useEffect(() => {
    if (currentUser && currentUser.username) {
      setFormData(prev => ({
        ...prev,
        creatorUsername: currentUser.username
      }));
      console.log('✅ Pre-filled username from signup:', currentUser.username);
    }
  }, [currentUser]);

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => {
      const currentValues = prev[field];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const handlePortfolioChange = (index, value) => {
    const newLinks = [...formData.portfolioLinks];
    newLinks[index] = value;
    setFormData(prev => ({ ...prev, portfolioLinks: newLinks }));
  };

  const addPortfolioLink = () => {
    if (formData.portfolioLinks.length < 5) {
      setFormData(prev => ({
        ...prev,
        portfolioLinks: [...prev.portfolioLinks, ""]
      }));
    }
  };

  const removePortfolioLink = (index) => {
    if (formData.portfolioLinks.length > 1) {
      setFormData(prev => ({
        ...prev,
        portfolioLinks: prev.portfolioLinks.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.creatorUsername.trim()) {
      newErrors.creatorUsername = "Username is required";
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(formData.creatorUsername)) {
      newErrors.creatorUsername = "Username must be 3-30 characters (letters, numbers, underscores only)";
    }

    if (!formData.instagramHandle.trim()) {
      newErrors.instagramHandle = "Instagram handle is required";
    } else if (!/^@?[\w.]+$/.test(formData.instagramHandle)) {
      newErrors.instagramHandle = "Invalid Instagram handle format";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!formData.primaryNiche) {
      newErrors.primaryNiche = "Please select your primary niche";
    }

    // Validate portfolio URLs if provided
    formData.portfolioLinks.forEach((link, index) => {
      if (link.trim() && !/^https?:\/\/.+/.test(link)) {
        newErrors[`portfolio_${index}`] = "Please enter a valid URL (must start with http:// or https://)";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError("Please fix the errors above");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      // Filter out empty portfolio links
      const cleanedPortfolioLinks = formData.portfolioLinks.filter(link => link.trim());
      
      const response = await fetch("http://localhost:5002/api/onboarding/creator-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          portfolioLinks: cleanedPortfolioLinks,
          followerCount: formData.followerCount ? parseInt(formData.followerCount) : undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to under review screen
        navigate("/creator/under-review");
      } else {
        throw new Error(data.message || "Failed to submit profile");
      }
    } catch (err) {
      console.error("❌ Profile submission error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.message || err.message || "Failed to submit profile. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render during auth loading - AuthGate handles it
  if (isLoading || !currentUser) {
    return null;
  }

  return (
    <div className={styles.setupContainer}>
      <div className={styles.setupCard}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoCircle}>
            <span className={styles.logoText}>AURAX</span>
          </div>
          <h1 className={styles.title}>Creator Profile Setup</h1>
          <p className={styles.subtitle}>
            Help us understand your creator journey so we can match you with the perfect brands
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Required Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.requiredBadge}>Required</span>
              Basic Information
            </h2>

            <div className={styles.formGroup}>
              <label htmlFor="creatorUsername" className={styles.label}>
                Choose Your AURAX Username *
                <span className={styles.labelHint}>This will be your unique identifier on the platform</span>
              </label>
              <input
                type="text"
                id="creatorUsername"
                name="creatorUsername"
                value={formData.creatorUsername}
                onChange={handleInputChange}
                placeholder="e.g., sarah_creative"
                className={`${styles.input} ${errors.creatorUsername ? styles.inputError : ""}`}
              />
              {errors.creatorUsername && <span className={styles.errorText}>{errors.creatorUsername}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="instagramHandle" className={styles.label}>
                Instagram Handle *
                <span className={styles.labelHint}>Your Instagram username (we'll verify this later)</span>
              </label>
              <input
                type="text"
                id="instagramHandle"
                name="instagramHandle"
                value={formData.instagramHandle}
                onChange={handleInputChange}
                placeholder="@yourhandle"
                className={`${styles.input} ${errors.instagramHandle ? styles.inputError : ""}`}
              />
              {errors.instagramHandle && <span className={styles.errorText}>{errors.instagramHandle}</span>}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="country" className={styles.label}>Country *</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="e.g., India, USA, UK"
                  className={`${styles.input} ${errors.country ? styles.inputError : ""}`}
                />
                {errors.country && <span className={styles.errorText}>{errors.country}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="primaryNiche" className={styles.label}>Primary Niche *</label>
                <select
                  id="primaryNiche"
                  name="primaryNiche"
                  value={formData.primaryNiche}
                  onChange={handleInputChange}
                  className={`${styles.select} ${errors.primaryNiche ? styles.inputError : ""}`}
                >
                  <option value="">Select your niche</option>
                  {NICHE_OPTIONS.map(niche => (
                    <option key={niche} value={niche}>{niche}</option>
                  ))}
                </select>
                {errors.primaryNiche && <span className={styles.errorText}>{errors.primaryNiche}</span>}
              </div>
            </div>
          </div>

          {/* Optional Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.optionalBadge}>Optional</span>
              Additional Details
            </h2>

            <div className={styles.formGroup}>
              <label htmlFor="followerCount" className={styles.label}>
                Approximate Follower Count
                <span className={styles.labelHint}>This helps us understand your reach (not verified)</span>
              </label>
              <input
                type="number"
                id="followerCount"
                name="followerCount"
                value={formData.followerCount}
                onChange={handleInputChange}
                placeholder="e.g., 25000"
                className={styles.input}
                min="0"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Portfolio Links
                <span className={styles.labelHint}>Showcase your best work (Instagram posts, YouTube videos, etc.)</span>
              </label>
              {formData.portfolioLinks.map((link, index) => (
                <div key={index} className={styles.portfolioRow}>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handlePortfolioChange(index, e.target.value)}
                    placeholder="https://instagram.com/p/..."
                    className={`${styles.input} ${errors[`portfolio_${index}`] ? styles.inputError : ""}`}
                  />
                  {formData.portfolioLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePortfolioLink(index)}
                      className={styles.removeButton}
                      aria-label="Remove link"
                    >
                      ✕
                    </button>
                  )}
                  {errors[`portfolio_${index}`] && (
                    <span className={styles.errorText}>{errors[`portfolio_${index}`]}</span>
                  )}
                </div>
              ))}
              {formData.portfolioLinks.length < 5 && (
                <button
                  type="button"
                  onClick={addPortfolioLink}
                  className={styles.addButton}
                >
                  + Add Another Link
                </button>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="pastCollaborations" className={styles.label}>
                Past Brand Collaborations
                <span className={styles.labelHint}>Tell us about brands you've worked with before</span>
              </label>
              <textarea
                id="pastCollaborations"
                name="pastCollaborations"
                value={formData.pastCollaborations}
                onChange={handleInputChange}
                placeholder="e.g., Worked with Nike for fitness campaign, collaborated with local cafes for food reviews..."
                rows="4"
                className={styles.textarea}
              />
            </div>
          </div>

          {/* Preferences Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Collaboration Preferences</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>What type of collaborations are you open to?</label>
              <div className={styles.checkboxGrid}>
                {COLLABORATION_TYPES.map(type => (
                  <label key={type.value} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.collaborationType.includes(type.value)}
                      onChange={() => handleCheckboxChange("collaborationType", type.value)}
                      className={styles.checkbox}
                    />
                    <span>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>How many brands would you like to work with monthly?</label>
              <div className={styles.radioGroup}>
                {MONTHLY_GOALS.map(goal => (
                  <label key={goal.value} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="monthlyBrandGoal"
                      value={goal.value}
                      checked={formData.monthlyBrandGoal === goal.value}
                      onChange={handleInputChange}
                      className={styles.radio}
                    />
                    <span>{goal.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Preferred Brand Categories
                <span className={styles.labelHint}>Select all that interest you</span>
              </label>
              <div className={styles.checkboxGrid}>
                {BRAND_CATEGORIES.map(category => (
                  <label key={category} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.preferredBrandCategories.includes(category)}
                      onChange={() => handleCheckboxChange("preferredBrandCategories", category)}
                      className={styles.checkbox}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  name="openToUGC"
                  checked={formData.openToUGC}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span>I'm open to User-Generated Content (UGC) opportunities</span>
              </label>
              <p className={styles.labelHint}>
                UGC involves creating content for brands to use on their own channels
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorBanner}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner}></span>
                Submitting...
              </>
            ) : (
              <>
                Submit for Review
                <svg className={styles.arrowIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>

          <p className={styles.disclaimer}>
            By submitting, you agree that all information provided is accurate and that our team will review your profile within 24-48 hours.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
