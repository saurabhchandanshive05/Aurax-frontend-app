import React from 'react';
import './GlobalLoadingScreen.css';

const GlobalLoadingScreen = ({ message = "Loading AURAX..." }) => {
  return (
    <div className="global-loading-screen">
      <div className="global-loading-content">
        <div className="aurax-logo-loader">
          <div className="logo-circle-loader">
            <span className="logo-text-loader">AURAX</span>
          </div>
        </div>
        <div className="loading-spinner"></div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default GlobalLoadingScreen;
