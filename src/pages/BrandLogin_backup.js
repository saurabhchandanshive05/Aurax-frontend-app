import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../utils/apiClient";
import styles from "./BrandLogin.module.css";

const BrandLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setLoginError("");

    try {
      const sanitized = {
        email: (email || "").trim().toLowerCase(),
        password: (password || "").trim(),
      };
      const resp = await apiClient.login(sanitized);
      const redirectPath = login(resp.token);
      navigate(redirectPath);
    } catch (err) {
      const isAuthError = err && (err.status === 401 || err.status === 403);
      setLoginError(
        isAuthError
          ? "Invalid email or password. Please try again."
          : "Login failed. Please try again."
      );
      console.error("Login error:", err?.status, err?.message || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Focus animations
  useEffect(() => {
    const inputs = [emailRef.current, passwordRef.current];

    const focusHandler = (e) => {
      e.target.parentElement.classList.add(styles.inputFocused);
    };

    const blurHandler = (e) => {
      if (!e.target.value) {
        e.target.parentElement.classList.remove(styles.inputFocused);
      }
    };

    inputs.forEach((input) => {
      if (input) {
        input.addEventListener("focus", focusHandler);
        input.addEventListener("blur", blurHandler);
      }
    });

    return () => {
      inputs.forEach((input) => {
        if (input) {
          input.removeEventListener("focus", focusHandler);
          input.removeEventListener("blur", blurHandler);
        }
      });
    };
  }, []);

  return (
    <div className={styles.loginContainer}>
      {/* Animated background particles */}
      <div className={styles.particlesContainer}>
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            background: {
              color: {
                value: "transparent",
              },
            },
            fpsLimit: 60,
            particles: {
              color: {
                value: "#3b82f6",
              },
              links: {
                color: "#60a5fa",
                distance: 150,
                enable: true,
                opacity: 0.3,
                width: 1,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "bounce",
                },
                random: false,
                speed: 1,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  area: 800,
                },
                value: 60,
              },
              opacity: {
                value: 0.5,
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: 1, max: 3 },
              },
            },
            detectRetina: true,
          }}
        />
      </div>

      {/* Floating tech elements */}
      <div className={styles.floatingCircleTop}></div>
      <div className={styles.floatingCircleBottom}></div>

      {/* Login card */}
      <div className={styles.loginCard}>
        {/* Glowing border effect */}
        <div className={styles.glowBorder}></div>

        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <div className={styles.logoGradient}>
              <div className={styles.logoBg}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.logoIcon}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
          <h1 className={styles.title}>Brand Portal</h1>
          <p className={styles.subtitle}>
            Secure access to your campaigns & analytics
          </p>
        </div>

        {loginError && <div className={styles.errorAlert}>{loginError}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={`${styles.inputContainer} ${styles.inputGroup}`}>
            <label htmlFor="email" className={styles.inputLabel}>
              Email Address
            </label>
            <input
              ref={emailRef}
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.inputField}
            />
            {errors.email && <p className={styles.errorText}>{errors.email}</p>}
          </div>

          <div className={`${styles.inputContainer} ${styles.inputGroup}`}>
            <label htmlFor="password" className={styles.inputLabel}>
              Password
            </label>
            <input
              ref={passwordRef}
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputField}
            />
            {errors.password && (
              <p className={styles.errorText}>{errors.password}</p>
            )}
          </div>

          <div className={styles.optionsContainer}>
            <div className={styles.rememberMe}>
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={styles.checkbox}
              />
              <label htmlFor="remember-me" className={styles.rememberLabel}>
                Remember me
              </label>
            </div>
            <Link to="/coming-soon" className={styles.forgotPassword}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <>
                <svg
                  className={styles.spinner}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className={styles.spinnerCircle}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className={styles.spinnerPath}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </>
            ) : (
              "Sign in as Brand"
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <div className={styles.dividerContainer}>
            <div className={styles.divider}></div>
            <span className={styles.dividerText}>Or continue with</span>
          </div>

          <div className={styles.socialButtons}>
            <button className={styles.socialButton}>
              <svg
                className={styles.socialIcon}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </button>
            <button className={styles.socialButton}>
              <svg
                className={styles.socialIcon}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
            </button>
          </div>

          <div className={styles.signupLink}>
            Don't have an account?{" "}
            <Link to="/signup" className={styles.signupText}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandLogin;
