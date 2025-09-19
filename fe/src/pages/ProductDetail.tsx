// fe/src/pages/ProductDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api1";
import { addToLocalRecentlyViewed } from "../features/recentlyViewed/recentlyViewed";
import ProductCard from "../components/product/ProductCard";
import { useWishlist } from "@/features/wishlist/useWishlist";
import {
  Heart,
  ShoppingCart,
  BadgePercent,
  Star,
  StarHalf,
  StarOff,
  ChevronRight,
  Share2,
  Truck,
  ShieldCheck,
  Eye,
} from "lucide-react";
import Header from "@/components/layout/Header";

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  sold: number;
  discount?: number;
  category?: string;
  views?: number;
};

type Stats = { buyers: number; comments: number };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const to = (p: Product) => `/product/${p.id}/${slugify(p.name)}`;

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlistedLocal, setWishlistedLocal] = useState(false); // trạng thái tim của sản phẩm hiện tại
  const [error, setError] = useState<string | null>(null);

  // Wishlist store
  const { ids, loaded, init, check, toggle } = useWishlist();

  // Bảo đảm store đã load danh sách wishlist (phòng khi bạn chưa init ở App)
  useEffect(() => {
    if (!loaded) init().catch(() => {});
  }, [loaded, init]);

  // Đồng bộ state tim theo store khi product/id thay đổi
  useEffect(() => {
    if (!id) return;
    // nếu store đã có, lấy nhanh từ ids; sau đó confirm với /wishlist/check/:id
    setWishlistedLocal(ids.has(id));
    check(id).then(setWishlistedLocal).catch(() => {});
  }, [id, ids, check]);

  // Utils
  const formatCurrency = (v?: number) =>
    typeof v === "number" ? v.toLocaleString("vi-VN") + "₫" : "";

  const discountBadge = useMemo(() => {
    const d = product?.discount ?? 0;
    if (!d || d <= 0) return null;
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 text-xs font-medium">
        <BadgePercent className="size-3" /> -{d}%
      </span>
    );
  }, [product]);

  // Rating sao hiển thị đẹp
  const RatingStars = ({ value }: { value: number }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (value >= i)
        stars.push(<Star key={i} className="size-4 fill-amber-400 text-amber-400" />);
      else if (value > i - 1 && value < i)
        stars.push(<StarHalf key={i} className="size-4 fill-amber-400 text-amber-400" />);
      else stars.push(<StarOff key={i} className="size-4 text-slate-300" />);
    }
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await apiFetch(`/products/${id}`);
        if (!p) {
          setError("Không tìm thấy sản phẩm.");
          setProduct(null);
          setSimilar([]);
          setStats(null);
          return;
        }
        if (ignore) return;
        setProduct(p);

        // Track view (fallback lưu local nếu API lỗi)
        try {
          await apiFetch(`/products/${p.id}/view`, { method: "POST" });
        } catch {
          addToLocalRecentlyViewed(p);
        }

        const sim = await apiFetch(`/products/${p.id}/similar`);
        if (!ignore) setSimilar(sim?.products || []);

        const st = await apiFetch(`/products/${p.id}/stats`);
        if (!ignore) setStats(st);
      } catch (e: any) {
        console.error(e);
        if (!ignore) setError("Có lỗi khi tải dữ liệu. Vui lòng thử lại.");
      } finally {
        if (!ignore) setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    })();

    return () => {
      ignore = true;
    };
  }, [id]);

  // Toggle tim cho sản phẩm hiện tại (optimistic)
  const onToggleWishlist = async () => {
    if (!product) return;
    const optimistic = !wishlistedLocal;
    setWishlistedLocal(optimistic);
    try {
      const liked = await toggle(product.id);
      setWishlistedLocal(liked); // confirm theo kết quả server
    } catch {
      setWishlistedLocal(!optimistic); // rollback nếu lỗi
    }
  };

  if (loading) return <DetailSkeleton />;

  if (error || !product)
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error ?? "Không tìm thấy sản phẩm."}
        </div>
      </div>
    );

  // Chuẩn bị dữ liệu ảnh (tương lai nếu có product.images)
  const images: string[] = [product.image];

  return (
    
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      <Header />
      {/* Breadcrumbs */}
      <nav className="text-sm text-slate-500 flex items-center gap-1">
        <button onClick={() => navigate("/")} className="hover:text-slate-700">
          Trang chủ
        </button>
        <ChevronRight className="size-4" />
        <button
          onClick={() =>
            navigate(`/c/${encodeURIComponent(product.category || "other")}`)
          }
          className="hover:text-slate-700"
        >
          {product.category || "Khác"}
        </button>
        <ChevronRight className="size-4" />
        <span className="text-slate-700 line-clamp-1">{product.name}</span>
      </nav>

      {/* Hero: Gallery + Info */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl border bg-white">
            <img
              src={images[0]}
              alt={product.name}
              className="w-full h-auto object-contain aspect-square"
              loading="eager"
            />
            {product.discount && product.discount > 0 && (
              <div className="absolute left-3 top-3">{discountBadge}</div>
            )}

            {/* Nút tim nổi ngay trên ảnh (cho sản phẩm đang xem) */}
            <button
              aria-label={wishlistedLocal ? "Bỏ yêu thích" : "Thêm yêu thích"}
              title="Thêm vào yêu thích"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWishlist();
              }}
              className={`absolute right-3 top-3 inline-flex items-center justify-center size-10 rounded-full border bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition ${
                wishlistedLocal ? "text-rose-600" : "text-slate-700"
              }`}
            >
              <Heart className={`size-5 ${wishlistedLocal ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Thumbnails (để sẵn cho nhiều ảnh) */}
          <div className="grid grid-cols-5 gap-2">
            {images.map((src, idx) => (
              <button
                key={idx}
                className={`border rounded-xl overflow-hidden ${idx === 0 ? "ring-2 ring-slate-900/10" : ""}`}
                onClick={() => {}}
                aria-label={`Ảnh ${idx + 1}`}
              >
                <img src={src} alt={`thumb-${idx}`} className="aspect-square object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info + CTA */}
        <div className="space-y-5">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{product.name}</h1>

          <div className="flex items-center gap-3 text-sm">
            <RatingStars value={Number(product.rating) || 0} />
            <span className="text-slate-500">• Đã bán {product.sold}</span>
            <span className="text-slate-500 flex items-center gap-1">
              <Eye className="size-4" /> {product.views || 0} lượt xem
            </span>
          </div>

          {/* Giá */}
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold text-rose-600">
              {formatCurrency(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-slate-400 line-through">
                {formatCurrency(product.originalPrice)}
              </div>
            )}
            {discountBadge}
          </div>

          {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border p-3 bg-white/70">
              <div className="font-medium">Vận chuyển</div>
              <div className="mt-1 flex items-center gap-2 text-slate-600">
                <Truck className="size-4" /> Giao nhanh 2–5 ngày (tiêu chuẩn)
              </div>
            </div>
            <div className="rounded-xl border p-3 bg-white/70">
              <div className="font-medium">Bảo hành</div>
              <div className="mt-1 flex items-center gap-2 text-slate-600">
                <ShieldCheck className="size-4" /> Đổi trả trong 7 ngày nếu lỗi
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-3 hover:bg-slate-800 transition active:scale-[.98]"
              onClick={() => {
                /* addToCart(product) */
              }}
            >
              <ShoppingCart className="size-5" />
              Thêm vào giỏ
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-slate-50 transition active:scale-[.98]"
              onClick={() => {
                /* buyNow(product) */
              }}
            >
              Mua ngay
            </button>

            {/* Nút tim thứ hai ở khu CTA (tuỳ bạn giữ hoặc bỏ; cùng state) */}
            <button
              aria-label={wishlistedLocal ? "Bỏ yêu thích" : "Thêm yêu thích"}
              title="Thêm vào yêu thích"
              onClick={(e) => {
                e.preventDefault();
                onToggleWishlist();
              }}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 transition active:scale-[.98] ${
                wishlistedLocal ? "bg-rose-50 border-rose-200 text-rose-600" : "hover:bg-slate-50"
              }`}
            >
              <Heart className={`size-5 ${wishlistedLocal ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>

            <button
              aria-label="Chia sẻ"
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 hover:bg-slate-50 transition active:scale-[.98]"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: product.name,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Đã sao chép liên kết!");
                }
              }}
              title="Chia sẻ"
            >
              <Share2 className="size-5" />
            </button>
          </div>

          {/* Thông tin mở rộng */}
          <div className="rounded-2xl border p-4 bg-white/70">
            <div className="text-sm text-slate-600">
              <span className="font-medium">Danh mục:</span> {product.category || "Khác"}
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="text-sm text-slate-500">
              <b>{stats.buyers}</b> khách đã mua • <b>{stats.comments}</b> bình luận
            </div>
          )}
        </div>
      </section>

      {/* Sản phẩm tương tự */}
      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-semibold">Sản phẩm tương tự</h2>
        {similar.length === 0 ? (
          <div className="text-slate-500 text-sm">Chưa có gợi ý phù hợp.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {similar.map((p) => (
              <button key={p.id} onClick={() => navigate(to(p))} className="text-left">
                <ProductCard {...p} />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/** Skeleton khi đang tải */
function DetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 animate-pulse space-y-8">
      <div className="h-4 w-40 bg-slate-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="aspect-square rounded-2xl bg-slate-200" />
        <div className="space-y-4">
          <div className="h-6 w-3/4 bg-slate-200 rounded" />
          <div className="h-8 w-40 bg-slate-200 rounded" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-slate-200 rounded-xl" />
            <div className="h-20 bg-slate-200 rounded-xl" />
          </div>
          <div className="h-12 bg-slate-200 rounded-xl" />
          <div className="h-20 bg-slate-200 rounded-2xl" />
          <div className="h-4 w-48 bg-slate-200 rounded" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-5 w-56 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
