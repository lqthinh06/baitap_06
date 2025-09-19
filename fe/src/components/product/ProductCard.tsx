// fe/src/components/ProductCard.tsx
import { Heart, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWishlist } from "@/features/wishlist/useWishlist";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const slugify = (s: string) =>
  s.toLowerCase()
   .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
   .replace(/[^a-z0-9]+/g, "-")
   .replace(/(^-|-$)/g, "");

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  sold: number;
  discount?: number;
}

const ProductCard = (props: ProductCardProps) => {
  const { id, name, price, originalPrice, image, rating, sold, discount } = props;
  const navigate = useNavigate();
  const to = useMemo(() => `/product/${id}/${slugify(name)}`, [id, name]);
 
  const { ids, check, toggle } = useWishlist();
  const [liked, setLiked] = useState(ids.has(id));

  useEffect(() => { setLiked(ids.has(id)); }, [ids, id]);
  useEffect(() => { check(id).catch(() => {}); }, [id, check]);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  const goDetail = () => navigate(to);

  return (
    <Card
      onClick={goDetail}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goDetail(); } }}
      role="button"
      tabIndex={0}
      className="group relative overflow-hidden cursor-pointer bg-product-bg border-product-border shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden">
        {discount ? (
          <div className="absolute top-2 left-2 bg-sale text-white px-2 py-1 text-xs font-semibold rounded z-10">
            -{discount}%
          </div>
        ) : null}

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id).then(setLiked).catch(()=>{}); }}
          className={`absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity ${liked ? "text-rose-600" : ""}`}
          aria-label={liked ? "Bỏ yêu thích" : "Thêm yêu thích"}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        </Button>

        <div className="aspect-square overflow-hidden bg-muted/20">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-medium text-sm line-clamp-2 text-card-foreground min-h-[2.5rem]">
          {name}
        </h3>

        <div className="flex items-center space-x-1 text-xs">
          <div className="flex items-center">
            <Star className="h-3 w-3 fill-rating text-rating" />
            <span className="ml-1 text-muted-foreground">{rating}</span>
          </div>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">Đã bán {sold}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-lg font-bold text-price">{formatPrice(price)}</div>
            {originalPrice && (
              <div className="text-xs text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </div>
            )}
          </div>
          <Button
            size="icon"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* add-to-cart ở đây */ }}
            className="bg-gradient-primary hover:opacity-90 shadow-primary"
            aria-label="Thêm vào giỏ"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
