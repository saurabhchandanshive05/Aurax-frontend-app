// Fix global objects required by Three.js
if (typeof global === "undefined") {
  window.global = window;
}

if (typeof process === "undefined") {
  window.process = {
    env: {},
    cwd: () => "/",
    version: "",
    versions: {},
    platform: "browser",
  };
}

// Add requestAnimationFrame polyfill if needed
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (callback) => {
    return setTimeout(callback, 1000 / 60);
  };
}

// Add cancelAnimationFrame polyfill
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (id) => {
    clearTimeout(id);
  };
}
