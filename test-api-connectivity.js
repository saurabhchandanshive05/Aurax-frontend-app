// Quick API connectivity test
const testAPI = async () => {
  try {
    console.log("Testing API connectivity...");

    // Test health endpoint
    const healthResponse = await fetch("http://localhost:5002/health");
    console.log("Health Status:", healthResponse.status);
    const healthData = await healthResponse.json();
    console.log("Health Data:", healthData);

    // Test API test endpoint
    const apiResponse = await fetch("http://localhost:5002/api/test");
    console.log("API Test Status:", apiResponse.status);
    const apiData = await apiResponse.json();
    console.log("API Test Data:", apiData);
  } catch (error) {
    console.error("API Test Error:", error);
  }
};

testAPI();
