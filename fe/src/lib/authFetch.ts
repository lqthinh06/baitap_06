import { useAuthStore } from '@/stores/useAuth.stores';

export function authHeaders() {
  const token = useAuthStore.getState().data?.accessToken || localStorage.getItem('token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type':'application/json', ...(init?.headers||{}), ...authHeaders() }, credentials: 'include' as any });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost<T = any>(url: string, body?: any, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...init, headers: { 'Content-Type':'application/json', ...(init?.headers||{}), ...authHeaders() }, credentials: 'include' as any });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
