import axios from "axios";
import { API_BASE_URL } from "../lib/constants";
import { getToken, removeToken } from "../lib/secure-storage";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/staff`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Inject Bearer token on every request
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeToken();
    }
    return Promise.reject(error);
  }
);

export default api;
