// Backend API configuration
export const BACKEND_API_URL = import.meta.env.VITE_API_URL || 'https://api.appdev.co.in';

export const ENDPOINTS = {
  START_BUILD: `${BACKEND_API_URL}/api/build/start`,
  BUILD_STATUS: (id: string) => `${BACKEND_API_URL}/api/build-status/${id}`,
  BUILD_APK: `${BACKEND_API_URL}/api/build-apk`,
  HEALTH: `${BACKEND_API_URL}/health`,
};

// Helper to get auth headers
export const getAuthHeaders = async (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});
