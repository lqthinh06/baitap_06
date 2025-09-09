import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3001",
});

export const getErrMsg = (e: any) =>
  e?.response?.data?.message || e?.message || "Có lỗi xảy ra, vui lòng thử lại.";

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Product API types
export interface Product {
  _id: string;
  id: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  price: number;
  discount?: number;
  images: string[];
  stock: number;
  sold: number;
  rating: number;
  ratingCount: number;
  isBestSeller?: boolean;
  isNew: boolean;
  tags?: string[];
  views: number;
  searchKeywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  query?: string;
  category?: string | string[];
  brand?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  maxDiscount?: number;
  minRating?: number;
  minViews?: number;
  minSold?: number;
  isBestSeller?: boolean;
  isNew?: boolean;
  tags?: string | string[];
  sortBy?: 'price' | 'rating' | 'views' | 'sold' | 'discount' | 'createdAt' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  success: boolean;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
  filters: any;
  sort: {
    by: string;
    order: string;
  };
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  count: number;
}

// Product API functions
export const productApi = {
  // Get all products
  getAllProducts: async (): Promise<ProductsResponse> => {
    const response = await api.get('/api/products');
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: string): Promise<{ success: boolean; data: Product }> => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  // Get best sellers
  getBestSellers: async (): Promise<ProductsResponse> => {
    const response = await api.get('/api/products/bestsellers');
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<ProductsResponse> => {
    const response = await api.get(`/api/products/category/${category}`);
    return response.data;
  },
};

// Search API functions
export const searchApi = {
  // Search products with filters
  searchProducts: async (filters: SearchFilters): Promise<SearchResponse> => {
    const response = await api.get('/api/search', { params: filters });
    return response.data;
  },

  // Get search suggestions
  getSearchSuggestions: async (query: string, limit = 10): Promise<{ success: boolean; data: Array<{ type: string; value: string }> }> => {
    const response = await api.get('/api/search/suggestions', { 
      params: { query, limit } 
    });
    return response.data;
  },

  // Get popular searches
  getPopularSearches: async (limit = 10): Promise<{ success: boolean; data: { popularCategories: any[]; popularBrands: any[] } }> => {
    const response = await api.get('/api/search/popular', { 
      params: { limit } 
    });
    return response.data;
  },

  // Get filter options
  getFilterOptions: async (): Promise<{ success: boolean; data: { categories: string[]; brands: string[]; priceRange: { min: number; max: number }; discountRange: { min: number; max: number } } }> => {
    const response = await api.get('/api/search/filters');
    return response.data;
  },
};