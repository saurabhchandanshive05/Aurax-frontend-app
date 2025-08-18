const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5001",
      changeOrigin: true,
      secure: false,
      logLevel: "debug",
      onProxyReq: (proxyReq) => {
        console.log(`[PROXY] ${proxyReq.method} ${proxyReq.path}`);
      },
      onError: (err, req, res) => {
        console.error("[PROXY ERROR]", err);
        if (!res.headersSent) {
          res.status(503).json({
            error: "Backend connection failed",
            details: err.message,
          });
        }
      },
    })
  );
};
