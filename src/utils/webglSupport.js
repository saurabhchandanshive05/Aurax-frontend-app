// WebGL capability tier for the homepage 3D hero, detected once per page load.
//   "hardware": GPU-accelerated WebGL, full animated scene
//   "software": WebGL works but is drawn on the CPU (SwiftShader, llvmpipe, Microsoft Basic
//               Render Driver, or the browser reports a "major performance caveat"); setting
//               up the scene there blocked the page for ~3s in testing, so it is not started
//   "none":     no WebGL at all
// Only "hardware" gets the 3D scene (and downloads its code).
let cached = null;

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i;

function release(gl) {
  try {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    /* context already gone */
  }
}

export function webglTier() {
  if (cached) return cached;
  if (typeof document === "undefined") return (cached = "hardware");
  try {
    const canvas = document.createElement("canvas");
    // Fails when the browser would fall back to a slow (software) implementation
    const fast = canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
    if (fast) {
      const info = fast.getExtension("WEBGL_debug_renderer_info");
      const renderer = info ? String(fast.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
      release(fast);
      return (cached = SOFTWARE_RENDERER.test(renderer) ? "software" : "hardware");
    }
    const any = document.createElement("canvas").getContext("webgl");
    if (any) {
      release(any);
      return (cached = "software");
    }
    return (cached = "none");
  } catch {
    return (cached = "none");
  }
}
