import { API_CONFIG } from "../config.js";
import { getAccessToken } from "../utils/auth.js";

const ENDPOINTS = {
  LOGIN: `${API_CONFIG.BASE_URL}/login`,
};

export async function loginUser({ email, password }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login gagal. Silakan coba lagi.");
    } catch (e) {
      if (response.status === 400 || response.status === 401) {
        throw new Error("Email atau password yang Anda masukkan salah.");
      }
      throw new Error(
        `Terjadi kesalahan pada server (Status: ${response.status})`
      );
    }
  }

  return response.json();
}
