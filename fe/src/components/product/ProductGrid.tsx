import { useState, useEffect, useCallback, useRef } from "react";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Product {
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
}

const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // --- ACTIVE (đang áp dụng để fetch) ---
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minDiscount, setMinDiscount] = useState<string>("");
  const [sort, setSort] = useState<"popular" | "price_asc" | "price_desc" | "newest">("popular");

  // --- DRAFT (người dùng đang nhập/chọn) ---
  const [qDraft, setQDraft] = useState("");
  const [categoryDraft, setCategoryDraft] = useState<string>("");
  const [minPriceDraft, setMinPriceDraft] = useState<string>("");
  const [maxPriceDraft, setMaxPriceDraft] = useState<string>("");
  const [minDiscountDraft, setMinDiscountDraft] = useState<string>("");
  const [sortDraft, setSortDraft] = useState<"popular" | "price_asc" | "price_desc" | "newest">("popular");

  const abortRef = useRef<AbortController | null>(null);

  const buildUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set("page", String(pageNum));
    params.set("limit", "12");
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minDiscount) params.set("minDiscount", minDiscount);
    if (sort) {
      params.set("sort", sort);
      console.log("FE check: ", sort)
    }
    return `http://localhost:4000/api/products/search?${params.toString()}`;
  };

  const loadProducts = useCallback(
    async (pageNum: number, reset = false) => {
      try {
        setLoading(true);

        // hủy request cũ nếu còn
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch(buildUrl(pageNum), { signal: controller.signal });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status} - ${text}`);
        }
        const data = await res.json();
        console.log("📦 data.products", data.products.map((p)=>p.price));
        if (reset || pageNum === 1) {
          setProducts(data.products || []);
        } else {
          setProducts((prev) => [...prev, ...(data.products || [])]);
        }

        setHasMore(Boolean(data.hasMore));
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name === "AbortError") return;
          console.error("❌ Lỗi khi load sản phẩm:", err.message);
        } else {
          console.error("❌ Lỗi khi load sản phẩm:", err);
        }
      } finally {
        setLoading(false);
      }
    },
    [q, category, minPrice, maxPrice, minDiscount, sort] // chỉ active params mới kích hoạt lại
  );

  // Lần đầu + khi ACTIVE filter đổi → load trang 1
  useEffect(() => {
    loadProducts(1, true);
    setPage(1);
  }, [loadProducts]);

  // Nút ÁP DỤNG: copy draft -> active rồi fetch
  const applyFilters = () => {
    setQ(qDraft.trim());
    setCategory(categoryDraft);
    setMinPrice(minPriceDraft);
    setMaxPrice(maxPriceDraft);
    setMinDiscount(minDiscountDraft);
    setSort(sortDraft);
    // loadProducts(1, true) sẽ tự chạy do useEffect phụ thuộc vào active

    loadProducts(1, true);
  setPage(1);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter bar (DRAFT) */}
      <div className="flex flex-wrap gap-2 items-end border p-3 rounded-md">
        <div className="flex-1 min-w-[200px]">
          <input
            className="w-full border px-2 py-1 rounded text-gray-400"
            placeholder="Tìm kiếm..."
            value={qDraft}
            onChange={(e) => setQDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
        </div>

        <select
          title="category"
          className="border px-2 py-1 rounded text-gray-400"
          value={categoryDraft}
          onChange={(e) => setCategoryDraft(e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          <option value="electronics">Điện tử</option>
          <option value="fashion">Thời trang</option>
          <option value="home">Nhà cửa</option>
        </select>

        <input
          className="w-28 border px-2 py-1 rounded text-gray-400"
          placeholder="Giá từ"
          value={minPriceDraft}
          onChange={(e) => setMinPriceDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
        />
        <input
          className="w-28 border px-2 py-1 rounded text-gray-400"
          placeholder="Giá đến"
          value={maxPriceDraft}
          onChange={(e) => setMaxPriceDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
        />
        <input
          className="w-28 border px-2 py-1 rounded text-gray-400"
          placeholder="KM ≥ %"
          value={minDiscountDraft}
          onChange={(e) => setMinDiscountDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
        />

        <select
          title="price"
          className="border px-2 py-1 rounded text-gray-400"
          value={sortDraft}
          onChange={(e) =>
            setSortDraft(e.target.value as "popular" | "price_asc" | "price_desc" | "newest")
          }
        >
          <option value="popular">Phổ biến</option>
          <option value="price_asc">Giá thấp → cao</option>
          <option value="price_desc">Giá cao → thấp</option>
          <option value="newest">Mới nhất</option>
        </select>

        <Button onClick={applyFilters}>Áp dụng</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl-grid-cols-5 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!loading && hasMore && (
        <div className="flex justify-center py-8">
          <Button
            onClick={loadMore}
            variant="outline"
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            Xem thêm sản phẩm
          </Button>
        </div>
      )}

      {!hasMore && (
        <div className="text-center py-8 text-muted-foreground">Đã hiển thị tất cả sản phẩm</div>
      )}
    </div>
  );
};

export default ProductGrid;
