import { ReelInfoData } from '../types';

// Backend URL from Vite environment variables (must be prefixed with VITE_)
// For local dev, this can be http://localhost:3001
// For deployed version, this will be your Fly.io backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

interface FetchReelInfoResponse {
  success: boolean;
  data?: ReelInfoData;
  message?: string;
}

export const reelInfoService = {
  fetchReelInfo: async (reelUrl: string): Promise<ReelInfoData> => {
    if (!BACKEND_URL) {
      throw new Error("Backend API URL (VITE_BACKEND_API_URL) is not configured. Please set it in your .env file or hosting provider.");
    }
    if (!reelUrl) {
      throw new Error("Instagram Reel URL cannot be empty.");
    }

    let response;
    try {
      response = await fetch(`${BACKEND_URL}/api/extract-reel-data?url=${encodeURIComponent(reelUrl)}`);
    } catch (networkError) { // This catches "Failed to fetch" and other network-level errors
      console.error("Network error fetching reel data:", networkError);
      throw new Error(
        `Failed to connect to the backend server at ${BACKEND_URL}. ` +
        "Please ensure the backend server is running and accessible. " +
        "Original error: " + (networkError instanceof Error ? networkError.message : String(networkError))
      );
    }

    if (!response.ok) {
      let errorMessage = `Backend server responded with an error. Status: ${response.status}`;
      try {
        const errorData: FetchReelInfoResponse = await response.json();
        if (errorData.message) {
          errorMessage = `Backend error: ${errorData.message}`; // Use backend's specific message
        }
      } catch (e) {
        // Could not parse error JSON from backend, stick with status-based message
        errorMessage = `Backend server responded with ${response.status}, but the error details could not be parsed. Check backend logs.`;
      }
      console.error("Error from backend:", errorMessage);
      throw new Error(errorMessage);
    }

    let result: FetchReelInfoResponse;
    try {
        result = await response.json();
    } catch (jsonError) {
        console.error("Error parsing JSON response from backend:", jsonError);
        throw new Error("Failed to parse response from the backend. The response might not be valid JSON.");
    }
    

    if (!result.success || !result.data) {
      console.error("Backend reported an issue or did not return data:", result.message);
      throw new Error(result.message || "Backend reported an unspecified error or did not return the expected data.");
    }

    return result.data;
  },
};
