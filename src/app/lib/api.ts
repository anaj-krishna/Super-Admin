import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const status = error?.response?.status;
      if (status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/superadmin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
