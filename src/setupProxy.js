const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://backend-copy.onrender.com",
      changeOrigin: true,
      secure: true,
      logLevel: "debug",
      onProxyReq: (proxyReq, req) => {
        console.log(`[COPY-PROXY] ${proxyReq.method} ${proxyReq.path}`);
        // Add copy environment headers
        proxyReq.setHeader("X-Copy-Environment", "true");
        proxyReq.setHeader("X-Database", "influencer_copy");
      },
      onError: (err, req, res) => {
        console.error("[COPY-PROXY ERROR]", err);
        if (!res.headersSent) {
          res.status(503).json({
            error: "Copy backend connection failed",
            details: err.message,
            backend: "https://backend-copy.onrender.com",
          });
        }
      },
    })
  );
};
