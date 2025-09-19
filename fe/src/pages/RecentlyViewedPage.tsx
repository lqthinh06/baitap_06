// fe/src/pages/RecentlyViewedPage.tsx
import { useEffect, useState, useMemo } from "react";
import ProductCard from "@/components/product/ProductCard";
import { apiFetch } from "@/lib/api1";
import { getLocalRecentlyViewed } from "@/features/recentlyViewed/recentlyViewed";
import BackButton from "@/components/BackButton";

export default function RecentlyViewedPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/products/me/recently-viewed");
        setItems(Array.isArray(data.products) && data.products.length ? data.products : getLocalRecentlyViewed());
      } catch {
        setItems(getLocalRecentlyViewed());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasItems = useMemo(() => items && items.length > 0, [items]);

  if (loading) return <div className="container mx-auto py-6">Đang tải...</div>;

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sản phẩm đã xem</h1>
        <BackButton fallback="/" />
      </div>

      {!hasItems ? (
        <div className="text-muted-foreground">Bạn chưa xem sản phẩm nào.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      )}
    </div>
  );
}
