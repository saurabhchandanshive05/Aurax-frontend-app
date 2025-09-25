const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Test server is working!");
});

const PORT = 3333;

server.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🌐 Test at: http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("❌ Server error:", error);
});
