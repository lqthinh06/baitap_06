// fe/src/features/recentlyViewed/recentlyViewed.ts
const KEY = "rv_products"; // fallback cho khách ẩn danh

export const addToLocalRecentlyViewed = (p: any) => {
  const max = 30;
  const raw = localStorage.getItem(KEY);
  const arr = raw ? JSON.parse(raw) as any[] : [];
  const filtered = arr.filter(x => x.id !== p.id);
  filtered.unshift({ ...p, viewedAt: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(filtered.slice(0, max)));
};

export const getLocalRecentlyViewed = (): any[] => {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
};
