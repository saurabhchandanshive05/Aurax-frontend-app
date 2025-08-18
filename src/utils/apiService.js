import { apiClient, handleAPIError } from "./apiClient";

// Test backend connection
export const testBackendConnection = async () => {
  try {
    const response = await apiClient.get("/test");
    return response;
  } catch (error) {
    handleAPIError(error);
    return {
      status: "error",
      message: `Connection to backend failed: ${error.message}`,
    };
  }
};

// Submit data to backend with improved error handling
export const submitData = async (data) => {
  try {
    const response = await apiClient.post("/submit", { data });
    return response;
  } catch (error) {
    handleAPIError(error);
    return {
      status: "error",
      message: error.message,
      details: error.details,
    };
  }
};

// Fetch creators with optional filters
export const fetchCreators = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(
      `/creators${query ? `?${query}` : ""}`
    );
    return response;
  } catch (error) {
    handleAPIError(error);
    return { status: "error", message: error.message };
  }
};

export const fetchBrands = async () => {
  try {
    const response = await apiClient.get(`/brands`);
    return response;
  } catch (error) {
    handleAPIError(error);
    return { status: "error", message: error.message };
  }
};
