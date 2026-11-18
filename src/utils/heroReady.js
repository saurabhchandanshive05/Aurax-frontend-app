// "Hero is ready" signal for the homepage.
// Below-the-fold sections hold back their network and animation work (creator photos, video
// posters, autoplay, looping CSS animations) until the hero has finished its own startup, so on
// slow devices and connections the hero is not competing with content the visitor can't see yet.
//
// Marked ready by: the desktop 3D scene once it shows its first card (or 4s after its code
// arrives if WebGL never draws, or at once if that code fails to download; see Hero.jsx and
// HeroScene.jsx), the compact (mobile/tablet) hero right after it mounts, or the backstop below.
// The backstop is deliberately long: on slow connections the 3D code alone can take several
// seconds, and a short timer would release everything before the hero is ready. It also covers
// pages without the hero (the footer still starts as soon as it nears the viewport).

const BACKSTOP_MS = 15000;

let ready = false;
const listeners = new Set();

export function markHeroReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((fn) => fn());
  listeners.clear();
}

export function isHeroReady() {
  return ready;
}

// Calls fn once the hero is ready (immediately if it already is). Returns an unsubscribe function.
export function onHeroReady(fn) {
  if (ready) {
    fn();
    return () => {};
  }
  listeners.add(fn);
  return () => listeners.delete(fn);
}

if (typeof window !== "undefined") {
  window.setTimeout(markHeroReady, BACKSTOP_MS);
}
