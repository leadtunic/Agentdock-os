import axios, { type AxiosInstance } from "axios";
import { getConfig } from "./config.js";

let apiClient: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (apiClient) return apiClient;

  const config = getConfig();
  apiClient = axios.create({
    baseURL: config.apiUrl || "http://localhost:8000",
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
  });

  apiClient.interceptors.request.use((cfg) => {
    if (config.token) {
      cfg.headers.Authorization = `Bearer ${config.token}`;
    }
    return cfg;
  });

  apiClient.interceptors.response.use(
    (r) => r,
    (err) => {
      if (err.response?.status === 401) {
        console.error("Authentication expired. Run: agentdock auth login");
      }
      return Promise.reject(err);
    },
  );

  return apiClient;
}

export async function api<T>(method: string, url: string, data?: unknown): Promise<T> {
  const client = getApiClient();
  const response = await client.request({ method, url, data });
  return response.data as T;
}
