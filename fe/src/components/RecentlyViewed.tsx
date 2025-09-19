// fe/src/components/RecentlyViewed.tsx
import { useEffect, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { apiFetch } from "@/lib/api1";
import { getLocalRecentlyViewed } from "@/features/recentlyViewed/recentlyViewed";

export default function RecentlyViewed() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/products/me/recently-viewed");
        if (Array.isArray(data.products)) return setItems(data.products);
      } catch {
        // no-op
      }
      setItems(getLocalRecentlyViewed());
    })();
  }, []);

  if (!items.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold mb-3">Bạn đã xem gần đây</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((p) => <ProductCard key={p.id} {...p} />)}
      </div>
    </section>
  );
}
