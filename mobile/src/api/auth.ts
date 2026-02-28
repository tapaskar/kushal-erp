import api from "./client";
import { API_BASE_URL } from "../lib/constants";
import axios from "axios";

export async function login(phone: string, password: string) {
  // Use raw axios for login since we don't have a token yet
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/staff/auth/login`,
    { phone, password }
  );
  return response.data;
}

export async function refreshToken() {
  const response = await api.post("/auth/refresh");
  return response.data;
}

export async function getMe() {
  const response = await api.get("/auth/me");
  return response.data;
}

export async function updateConsent(consent: boolean) {
  const response = await api.put("/auth/consent", { consent });
  return response.data;
}
