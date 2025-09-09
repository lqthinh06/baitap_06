import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, ShoppingCart, Heart, Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { productApi, searchApi, Product, SearchFilters } from "@/lib/api";
import { getErrMsg } from "@/lib/api";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch filter options
  const { data: filterOptions } = useQuery({
    queryKey: ["filterOptions"],
    queryFn: searchApi.getFilterOptions,
  });

  // Fetch products based on search or default
  const { data: searchResults, isLoading: isSearchLoading, error: searchError } = useQuery({
    queryKey: ["search", searchQuery, selectedCategory, sortBy, currentPage],
    queryFn: async () => {
      if (searchQuery.trim() || selectedCategory !== "all") {
        const filters: SearchFilters = {
          query: searchQuery.trim() || undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          sortBy: sortBy as SearchFilters['sortBy'],
          sortOrder: "desc",
          page: currentPage,
          limit: 12,
        };
        return await searchApi.searchProducts(filters);
      } else {
        return await productApi.getAllProducts();
      }
    },
    enabled: true,
  });

  // Fetch best sellers for featured section
  const { data: bestSellers } = useQuery({
    queryKey: ["bestSellers"],
    queryFn: productApi.getBestSellers,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setCurrentPage(1);
    // The query will automatically refetch due to queryKey changes
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateDiscountPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price * (1 - discount / 100);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const renderProductCard = (product: Product) => (
    <Card key={product._id} className="group hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:-translate-y-2">
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden rounded-t-2xl">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                ✨ Mới
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
                🔥 Bán chạy
              </Badge>
            )}
            {product.discount && product.discount > 0 && (
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
                -{product.discount}%
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full w-10 h-10 p-0 shadow-lg"
          >
            <Heart className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          <h3 className="font-bold text-base line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-sm text-gray-500 font-medium">{product.brand}</p>
          )}
          <div className="flex items-center gap-1">
            {renderStars(product.rating)}
            <span className="text-sm text-gray-500 ml-2 font-medium">
              ({product.ratingCount})
            </span>
          </div>
          <div className="flex items-center gap-3">
            {product.discount && product.discount > 0 ? (
              <>
                <span className="font-bold text-xl text-red-600">
                  {formatPrice(calculateDiscountPrice(product.price, product.discount))}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="font-bold text-xl text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              Đã bán: {product.sold}
            </span>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              Còn: {product.stock}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Thêm vào giỏ
        </Button>
      </CardFooter>
    </Card>
  );

  const renderProductList = (product: Product) => (
    <Card key={product._id} className="group hover:shadow-lg transition-all duration-300">
      <div className="flex">
        <div className="w-32 h-32 relative overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
          <div className="absolute top-1 left-1 flex flex-col gap-1">
            {product.isNew && (
              <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                Mới
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge variant="secondary" className="bg-orange-500 text-white text-xs">
                Bán chạy
              </Badge>
            )}
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              {product.brand && (
                <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
              )}
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {product.description}
              </p>
              <div className="flex items-center gap-1 mb-2">
                {renderStars(product.rating)}
                <span className="text-sm text-gray-500 ml-1">
                  ({product.ratingCount})
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                {product.discount && product.discount > 0 ? (
                  <>
                    <span className="font-bold text-red-600 text-lg">
                      {formatPrice(calculateDiscountPrice(product.price, product.discount))}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-gray-900 text-lg">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Đã bán: {product.sold}</span>
                <span>Còn: {product.stock}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <Button size="sm">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Thêm vào giỏ
              </Button>
              <Button size="sm" variant="outline">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ShopHub
                </h1>
              </div>
            </div>
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm yêu thích..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                />
              </form>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="lg"
                className="rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Giỏ hàng
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            Khám phá sản phẩm tuyệt vời
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tìm kiếm và mua sắm những sản phẩm chất lượng cao với giá cả hợp lý
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 mb-12">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-wrap gap-4 flex-1">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-56 h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-white/80">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {filterOptions?.data?.categories?.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-56 h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-white/80">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="relevance">Liên quan</SelectItem>
                  <SelectItem value="price">Giá</SelectItem>
                  <SelectItem value="rating">Đánh giá</SelectItem>
                  <SelectItem value="sold">Bán chạy</SelectItem>
                  <SelectItem value="createdAt">Mới nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/80 rounded-xl p-1 border border-gray-200">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg transition-all duration-300 ${
                    viewMode === "grid" 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                      : "hover:bg-gray-100"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg transition-all duration-300 ${
                    viewMode === "list" 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                      : "hover:bg-gray-100"
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Products */}
        {!searchQuery && selectedCategory === "all" && bestSellers?.data && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
                🔥 Sản phẩm bán chạy
              </h2>
              <p className="text-gray-600">Những sản phẩm được yêu thích nhất</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
              {bestSellers.data.slice(0, 6).map(renderProductCard)}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                {searchQuery || selectedCategory !== "all" ? "🔍 Kết quả tìm kiếm" : "🛍️ Tất cả sản phẩm"}
              </h2>
              {'pagination' in (searchResults || {}) && (
                <p className="text-gray-600 mt-2 text-lg">
                  Tìm thấy {(searchResults as any).pagination.totalCount} sản phẩm
                </p>
              )}
            </div>
          </div>

          {isSearchLoading ? (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              : "space-y-6"
            }>
              {Array.from({ length: 8 }).map((_, i) => (
                viewMode === "grid" ? (
                  <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="p-0">
                      <Skeleton className="aspect-square w-full rounded-t-2xl" />
                    </CardHeader>
                    <CardContent className="p-6">
                      <Skeleton className="h-5 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-1/2 mb-3" />
                      <Skeleton className="h-6 w-1/3" />
                    </CardContent>
                  </Card>
                ) : (
                  <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                    <div className="flex">
                      <Skeleton className="w-32 h-32 rounded-l-2xl" />
                      <div className="flex-1 p-6">
                        <Skeleton className="h-6 w-3/4 mb-3" />
                        <Skeleton className="h-4 w-1/2 mb-3" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </Card>
                )
              ))}
            </div>
          ) : searchError ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Có lỗi xảy ra: {getErrMsg(searchError)}</p>
              <Button onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            </div>
          ) : searchResults?.data && searchResults.data.length > 0 ? (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              : "space-y-6"
            }>
              {searchResults.data.map(viewMode === "grid" ? renderProductCard : renderProductList)}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <span className="text-6xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm nào</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Hãy thử tìm kiếm với từ khóa khác hoặc xem tất cả sản phẩm có sẵn
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setCurrentPage(1);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Xem tất cả sản phẩm
              </Button>
            </div>
          )}

          {/* Pagination */}
          {'pagination' in (searchResults || {}) && (searchResults as any).pagination.totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!(searchResults as any).pagination.hasPrevPage}
                    className="rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 disabled:opacity-50"
                  >
                    ← Trước
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="px-6 py-3 text-lg font-semibold text-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                      Trang {(searchResults as any).pagination.currentPage} / {(searchResults as any).pagination.totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!(searchResults as any).pagination.hasNextPage}
                    className="rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 disabled:opacity-50"
                  >
                    Sau →
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
