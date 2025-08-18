import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../utils/apiClient";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "brand",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const v = {};
    if (!form.username.trim()) v.username = "Username is required";
    const email = form.email.trim().toLowerCase();
    if (!email) v.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      v.email = "Email is invalid";
    if (!form.password.trim()) v.password = "Password is required";
    else if (form.password.trim().length < 8) v.password = "Min 8 characters";
    setErrors(v);
    return Object.keys(v).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password.trim(),
        role: form.role,
      };
      const resp = await apiClient.register(payload);
      const token = resp?.token;
      if (token) {
        const redirect = login(token);
        navigate(redirect);
        return;
      }
      // Fallback if backend didn’t return token (shouldn’t happen now)
      navigate("/brand/login");
    } catch (err) {
      const isDup = err?.status === 409;
      const isBad = err?.status === 400;
      setSubmitError(
        isDup
          ? "Email already in use"
          : isBad
          ? "Please fix the highlighted errors"
          : "Signup failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(20,20,40,0.6)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
          Create your account
        </h1>
        <p style={{ opacity: 0.8, marginBottom: 16 }}>
          Sign up to get instant access.
        </p>

        {submitError && (
          <div
            style={{
              background: "#2b1a1a",
              color: "#ffb3b3",
              padding: 10,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>
            Username
          </label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            style={{
              width: "100%",
              marginTop: 6,
              marginBottom: 10,
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.25)",
              color: "#fff",
            }}
            placeholder="Your name"
          />
          {errors.username && (
            <div
              style={{
                color: "#ff9f9f",
                fontSize: 12,
                marginTop: -6,
                marginBottom: 8,
              }}
            >
              {errors.username}
            </div>
          )}

          <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>
            Email
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            style={{
              width: "100%",
              marginTop: 6,
              marginBottom: 10,
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.25)",
              color: "#fff",
            }}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email && (
            <div
              style={{
                color: "#ff9f9f",
                fontSize: 12,
                marginTop: -6,
                marginBottom: 8,
              }}
            >
              {errors.email}
            </div>
          )}

          <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>
            Password
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            style={{
              width: "100%",
              marginTop: 6,
              marginBottom: 10,
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.25)",
              color: "#fff",
            }}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
          {errors.password && (
            <div
              style={{
                color: "#ff9f9f",
                fontSize: 12,
                marginTop: -6,
                marginBottom: 8,
              }}
            >
              {errors.password}
            </div>
          )}

          <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>
            Role
          </label>
          <div style={{ display: "flex", gap: 12, margin: "6px 0 14px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="radio"
                name="role"
                value="brand"
                checked={form.role === "brand"}
                onChange={handleChange}
              />
              Brand
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="radio"
                name="role"
                value="creator"
                checked={form.role === "creator"}
                onChange={handleChange}
              />
              Creator
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              background: submitting
                ? "#26324a"
                : "linear-gradient(90deg,#2563eb,#22d3ee)",
              color: "#fff",
              border: 0,
              cursor: submitting ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div style={{ marginTop: 14, fontSize: 14, opacity: 0.9 }}>
          Already have an account?{" "}
          <Link to="/brand/login" style={{ color: "#60a5fa" }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
