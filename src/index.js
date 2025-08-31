import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element");
  const errorDiv = document.createElement("div");
  errorDiv.style.color = "red";
  errorDiv.style.padding = "20px";
  errorDiv.style.fontFamily = "monospace";
  errorDiv.textContent =
    "Error: Could not find root element. Check public/index.html";
  document.body.appendChild(errorDiv);
}

if (process.env.NODE_ENV === 'development') {
  window.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }, false);
}

reportWebVitals();
