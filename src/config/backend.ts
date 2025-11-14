export const BACKEND_API = {
  BASE_URL: import.meta.env.VITE_API_URL,
  START_BUILD: "/api/build/start",
  BUILD_STATUS: (id: string) => `/api/build-status/${id}`,
  BUILD_APK: "/api/build-apk",
};
