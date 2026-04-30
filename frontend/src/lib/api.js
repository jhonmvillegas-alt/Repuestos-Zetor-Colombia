import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;
export const ASSET_BASE = BACKEND_URL;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Attach token from localStorage as bearer too (for cross-site fallback)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("zetor_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Resolve a stored image URL — supports relative /api/uploads paths
export const resolveImage = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${ASSET_BASE}${url}`;
};
