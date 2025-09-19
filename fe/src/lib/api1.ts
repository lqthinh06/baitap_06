// fe/src/lib/api.ts
export const API_BASE = "http://localhost:4000/api";

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const headers: any = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
};
