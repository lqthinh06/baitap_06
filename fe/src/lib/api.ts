import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

export const getErrMsg = (e: any) =>
  e?.response?.data?.message || e?.message || "Có lỗi xảy ra, vui lòng thử lại.";


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});