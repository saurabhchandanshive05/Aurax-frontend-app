import React, { useState } from "react";
import AuraLogo from "./AuraLogo";
import "./LogoDemo.css";

const LogoDemo = () => {
  const [currentSize, setCurrentSize] = useState("medium");
  const [showText, setShowText] = useState(true);
  const [animated, setAnimated] = useState(true);
  const [showVortex, setShowVortex] = useState(true);

  const sizes = ["small", "medium", "large", "xlarge"];

  return (
    <div className="logo-demo">
      <div className="demo-header">
        <h1>AURA AI Logo - Enhanced Animation Demo</h1>
        <p>
          Interactive demonstration of the mobile-first navbar logo with
          advanced animations
        </p>
      </div>

      <div className="demo-controls">
        <div className="control-group">
          <label>Size:</label>
          <select
            value={currentSize}
            onChange={(e) => setCurrentSize(e.target.value)}
          >
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showText}
              onChange={(e) => setShowText(e.target.checked)}
            />
            Show Text
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={animated}
              onChange={(e) => setAnimated(e.target.checked)}
            />
            Animated
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showVortex}
              onChange={(e) => setShowVortex(e.target.checked)}
            />
            Show 3D Vortex
          </label>
        </div>
      </div>

      <div className="demo-showcase">
        <div className="navbar-demo">
          <h3>Navbar Preview</h3>
          <div className="mock-navbar">
            <AuraLogo
              size={currentSize}
              showText={showText}
              animated={animated}
              showVortex={showVortex}
            />
            <nav className="mock-nav-items">
              <span>Home</span>
              <span>Features</span>
              <span>About</span>
              <span>Contact</span>
            </nav>
          </div>
        </div>

        <div className="standalone-demo">
          <h3>Standalone Logo</h3>
          <div className="logo-container">
            <AuraLogo
              size={currentSize}
              showText={showText}
              animated={animated}
              showVortex={showVortex}
            />
          </div>
        </div>
      </div>

      <div className="demo-features">
        <h3>Animation Features</h3>
        <div className="feature-grid">
          <div className="feature-card">
            <h4>🔄 Breathing Animation</h4>
            <p>Subtle 2% scale variation every 4 seconds</p>
          </div>
          <div className="feature-card">
            <h4>✨ Hover Effects</h4>
            <p>Brightness boost and soft cyan glow</p>
          </div>
          <div className="feature-card">
            <h4>💥 Click Pulse</h4>
            <p>Dynamic pulse with ripple effect</p>
          </div>
          <div className="feature-card">
            <h4>🌀 3D Vortex</h4>
            <p>Rotating spiral element with acceleration</p>
          </div>
          <div className="feature-card">
            <h4>📱 Mobile Optimized</h4>
            <p>GPU-accelerated and battery efficient</p>
          </div>
          <div className="feature-card">
            <h4>♿ Accessible</h4>
            <p>Respects reduced motion preferences</p>
          </div>
        </div>
      </div>

      <div className="demo-usage">
        <h3>Usage Examples</h3>
        <div className="code-examples">
          <div className="code-block">
            <h4>Navbar Implementation</h4>
            <pre>{`<AuraLogo 
  size="medium" 
  showText={false} 
  showVortex={true} 
/>`}</pre>
          </div>
          <div className="code-block">
            <h4>Hero Section</h4>
            <pre>{`<AuraLogo 
  size="xlarge" 
  showText={true} 
  animated={true} 
/>`}</pre>
          </div>
          <div className="code-block">
            <h4>Mobile Navbar</h4>
            <pre>{`<AuraLogo 
  size="small" 
  showText={false} 
  showVortex={false} 
/>`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoDemo;
