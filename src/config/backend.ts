// Backend service URLs - Update these with your deployed Cloud Run URLs
export const BACKEND_CONFIG = {
  generateAppUrl: import.meta.env.VITE_GENERATE_APP_URL || 'https://generate-app-xxxxx-uc.a.run.app',
  buildApkUrl: import.meta.env.VITE_BUILD_APK_URL || 'https://build-apk-xxxxx-uc.a.run.app',
  buildStatusUrl: import.meta.env.VITE_BUILD_STATUS_URL || 'https://build-status-xxxxx-uc.a.run.app',
} as const;

// Helper to get auth headers
export const getAuthHeaders = async (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});
