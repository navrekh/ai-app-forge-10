// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.appdev.co.in';

export const BACKEND_CONFIG = {
  apiBaseUrl: API_BASE_URL,
  generateAppUrl: `${API_BASE_URL}/api/generate-app`,
  buildApkUrl: `${API_BASE_URL}/api/build-apk`,
  buildStatusUrl: `${API_BASE_URL}/api/build-status`,
  healthUrl: `${API_BASE_URL}/health`,
} as const;

// Helper to get auth headers
export const getAuthHeaders = async (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});
