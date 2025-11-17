import axios from "axios";
import { cognitoAuth } from "./cognitoAuth";

const API_BASE = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Add JWT token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await cognitoAuth.getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      window.location.href = '/auth-cognito';
    }
    return Promise.reject(error);
  }
);
