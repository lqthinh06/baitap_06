import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet, apiPost } from '@/lib/authFetch';
import FavoriteButton from '@/components/product/FavoriteButton';
import ProductStats from '@/components/product/ProductStats';
import SimilarProducts from '@/components/product/SimilarProducts';
import RecentlyViewedRail from '@/components/product/RecentlyViewedRail';

export default function ProductDetail() {
  const { id = '' } = useParams();
  const [p, setP] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    apiGet<{ product:any }>(`http://localhost:4000/api/products/${id}`)
      .then(d => setP(d.product))
      .catch(() => setP(null));

    // record view (server)
    apiPost(`http://localhost:4000/api/products/${id}/view`).catch(()=>{});

    // record view (localStorage cho khách)
    try {
      const key = 'recentlyViewed';
      const raw = localStorage.getItem(key);
      let arr: string[] = raw ? JSON.parse(raw) : [];
      arr = [id, ...arr.filter(x => x !== id)].slice(0, 20);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch {}
  }, [id]);

  if (!p) return null;

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-muted/10 rounded-xl overflow-hidden">
          <img src={p.image} alt={p.name} className="w-full h-auto" />
        </div>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold">{p.name}</h1>
            <FavoriteButton productId={id} />
          </div>
          <div className="text-3xl font-bold">{p.price?.toLocaleString('vi-VN')}₫</div>
          {p.originalPrice ? <div className="text-sm line-through text-muted-foreground">{p.originalPrice?.toLocaleString('vi-VN')}₫</div> : null}
          <ProductStats productId={id} />
          <button className="rounded-xl bg-indigo-600 text-white px-5 py-3 font-semibold hover:bg-indigo-700 transition shadow-sm">
            Thêm vào giỏ
          </button>
        </div>
      </div>

      <SimilarProducts productId={id} />
      <RecentlyViewedRail />
    </div>
  );
}
