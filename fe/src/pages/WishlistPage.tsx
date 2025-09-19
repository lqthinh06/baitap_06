// fe/src/pages/WishlistPage.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api1";
import ProductCard from "../components/product/ProductCard";
import BackButton from "@/components/BackButton";

export default function WishlistPage() {
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    apiFetch("/wishlist").then((d) => setProducts(d.products || [])).catch(()=>{});
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-semibold">Sản phẩm yêu thích</h1>
        <BackButton fallback="/" />
      </div>
      {products.length ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {products.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      ) : (
        <div className="text-muted-foreground">Chưa có sản phẩm nào.</div>
      )}
    </div>
  );
}
