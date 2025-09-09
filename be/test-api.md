# API Test Commands for Postman

## 1. Health Check
```bash
GET http://localhost:5000/health
```

## 2. Product CRUD Operations

### Get All Products
```bash
GET http://localhost:5000/api/products
```

### Create New Product
```bash
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with advanced camera system",
  "category": "Electronics",
  "brand": "Apple",
  "price": 1199,
  "discount": 10,
  "stock": 25,
  "rating": 4.8,
  "ratingCount": 150,
  "isBestSeller": true,
  "isNew": true,
  "tags": ["smartphone", "apple", "premium", "camera"],
  "images": ["https://example.com/iphone15pro1.jpg", "https://example.com/iphone15pro2.jpg"]
}
```

### Create Another Product
```bash
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "name": "Samsung Galaxy S24",
  "description": "Samsung's flagship smartphone with AI features",
  "category": "Electronics",
  "brand": "Samsung",
  "price": 999,
  "discount": 15,
  "stock": 30,
  "rating": 4.6,
  "ratingCount": 120,
  "isBestSeller": false,
  "isNew": true,
  "tags": ["smartphone", "samsung", "android", "ai"],
  "images": ["https://example.com/galaxy-s24-1.jpg"]
}
```

### Create More Products for Testing
```bash
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "name": "MacBook Pro M3",
  "description": "Professional laptop with M3 chip",
  "category": "Computers",
  "brand": "Apple",
  "price": 1999,
  "discount": 5,
  "stock": 15,
  "rating": 4.9,
  "ratingCount": 80,
  "isBestSeller": true,
  "isNew": false,
  "tags": ["laptop", "apple", "macbook", "professional"],
  "images": ["https://example.com/macbook-pro.jpg"]
}
```

### Get Product by ID
```bash
GET http://localhost:5000/api/products/PROD-0001
```

### Update Product
```bash
PUT http://localhost:5000/api/products/PROD-0001
Content-Type: application/json

{
  "price": 1099,
  "discount": 15,
  "isBestSeller": true
}
```

### Get Best Sellers
```bash
GET http://localhost:5000/api/products/bestsellers
```

### Get Products by Category
```bash
GET http://localhost:5000/api/products/category/Electronics
```

## 3. Search API Tests

### Basic Search
```bash
GET http://localhost:5000/api/search?query=iphone
```

### Search with Category Filter
```bash
GET http://localhost:5000/api/search?query=phone&category=Electronics
```

### Search with Price Range
```bash
GET http://localhost:5000/api/search?query=apple&minPrice=500&maxPrice=1500
```

### Search with Multiple Filters
```bash
GET http://localhost:5000/api/search?query=phone&brand=Apple,Samsung&minRating=4&isBestSeller=true&sortBy=rating&sortOrder=desc
```

### Search with Pagination
```bash
GET http://localhost:5000/api/search?query=phone&page=1&limit=5
```

### Search by Brand Only
```bash
GET http://localhost:5000/api/search?brand=Apple&sortBy=price&sortOrder=asc
```

### Search by Category and Price
```bash
GET http://localhost:5000/api/search?category=Electronics&minPrice=800&maxPrice=1200&sortBy=discount&sortOrder=desc
```

### Search with Tags
```bash
GET http://localhost:5000/api/search?tags=smartphone,premium&sortBy=rating&sortOrder=desc
```

### Search with Views Filter
```bash
GET http://localhost:5000/api/search?minViews=10&sortBy=views&sortOrder=desc
```

## 4. Search Suggestions

### Get Search Suggestions
```bash
GET http://localhost:5000/api/search/suggestions?query=iph&limit=5
```

### Get More Suggestions
```bash
GET http://localhost:5000/api/search/suggestions?query=sam&limit=10
```

## 5. Popular Searches
```bash
GET http://localhost:5000/api/search/popular?limit=10
```

## 6. Filter Options
```bash
GET http://localhost:5000/api/search/filters
```

## 7. Advanced Search Combinations

### Search for Premium Electronics
```bash
GET http://localhost:5000/api/search?query=premium&category=Electronics&minPrice=1000&sortBy=price&sortOrder=desc
```

### Search for New Products with High Rating
```bash
GET http://localhost:5000/api/search?isNew=true&minRating=4.5&sortBy=rating&sortOrder=desc
```

### Search for Best Sellers with Discount
```bash
GET http://localhost:5000/api/search?isBestSeller=true&minDiscount=10&sortBy=discount&sortOrder=desc
```

### Search with Multiple Categories
```bash
GET http://localhost:5000/api/search?category=Electronics,Computers&minPrice=500&sortBy=createdAt&sortOrder=desc
```

## 8. Error Testing

### Invalid Product ID
```bash
GET http://localhost:5000/api/products/INVALID-ID
```

### Search with Invalid Parameters
```bash
GET http://localhost:5000/api/search?minPrice=abc&maxPrice=xyz
```

### Suggestions with Short Query
```bash
GET http://localhost:5000/api/search/suggestions?query=a
```

## Notes for Postman:
1. Make sure your API is running on `http://localhost:5000`
2. For POST/PUT requests, set Content-Type to `application/json`
3. Copy the JSON body exactly as shown
4. Test the search endpoints after creating some products first
5. The search suggestions work best after you have products in the database
