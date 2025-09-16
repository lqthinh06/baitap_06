import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

export default function SimilarProducts({ productId }: { productId: string }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch(`http://localhost:4000/api/products/${productId}/similar?limit=12`)
      .then(r => r.json())
      .then(d => setItems(d.products || []))
      .catch(()=>setItems([]));
  }, [productId]);

  if (!items.length) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Sản phẩm tương tự</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map(p => <ProductCard key={p.id} {...p} />)}
      </div>
    </section>
  );
}
