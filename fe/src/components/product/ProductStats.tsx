import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/authFetch';

export default function ProductStats({ productId }: { productId: string }) {
  const [s, setS] = useState<any>(null);
  useEffect(() => {
    apiGet(`http://localhost:4000/api/products/${productId}/stats`)
      .then(setS)
      .catch(()=>{});
  }, [productId]);

  if (!s) return null;
  return (
    <div className="text-sm text-muted-foreground flex flex-wrap gap-4">
      <span>Lượt xem: <b>{s.views}</b></span>
      <span>Yêu thích: <b>{s.wishlisted}</b></span>
      <span>Người mua: <b>{s.buyers}</b></span>
      <span>Người bình luận: <b>{s.commenters}</b></span>
    </div>
  );
}
