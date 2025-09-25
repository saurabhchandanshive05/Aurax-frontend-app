import React, { useState, useEffect } from "react";
import AuraLogo from "./AuraLogo";
import "./AuraxLogoShowcase.css";

const AuraxLogoShowcase = () => {
  const [currentDemo, setCurrentDemo] = useState("intro");
  const [showIntro, setShowIntro] = useState(true);
  const [showOutro, setShowOutro] = useState(false);

  // Demo sequence: Intro → Main → Outro
  useEffect(() => {
    const sequence = async () => {
      // Intro phase (2 seconds)
      setTimeout(() => {
        setCurrentDemo("main");
        setShowIntro(false);
      }, 2000);

      // Main phase (5 seconds)
      setTimeout(() => {
        setCurrentDemo("outro");
        setShowOutro(true);
      }, 7000);

      // Reset to intro (2 seconds outro)
      setTimeout(() => {
        setCurrentDemo("intro");
        setShowIntro(true);
        setShowOutro(false);
      }, 9000);
    };

    const interval = setInterval(sequence, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="aurax-showcase">
      <div className="showcase-header">
        <h1>AURAX - Enhanced Visual Design Showcase</h1>
        <p>
          Featuring premium 3D animations, geometric design, and intelligent
          motion
        </p>
      </div>

      {/* Main Demo Area */}
      <div className={`demo-stage ${currentDemo}`}>
        <div className="demo-background">
          <div className="gradient-layer"></div>
          <div className="particle-field">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="floating-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="logo-presentation">
          {currentDemo === "intro" && (
            <div className="intro-phase">
              <div className="fade-in-logo">
                <AuraLogo
                  size="xlarge"
                  showText={false}
                  animated={true}
                  showVortex={true}
                  className="showcase-logo intro-logo"
                />
              </div>
              <div className="intro-text">
                <h2>AURAX</h2>
                <p>Premium AI Platform</p>
              </div>
            </div>
          )}

          {currentDemo === "main" && (
            <div className="main-phase">
              <AuraLogo
                size="xlarge"
                showText={true}
                animated={true}
                showVortex={true}
                className="showcase-logo main-logo"
              />
              <div className="feature-highlights">
                <div className="feature-point">
                  <div className="feature-icon">🅰️</div>
                  <p>Geometric AURAX Typography</p>
                </div>
                <div className="feature-point">
                  <div className="feature-icon">🌀</div>
                  <p>Symmetrical Vortex Pattern</p>
                </div>
                <div className="feature-point">
                  <div className="feature-icon">💎</div>
                  <p>Premium Cyan Gradients</p>
                </div>
                <div className="feature-point">
                  <div className="feature-icon">✨</div>
                  <p>Purple Accent Elements</p>
                </div>
              </div>
            </div>
          )}

          {currentDemo === "outro" && (
            <div className="outro-phase">
              <div className="brightened-logo">
                <AuraLogo
                  size="large"
                  showText={false}
                  animated={true}
                  showVortex={true}
                  className="showcase-logo outro-logo"
                />
              </div>
              <div className="outro-text">
                <h3>Connecting Creators & Brands</h3>
                <p>AI-Powered Intelligence</p>
              </div>
            </div>
          )}
        </div>

        {/* Demo Controls */}
        <div className="demo-controls">
          <button
            className={currentDemo === "intro" ? "active" : ""}
            onClick={() => setCurrentDemo("intro")}
          >
            Intro
          </button>
          <button
            className={currentDemo === "main" ? "active" : ""}
            onClick={() => setCurrentDemo("main")}
          >
            Main
          </button>
          <button
            className={currentDemo === "outro" ? "active" : ""}
            onClick={() => setCurrentDemo("outro")}
          >
            Outro
          </button>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="tech-specs">
        <h3>Enhanced Visual Features</h3>
        <div className="specs-grid">
          <div className="spec-card">
            <h4>🅰️ Central Element</h4>
            <ul>
              <li>Stylized "AURAX" typography</li>
              <li>Clean, geometric, and modern</li>
              <li>Bright cyan/blue gradient tones</li>
              <li>Sharp, tech-forward branding</li>
            </ul>
          </div>
          <div className="spec-card">
            <h4>🌀 Vortex Pattern</h4>
            <ul>
              <li>Symmetrical curved motifs</li>
              <li>Evokes motion and intelligence</li>
              <li>Blue/cyan gradient transitions</li>
              <li>Suggests depth and fluidity</li>
            </ul>
          </div>
          <div className="spec-card">
            <h4>💜 Purple Accents</h4>
            <ul>
              <li>Corner dot clusters</li>
              <li>Visual rhythm and contrast</li>
              <li>Animated opacity variations</li>
              <li>Premium brand identity</li>
            </ul>
          </div>
          <div className="spec-card">
            <h4>🌌 Dark Background</h4>
            <ul>
              <li>High contrast navy base</li>
              <li>Premium sophisticated feel</li>
              <li>Gradient animation potential</li>
              <li>Noise-free, sharpened visuals</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Animation Showcase */}
      <div className="animation-demo">
        <h3>Interactive Animation Features</h3>
        <div className="interaction-examples">
          <div className="example-card">
            <h4>Breathing Animation</h4>
            <div className="mini-logo-demo">
              <AuraLogo
                size="small"
                animated={true}
                showText={false}
                showVortex={false}
              />
            </div>
            <p>Subtle 2% scale variation with enhanced glow effects</p>
          </div>
          <div className="example-card">
            <h4>Vortex Rotation</h4>
            <div className="mini-logo-demo">
              <AuraLogo
                size="small"
                animated={true}
                showText={false}
                showVortex={true}
              />
            </div>
            <p>8-second symmetrical pattern rotation with depth</p>
          </div>
          <div className="example-card">
            <h4>Hover Effects</h4>
            <div className="mini-logo-demo hover-demo">
              <AuraLogo
                size="small"
                animated={true}
                showText={false}
                showVortex={true}
              />
            </div>
            <p>Brightness boost with multi-layer drop shadows</p>
          </div>
          <div className="example-card">
            <h4>Click Pulse</h4>
            <div className="mini-logo-demo">
              <AuraLogo
                size="small"
                animated={true}
                showText={false}
                showVortex={true}
              />
            </div>
            <p>Dynamic pulse with ripple effect and vortex acceleration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuraxLogoShowcase;
