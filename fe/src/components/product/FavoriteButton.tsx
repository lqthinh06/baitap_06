import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiPost } from '@/lib/authFetch';

export default function FavoriteButton({ productId, initial=false }: { productId: string; initial?: boolean }) {
  const [fav, setFav] = useState(!!initial);
  const toggle = async () => {
    const prev = fav;
    setFav(!prev);
    try {
      const d = await apiPost<{ favorited: boolean }>(`http://localhost:4000/api/products/${productId}/favorite`);
      setFav(d.favorited);
    } catch {
      setFav(prev);
    }
  };
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-pressed={fav} title={fav ? 'Bỏ yêu thích' : 'Thêm yêu thích'}>
      <Heart className={`h-4 w-4 ${fav ? 'fill-red-500 text-red-500' : ''}`} />
    </Button>
  );
}
