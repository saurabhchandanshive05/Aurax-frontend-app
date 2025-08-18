import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("blue");

  // Theme configurations
  const themes = {
    dark: {
      name: "Dark",
      icon: "🌙",
      colors: {
        primary: "#667eea",
        secondary: "#764ba2",
        accent: "#00d4ff",
        background: "#0a0a0f",
        surface: "#1a1a2e",
        text: "#ffffff",
        textSecondary: "#a0a0a0",
        border: "rgba(255, 255, 255, 0.1)",
      },
    },
    light: {
      name: "Light",
      icon: "☀️",
      colors: {
        primary: "#667eea",
        secondary: "#764ba2",
        accent: "#00d4ff",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#1e293b",
        textSecondary: "#475569",
        border: "rgba(0, 0, 0, 0.1)",
      },
    },
    cyberpunk: {
      name: "Cyberpunk",
      icon: "🤖",
      colors: {
        primary: "#ff0080",
        secondary: "#00d4ff",
        accent: "#00ff88",
        background: "#0a0a0f",
        surface: "#1a1a2e",
        text: "#ffffff",
        textSecondary: "#a0a0a0",
        border: "rgba(255, 0, 128, 0.3)",
      },
    },
    sunset: {
      name: "Sunset",
      icon: "🌅",
      colors: {
        primary: "#fa709a",
        secondary: "#fee140",
        accent: "#ff6b35",
        background: "#0a0a0f",
        surface: "#1a1a2e",
        text: "#ffffff",
        textSecondary: "#a0a0a0",
        border: "rgba(250, 112, 154, 0.3)",
      },
    },
  };

  const accentColors = {
    blue: { primary: "#00d4ff", secondary: "#0099cc" },
    pink: { primary: "#ff0080", secondary: "#cc0066" },
    purple: { primary: "#8a2be2", secondary: "#6a1b9a" },
    green: { primary: "#00ff88", secondary: "#00cc6a" },
    orange: { primary: "#ff6b35", secondary: "#cc552a" },
    teal: { primary: "#00d4aa", secondary: "#00aa88" },
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedAccent = localStorage.getItem("accentColor");

    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (savedAccent) {
      setAccentColor(savedAccent);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = themes[theme];
    const currentAccent = accentColors[accentColor];

    // Apply theme colors
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply accent colors
    root.style.setProperty("--accent-primary", currentAccent.primary);
    root.style.setProperty("--accent-secondary", currentAccent.secondary);

    // Set data attributes for CSS targeting
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-accent", accentColor);

    // Add smooth transition
    root.style.setProperty("--theme-transition", "all 0.3s ease-in-out");

    // Save to localStorage
    localStorage.setItem("theme", theme);
    localStorage.setItem("accentColor", accentColor);
  }, [theme, accentColor]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setCustomTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const setCustomAccent = (newAccent) => {
    setAccentColor(newAccent);
  };

  const value = {
    theme,
    accentColor,
    themes,
    accentColors,
    currentTheme: themes[theme],
    currentAccent: accentColors[accentColor],
    toggleTheme,
    setCustomTheme,
    setCustomAccent,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
