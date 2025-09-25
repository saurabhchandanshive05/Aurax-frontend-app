// Quick Backend Port Discovery
const testPorts = [5000, 5001, 5002, 3001, 8000, 8080];

const testBackendPorts = async () => {
  console.log("🔍 Discovering backend port...\n");

  for (const port of testPorts) {
    try {
      console.log(`Testing port ${port}...`);
      const response = await fetch(`http://localhost:${port}/api/health`, {
        timeout: 2000,
      });
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Found backend on port ${port}!`);
        console.log("Response:", data);
        return port;
      }
    } catch (error) {
      // Try Instagram status endpoint
      try {
        const instagramResponse = await fetch(
          `http://localhost:${port}/api/instagram/status`,
          { timeout: 2000 }
        );
        if (instagramResponse.ok) {
          const data = await instagramResponse.json();
          console.log(`✅ Found Instagram API on port ${port}!`);
          console.log("Response:", data);
          return port;
        }
      } catch (instagramError) {
        // Continue to next port
      }
    }
  }

  console.log("❌ No backend found on common ports");
  console.log(
    "💡 Make sure your backend is running and try manually checking the port"
  );
  return null;
};

testBackendPorts().then((port) => {
  if (port) {
    console.log(`\n🎯 Update your setupProxy.js to use port ${port}`);
  }
});
