# Product API

API đơn giản để quản lý sản phẩm sử dụng Express.js và MongoDB.

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Đảm bảo MongoDB đang chạy trên localhost:27017 với database tên "test"

3. Chạy API:
```bash
npm run dev
```

API sẽ chạy trên http://localhost:4000

## API Endpoints

### Products

- `GET /api/products` - Lấy tất cả sản phẩm
- `GET /api/products/bestsellers` - Lấy sản phẩm bán chạy
- `GET /api/products/category/:category` - Lấy sản phẩm theo danh mục
- `GET /api/products/:id` - Lấy sản phẩm theo ID (tự động tăng views)
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

### Search (Fuzzy Search & Advanced Filtering)

- `GET /api/search` - Tìm kiếm sản phẩm với fuzzy search và nhiều bộ lọc
- `GET /api/search/suggestions` - Lấy gợi ý tìm kiếm (autocomplete)
- `GET /api/search/popular` - Lấy từ khóa tìm kiếm phổ biến
- `GET /api/search/filters` - Lấy các tùy chọn bộ lọc có sẵn

### Health Check

- `GET /health` - Kiểm tra trạng thái API

## Product Schema

```typescript
{
  id: string (unique)
  name: string (required)
  description?: string
  category: string (required)
  brand?: string
  price: number (required)
  discount?: number (default: 0)
  images: string[] (default: [])
  stock: number (required)
  sold: number (default: 0)
  rating: number (default: 0)
  ratingCount: number (default: 0)
  isBestSeller?: boolean (default: false)
  isNew: boolean (default: true)
  tags?: string[] (default: [])
  views: number (default: 0)
  searchKeywords: string[] (auto-generated)
  createdAt: Date
  updatedAt: Date
}
```

## Search API Parameters

### Main Search Endpoint: `GET /api/search`

**Query Parameters:**
- `query` - Từ khóa tìm kiếm (fuzzy search)
- `category` - Lọc theo danh mục (có thể là array)
- `brand` - Lọc theo thương hiệu (có thể là array)
- `minPrice` - Giá tối thiểu
- `maxPrice` - Giá tối đa
- `minDiscount` - Giảm giá tối thiểu (%)
- `maxDiscount` - Giảm giá tối đa (%)
- `minRating` - Đánh giá tối thiểu
- `minViews` - Lượt xem tối thiểu
- `minSold` - Số lượng bán tối thiểu
- `isBestSeller` - Sản phẩm bán chạy (true/false)
- `isNew` - Sản phẩm mới (true/false)
- `tags` - Lọc theo tags (có thể là array)
- `sortBy` - Sắp xếp theo: 'price', 'rating', 'views', 'sold', 'discount', 'createdAt', 'relevance'
- `sortOrder` - Thứ tự: 'asc' hoặc 'desc'
- `page` - Trang (default: 1)
- `limit` - Số lượng mỗi trang (default: 20)

### Search Suggestions: `GET /api/search/suggestions`
- `query` - Từ khóa để lấy gợi ý (tối thiểu 2 ký tự)
- `limit` - Số lượng gợi ý (default: 10)

### Popular Searches: `GET /api/search/popular`
- `limit` - Số lượng từ khóa phổ biến (default: 10)

### Filter Options: `GET /api/search/filters`
- Trả về danh sách categories, brands, và khoảng giá có sẵn

## Ví dụ sử dụng

### Tạo sản phẩm mới:
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15",
    "description": "Latest iPhone model",
    "category": "Electronics",
    "brand": "Apple",
    "price": 999,
    "stock": 50,
    "isNew": true,
    "tags": ["smartphone", "apple", "premium"]
  }'
```

### Tìm kiếm sản phẩm với fuzzy search:
```bash
curl "http://localhost:5000/api/search?query=iphone&category=Electronics&minPrice=500&maxPrice=1500&sortBy=price&sortOrder=asc"
```

### Tìm kiếm với nhiều bộ lọc:
```bash
curl "http://localhost:5000/api/search?query=phone&brand=Apple,Samsung&minRating=4&isBestSeller=true&sortBy=rating&sortOrder=desc&page=1&limit=10"
```

### Lấy gợi ý tìm kiếm:
```bash
curl "http://localhost:5000/api/search/suggestions?query=iph&limit=5"
```

### Lấy tùy chọn bộ lọc:
```bash
curl "http://localhost:5000/api/search/filters"
```

### Lấy sản phẩm bán chạy:
```bash
curl "http://localhost:5000/api/products/bestsellers"
```
