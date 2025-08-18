import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../components/styles/CreatorLogin.module.css";

const CreatorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Simple validation
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    // Successful login logic
    navigate("/creator/dashboard");
  };

  return (
    <div className={styles.container}>
      <div className={styles.gradientBackground}></div>
      <div className={styles.particles}>
        {[...Array(15)].map((_, i) => (
          <div key={i} className={styles.particle}></div>
        ))}
      </div>

      <div className={styles.loginContainer}>
        <div className={styles.illustrationSide}>
          <div className={styles.creatorAvatar}></div>
          <div className={styles.creatorStats}>
            <div className={styles.statCard}>
              <h3>10K+</h3>
              <p>Creators</p>
            </div>
            <div className={styles.statCard}>
              <h3>500+</h3>
              <p>Brands</p>
            </div>
            <div className={styles.statCard}>
              <h3>$5M+</h3>
              <p>Paid</p>
            </div>
          </div>
        </div>

        <div className={styles.formSide}>
          <div className={styles.glowBorder}></div>
          <div className={styles.formContent}>
            <h1 className={styles.title}>Creator Login</h1>
            <p className={styles.subtitle}>Welcome back to your creator hub</p>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  placeholder=" "
                  required
                />
                <label className={styles.label}>Email</label>
                <div className={styles.inputGlow}></div>
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  placeholder=" "
                  required
                />
                <label className={styles.label}>Password</label>
                <div className={styles.inputGlow}></div>
              </div>

              <div className={styles.options}>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span className={styles.checkmark}></span>
                  Remember me
                </label>
                <a href="#" className={styles.forgotPassword}>
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className={styles.loginButton}>
                <span>Login</span>
                <div className={styles.buttonGlow}></div>
              </button>
            </form>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <button className={styles.registerButton}>Join as Creator</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorLogin;
