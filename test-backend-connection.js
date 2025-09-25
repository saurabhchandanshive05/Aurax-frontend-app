// Quick Backend Connection Test
const axios = require("axios");

async function testBackend() {
  try {
    console.log("🔄 Testing backend connection...");

    // Test if server is running
    const response = await axios.get("http://localhost:5002/api/health", {
      timeout: 5000,
    });

    console.log("✅ Backend is running!");
    console.log("Response:", response.data);
  } catch (error) {
    console.log("❌ Backend connection failed:");

    if (error.code === "ECONNREFUSED") {
      console.log("   → Backend server is not running on port 5002");
      console.log("   → Make sure to run: npm start in backend-copy directory");
    } else if (error.code === "ENOTFOUND") {
      console.log("   → DNS/Network issue");
    } else if (error.response) {
      console.log(
        "   → HTTP Error:",
        error.response.status,
        error.response.statusText
      );
    } else {
      console.log("   → Error:", error.message);
    }
  }
}

testBackend();
