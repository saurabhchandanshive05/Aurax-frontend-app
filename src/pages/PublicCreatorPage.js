import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApiEndpoint } from '../utils/getApiUrl';
import './PublicCreatorPage.css';

const PublicCreatorPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const unlockIntent = searchParams.get('unlock'); // 'exclusive' or specific contentId
  
  const [creator, setCreator] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [unlockingContent, setUnlockingContent] = useState(null);

  useEffect(() => {
    fetchCreatorData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    // After login, check if user needs to subscribe
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token && unlockIntent && !isSubscribed) {
      setShowSubscribeModal(true);
    }
  }, [unlockIntent, isSubscribed]);

  const fetchCreatorData = async () => {
    try {
      setLoading(true);
      // Fetch from PUBLIC API endpoint (not /me)
      const response = await fetch(getApiEndpoint(`/api/public/creator/${slug}`));
      const data = await response.json();
      
      if (data.success) {
        setCreator(data.creator); // This is creator's public profile
        setContent(data.content);
        
        // Check subscription status if user is logged in
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
          checkSubscriptionStatus();
        }
      } else {
        setError(data.message || 'Creator not found');
      }
    } catch (err) {
      setError('Failed to load creator page');
      console.error('Error fetching creator:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        getApiEndpoint(`/api/public/subscription-status/${slug}`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setIsSubscribed(data.isSubscribed);
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  };

  const handleSubscribeClick = (plan, contentId = null) => {
    // Defensive check for plan existence
    if (!plan) {
      alert('No subscription plan available. Please contact the creator.');
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      setSelectedPlan(plan);
      setUnlockingContent(contentId);
      setShowLoginModal(true);
    } else if (!isSubscribed) {
      setSelectedPlan(plan);
      setShowSubscribeModal(true);
    } else {
      // Already subscribed, show content
      // Open that content item directly (there is no separate content page)
      const item = contentId && content.find((c) => c._id === contentId);
      if (item?.contentUrl) window.open(item.contentUrl, '_blank', 'noopener');
    }
  };

  const proceedToCheckout = (plan) => {
    if (!plan) {
      alert('Invalid plan selected');
      return;
    }

    const planName = plan.name || plan.duration || 'Subscription';
    const planPrice = plan.price || 0;
    const planDuration = plan.duration || 'month';

    // TODO: Implement payment integration (Razorpay/Stripe)
    alert(`Payment integration coming soon!\nPlan: ${planName}\nPrice: ₹${planPrice}/${planDuration}`);
    
    // After successful payment, reload page to update subscription status
    // window.location.reload();
  };

  const handleLoginRedirect = () => {
    // Preserve intent: redirect back to this page with unlock parameter
    const returnUrl = unlockingContent 
      ? `/creator/${slug}?unlock=${unlockingContent}`
      : `/creator/${slug}?unlock=exclusive`;
    
    localStorage.setItem('redirectAfterLogin', returnUrl);
    navigate('/creator/login');
  };

  const handleContentClick = (contentItem) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (contentItem.visibility === 'public' || isSubscribed) {
      // Show content
      window.open(contentItem.contentUrl, '_blank');
    } else if (!token) {
      // Not logged in - show login modal
      setUnlockingContent(contentItem._id || 'exclusive');
      setSelectedPlan(creator.subscriptionPlans?.[0]);
      setShowLoginModal(true);
    } else {
      // Logged in but not subscribed - show subscribe modal
      setSelectedPlan(creator.subscriptionPlans?.[0]);
      setShowSubscribeModal(true);
    }
  };

  // Helper function to get service icon based on service name
  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('chat') || name.includes('message')) return '💬';
    if (name.includes('video') || name.includes('shoutout')) return '🎥';
    if (name.includes('brand') || name.includes('collab')) return '🤝';
    if (name.includes('call') || name.includes('phone')) return '📞';
    if (name.includes('photo') || name.includes('picture')) return '📸';
    if (name.includes('consultation') || name.includes('consult')) return '🎯';
    if (name.includes('review') || name.includes('feedback')) return '⭐';
    if (name.includes('promotion') || name.includes('promo')) return '📢';
    return '⭐'; // Default icon
  };

  if (loading) {
    return (
      <div className="public-creator-page loading">
        <div className="spinner"></div>
        <p>Loading creator page...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-creator-page error">
        <div className="error-container">
          <h1>😕 Creator Not Found</h1>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-creator-page">
      {/* Header/Hero Section */}
      <div className="hero-section">
        {creator.coverImage && (
          <div className="cover-image">
            <img src={creator.coverImage} alt={creator.displayName} />
          </div>
        )}
      </div>

      {/* Profile Section (Below Cover) */}
      <div className="profile-section">
        <div className="container">
          <div className="profile-header-card">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-large">
                {creator.profileImage || creator.profilePicture ? (
                  <img src={creator.profileImage || creator.profilePicture} alt={creator.displayName} />
                ) : (
                  <div className="avatar-placeholder">
                    {creator.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="profile-main-content">
              <div className="profile-header-top">
                <div className="profile-identity">
                  <div className="name-and-badge">
                    <h1 className="creator-name-large">{creator.displayName}</h1>
                    {creator.isVerified && <span className="verified-badge" title="Verified Creator">✓</span>}
                  </div>
                  {creator.instagramUsername && (
                    <a 
                      href={`https://instagram.com/${creator.instagramUsername.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="instagram-link"
                    >
                      <span className="ig-icon">📷</span>
                      @{creator.instagramUsername.replace('@', '')}
                    </a>
                  )}
                </div>
                
                <div className="profile-cta-buttons">
                  {!isSubscribed ? (
                    <button 
                      className="btn-subscribe-hero"
                      onClick={() => {
                        const plan = creator.subscriptionPlans?.[0];
                        if (plan) {
                          handleSubscribeClick(plan);
                        } else {
                          setError('No subscription plans available yet. Check back later!');
                          setTimeout(() => setError(null), 3000);
                        }
                      }}
                    >
                      💎 Subscribe Now
                    </button>
                  ) : (
                    <button className="btn-subscribed-hero" disabled>
                      ✓ Subscribed
                    </button>
                  )}
                  {creator.instagramUsername && (
                    <a 
                      href={`https://instagram.com/${creator.instagramUsername.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-follow-instagram"
                    >
                      Follow on Instagram
                    </a>
                  )}
                </div>
              </div>
              
              {creator.bio && (
                <p className="creator-bio-full">{creator.bio}</p>
              )}
              
              <div className="profile-stats-row">
                <div className="stat-item">
                  <span className="stat-number">{creator.totalSubscribers || 0}</span>
                  <span className="stat-label">Subscribers</span>
                </div>
                {creator.instagramConnected && creator.instagramFollowers > 0 && (
                  <div className="stat-item">
                    <span className="stat-number">{creator.instagramFollowers.toLocaleString()}</span>
                    <span className="stat-label">Instagram Followers</span>
                  </div>
                )}
                {creator.subscriptionPlans && creator.subscriptionPlans.length > 0 && (
                  <div className="stat-item">
                    <span className="stat-number">{creator.subscriptionPlans.length}</span>
                    <span className="stat-label">Plans Available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plans - Only show if not subscribed */}
      {!isSubscribed && creator.subscriptionPlans && creator.subscriptionPlans.length > 0 && (
        <section className="subscription-section">
          <h2 className="section-title">Subscription Plans</h2>
          <p className="section-subtitle">Choose a plan and get exclusive access to all content</p>
          <div className="subscription-plans">
            {creator.subscriptionPlans.map((plan, index) => (
              <div key={index} className="subscription-card">
                <h3 className="plan-name">{plan.name}</h3>
                
                <div className="plan-price">
                  <span className="price-currency">₹</span>
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-period">/{plan.duration}</span>
                </div>
                
                {plan.description && <p className="plan-description">{plan.description}</p>}
                
                {plan.features && plan.features.length > 0 && (
                  <ul className="plan-features">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>
                        <span className="feature-icon">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                
                <button 
                  className="btn-subscribe-plan"
                  onClick={() => handleSubscribeClick(plan)}
                >
                  <span className="btn-icon">💳</span> Subscribe Now
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Exclusive Content Preview - Only show if creator has content */}
      {content && content.length > 0 && (
        <section className="content-section">
          <h2 className="section-title">Exclusive Content</h2>
          <p className="section-subtitle">
            {isSubscribed 
              ? 'Access your exclusive content below' 
              : 'Subscribe to unlock exclusive photos, videos, and more'}
          </p>
          <div className="content-grid">
            {content.map((item, index) => (
              <div 
                key={index} 
                className={`content-card ${!isSubscribed ? 'locked' : ''}`}
                onClick={() => handleContentClick(item)}
              >
                <div className="content-thumbnail">
                  {item.thumbnailUrl ? (
                    <img 
                      src={item.thumbnailUrl} 
                      alt={item.title}
                      className={!isSubscribed ? 'blurred' : ''}
                    />
                  ) : (
                    <div className="thumbnail-placeholder">
                      {item.type === 'video' ? '🎥' : '📷'}
                    </div>
                  )}
                  
                  {!isSubscribed && (
                    <div className="content-lock">
                      <div className="lock-icon">🔒</div>
                      <p>Subscribe to unlock</p>
                    </div>
                  )}
                </div>
                
                <div className="content-info">
                  <span className="content-date">Posted recently</span>
                  <span className="content-type">
                    {item.type === 'video' ? '🎥' : '📷'} 
                    {item.mediaCount > 1 ? `${item.mediaCount} items` : '1 item'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Paid Services - ALWAYS SHOW */}
      <section className="services-section">
        <div className="container">
          <h2 className="section-title">💼 Paid Services</h2>
          <p className="section-subtitle">Book personalized services directly from {creator.displayName}</p>
          <div className="services-grid">
            {creator.services && creator.services.length > 0 ? (
              creator.services.map((service, index) => (
                <div key={index} className="service-card">
                  <div className="service-icon">{getServiceIcon(service.name)}</div>
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-description">
                    {service.description || 'Personalized service from the creator'}
                  </p>
                  <div className="service-price">₹{service.price}</div>
                  <button 
                    className="btn-book-service"
                    onClick={() => {
                      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                      if (!token) {
                        setShowLoginModal(true);
                      } else {
                        setSelectedPlan({ 
                          name: service.name, 
                          price: service.price, 
                          type: 'service',
                          description: service.description 
                        });
                        setShowSubscribeModal(true);
                      }
                    }}
                  >
                    📞 Book Now
                  </button>
                </div>
              ))
            ) : (
              // Default services if creator hasn't added any
              <>
                <div className="service-card service-placeholder">
                  <div className="service-icon">💬</div>
                  <h3 className="service-name">Personal Chat</h3>
                  <p className="service-description">
                    Get exclusive 1-on-1 chat access with {creator.displayName}
                  </p>
                  <div className="service-price-contact">Contact for pricing</div>
                  <button 
                    className="btn-book-service"
                    onClick={() => {
                      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                      if (!token) {
                        setShowLoginModal(true);
                      } else {
                        alert(`Contact ${creator.displayName} for Personal Chat pricing`);
                      }
                    }}
                  >
                    📧 Contact
                  </button>
                </div>
                
                <div className="service-card service-placeholder">
                  <div className="service-icon">🎥</div>
                  <h3 className="service-name">Video Shoutout</h3>
                  <p className="service-description">
                    Get a personalized video message from {creator.displayName}
                  </p>
                  <div className="service-price-contact">Contact for pricing</div>
                  <button 
                    className="btn-book-service"
                    onClick={() => {
                      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                      if (!token) {
                        setShowLoginModal(true);
                      } else {
                        alert(`Contact ${creator.displayName} for Video Shoutout pricing`);
                      }
                    }}
                  >
                    📧 Request
                  </button>
                </div>
                
                <div className="service-card service-placeholder">
                  <div className="service-icon">🤝</div>
                  <h3 className="service-name">Brand Collaboration</h3>
                  <p className="service-description">
                    Partner with {creator.displayName} for brand promotions and collaborations
                  </p>
                  <div className="service-price-contact">Custom quote</div>
                  <button 
                    className="btn-book-service"
                    onClick={() => {
                      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                      if (!token) {
                        setShowLoginModal(true);
                      } else {
                        alert(`Contact ${creator.displayName} for collaboration opportunities`);
                      }
                    }}
                  >
                    📧 Enquire
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Social Links */}
      {creator.socialLinks && (
        <section className="social-section">
          <div className="social-links">
            {creator.socialLinks.instagram && (
              <a 
                href={creator.socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link instagram"
              >
                <span className="social-icon">📷</span>
                Instagram
              </a>
            )}
            {creator.socialLinks.youtube && (
              <a 
                href={creator.socialLinks.youtube} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link youtube"
              >
                <span className="social-icon">▶️</span>
                YouTube
              </a>
            )}
            {creator.socialLinks.twitter && (
              <a 
                href={creator.socialLinks.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link twitter"
              >
                <span className="social-icon">🐦</span>
                Twitter
              </a>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="creator-footer">
        <div className="footer-links">
          <a href={`mailto:business@auraxai.in?subject=Brand Enquiry for ${creator.displayName}`}>Brand Enquiry</a>
          <a href={`mailto:hello@auraxai.in?subject=${encodeURIComponent(`Report creator: ${creator.displayName} (${slug})`)}`}>Report Creator</a>
          {/* Terms of Service and Privacy Policy links hidden: AURAX has no /terms or /privacy
              pages yet (they led to the homepage). Restore them once those pages exist. */}
        </div>
        <div className="footer-branding">
          <p>Powered by <strong>Aurax</strong></p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>
              ×
            </button>
            <h2>Login Required</h2>
            <p>Please login to access exclusive content and subscribe to {creator.displayName}.</p>
            {selectedPlan && (
              <div className="modal-plan-preview">
                <p className="plan-preview-text">
                  After login, you can subscribe to:
                </p>
                <div className="plan-preview-card">
                  <div className="plan-preview-name">{selectedPlan.name}</div>
                  <div className="plan-preview-price">₹{selectedPlan.price}/{selectedPlan.duration}</div>
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleLoginRedirect}>
                Login
              </button>
              <button className="btn-secondary" onClick={() => setShowLoginModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscribe Modal */}
      {showSubscribeModal && selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowSubscribeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSubscribeModal(false)}>
              ×
            </button>
            <h2>{selectedPlan.type === 'service' ? 'Book Service' : `Subscribe to ${creator.displayName}`}</h2>
            <p>{selectedPlan.type === 'service' ? 'Book this personalized service' : 'Get exclusive access to all content'}</p>
            
            <div className="modal-plan">
              <div className="modal-plan-name">{selectedPlan.name}</div>
              <div className="modal-plan-price">
                ₹{selectedPlan.price}{selectedPlan.duration ? `/${selectedPlan.duration}` : ''}
              </div>
              
              {selectedPlan.description && (
                <p className="modal-plan-description">{selectedPlan.description}</p>
              )}
              
              {selectedPlan.features && selectedPlan.features.length > 0 && (
                <ul className="modal-plan-features">
                  {selectedPlan.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="feature-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <button 
              className="btn-primary btn-modal-action"
              onClick={() => proceedToCheckout(selectedPlan)}
            >
              Proceed to Payment
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => setShowSubscribeModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Minimal Aurax Branding Footer */}
      <div className="aurax-branding-footer">
        <span>Powered by</span>
        <a href="https://www.auraxai.in" target="_blank" rel="noopener noreferrer">
          AURAX
        </a>
      </div>
    </div>
  );
};

export default PublicCreatorPage;
