# Trang Home - ShopHub

## Tính năng đã implement

### 🏠 Trang Home hiện đại
- Giao diện responsive với Tailwind CSS
- Header với logo và thanh tìm kiếm
- Layout grid/list linh hoạt
- Loading states với skeleton
- Error handling

### 🔍 Chức năng tìm kiếm
- Tìm kiếm theo tên sản phẩm
- Lọc theo danh mục
- Sắp xếp theo: liên quan, giá, đánh giá, bán chạy, mới nhất
- Pagination
- Real-time search suggestions

### 📦 Hiển thị sản phẩm
- Card view và List view
- Hiển thị hình ảnh, tên, giá, đánh giá
- Badge cho sản phẩm mới, bán chạy, giảm giá
- Format giá tiền VND
- Thông tin số lượng đã bán và còn lại

### 🎯 Sản phẩm nổi bật
- Section riêng cho sản phẩm bán chạy
- Hiển thị khi không có tìm kiếm

## Cấu hình

### Environment Variables
Tạo file `.env.local` trong thư mục `client`:
```
VITE_API_BASE=http://localhost:3001
```

### API Endpoints sử dụng
- `GET /api/products` - Lấy tất cả sản phẩm
- `GET /api/products/bestsellers` - Lấy sản phẩm bán chạy
- `GET /api/search` - Tìm kiếm sản phẩm với filters
- `GET /api/search/filters` - Lấy options cho filter

## Cách chạy

1. Khởi động API server:
```bash
cd api
npm install
npm run dev
```

2. Khởi động client:
```bash
cd client
npm install
npm run dev
```

3. Truy cập: http://localhost:5173

## Các component đã xóa
- Tất cả auth components (AuthLayout, LoginForm, SignUpForm, etc.)
- Trang Index cũ
- Email template

## Dependencies chính
- React Query cho data fetching
- Shadcn/ui components
- Lucide React icons
- Tailwind CSS cho styling
