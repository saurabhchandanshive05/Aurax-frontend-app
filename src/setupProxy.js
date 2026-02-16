const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5002",
      changeOrigin: true,
      secure: false,
      logLevel: "debug",
      onProxyReq: (proxyReq, req) => {
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
