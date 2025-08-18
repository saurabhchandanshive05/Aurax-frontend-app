import React from "react";
import "./ComingSoonPage.css";

function ComingSoonPage() {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-content">
        <h1 className="coming-soon-title">Coming Soon</h1>
        <p className="coming-soon-text">
          We're working hard to bring you an amazing creator experience!
        </p>

        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <div className="progress-text">70% Complete</div>
        </div>

        <p className="coming-soon-subtext">
          Our creator dashboard and login features will be available shortly.
          Stay tuned!
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>AI-Powered Matching</h3>
            <p>Smart algorithms connect brands with perfect creators</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h3>Premium Dashboard</h3>
            <p>Track campaigns, earnings, and analytics in one place</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Analytics</h3>
            <p>Monitor performance and optimize your content</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Secure Collaboration</h3>
            <p>Safe and efficient communication with brands</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComingSoonPage;
