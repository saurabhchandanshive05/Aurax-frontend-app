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
        <p className="coming-soon-subtext">
          Our creator dashboard and login features will be available shortly.
          Stay tuned!
        </p>

        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <div className="progress-text">
            Development in progress - 70% complete
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComingSoonPage;
