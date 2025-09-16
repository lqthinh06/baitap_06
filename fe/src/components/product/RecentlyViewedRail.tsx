import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

export default function RecentlyViewedRail() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    // thử lấy từ server nếu đã đăng nhập
    fetch('http://localhost:4000/api/products/recently-viewed', { credentials: 'include' as any, headers: { 'Content-Type':'application/json' } })
      .then(async r => {
        if (r.ok) {
          const d = await r.json();
          setItems(d.products || []);
        } else {
          throw new Error('noauth');
        }
      })
      .catch(async () => {
        const raw = localStorage.getItem('recentlyViewed');
        const ids: string[] = raw ? JSON.parse(raw) : [];
        if (!ids.length) return;
        const q = encodeURIComponent(ids.join(','));
        const d = await fetch(`http://localhost:4000/api/products/by-ids?ids=${q}`).then(r=>r.json());
        setItems(d.products || []);
      });
  }, []);

  if (!items.length) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Bạn đã xem gần đây</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((p:any) => <ProductCard key={p.id || p._id} {...p} id={p.id || p._id} />)}
      </div>
    </section>
  );
}