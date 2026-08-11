import axios from "axios";
import { useRouter } from "next/router";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("meu-ingresso-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("meu-ingresso-token");
        window.localStorage.removeItem("meu-ingresso-user");
        useRouter().push("/login");
      }
    }

    return Promise.reject(error);
  },
);

export async function getApiErrorMessage(error: unknown): Promise<string> {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message;
  }

  return "Erro inesperado. Tente novamente.";
}
