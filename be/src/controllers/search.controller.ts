import { Request, Response } from "express";
import Product, { IProduct } from "../models/Product";

// Interface for search filters
interface SearchFilters {
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

// Advanced search with fuzzy search and multiple filters
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const {
      query,
      category,
      brand,
      minPrice,
      maxPrice,
      minDiscount,
      maxDiscount,
      minRating,
      minViews,
      minSold,
      isBestSeller,
      isNew,
      tags,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    }: SearchFilters = req.query;

    // Build the base filter object
    const filter: any = {};

    // Text search (fuzzy search)
    if (query && query.trim()) {
      filter.$text = { $search: query.trim() };
    }

    // Category filter
    if (category) {
      if (Array.isArray(category)) {
        filter.category = { $in: category };
      } else {
        filter.category = category;
      }
    }

    // Brand filter
    if (brand) {
      if (Array.isArray(brand)) {
        filter.brand = { $in: brand };
      } else {
        filter.brand = brand;
      }
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Discount range filter
    if (minDiscount !== undefined || maxDiscount !== undefined) {
      filter.discount = {};
      if (minDiscount !== undefined) filter.discount.$gte = Number(minDiscount);
      if (maxDiscount !== undefined) filter.discount.$lte = Number(maxDiscount);
    }

    // Rating filter
    if (minRating !== undefined) {
      filter.rating = { $gte: Number(minRating) };
    }

    // Views filter
    if (minViews !== undefined) {
      filter.views = { $gte: Number(minViews) };
    }

    // Sold filter
    if (minSold !== undefined) {
      filter.sold = { $gte: Number(minSold) };
    }

    // Boolean filters
    if (isBestSeller !== undefined) {
      filter.isBestSeller = isBestSeller === 'true';
    }

    if (isNew !== undefined) {
      filter.isNew = isNew === 'true';
    }

    // Tags filter
    if (tags) {
      if (Array.isArray(tags)) {
        filter.tags = { $in: tags };
      } else {
        filter.tags = { $in: [tags] };
      }
    }

    // Build sort object
    let sort: any = {};
    
    if (sortBy === 'relevance' && query) {
      // Use text score for relevance when searching
      sort = { score: { $meta: 'textScore' } };
    } else {
      const sortField = sortBy === 'createdAt' ? 'createdAt' : sortBy;
      sort[sortField] = sortOrder === 'asc' ? 1 : -1;
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const limitNum = Number(limit);

    // Execute search with aggregation pipeline for better performance
    const pipeline: any[] = [
      { $match: filter }
    ];

    // Add text score if searching
    if (query && query.trim()) {
      pipeline.push({ $addFields: { score: { $meta: 'textScore' } } });
    }

    // Add sorting
    pipeline.push({ $sort: sort });

    // Add pagination
    pipeline.push(
      { $skip: skip },
      { $limit: limitNum }
    );

    // Execute aggregation
    const products = await Product.aggregate(pipeline);

    // Get total count for pagination
    const totalCount = await Product.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = Number(page) < totalPages;
    const hasPrevPage = Number(page) > 1;

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      },
      filters: {
        query,
        category,
        brand,
        priceRange: { min: minPrice, max: maxPrice },
        discountRange: { min: minDiscount, max: maxDiscount },
        minRating,
        minViews,
        minSold,
        isBestSeller,
        isNew,
        tags
      },
      sort: {
        by: sortBy,
        order: sortOrder
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching products",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get search suggestions/autocomplete
export const getSearchSuggestions = async (req: Request, res: Response) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query || query.toString().trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Query must be at least 2 characters long"
      });
    }

    const searchQuery = query.toString().trim();

    // Get suggestions from product names, brands, and categories
    const suggestions = await Product.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { brand: { $regex: searchQuery, $options: 'i' } },
            { category: { $regex: searchQuery, $options: 'i' } },
            { tags: { $in: [new RegExp(searchQuery, 'i')] } }
          ]
        }
      },
      {
        $project: {
          name: 1,
          brand: 1,
          category: 1,
          tags: 1,
          _id: 0
        }
      },
      { $limit: Number(limit) }
    ]);

    // Extract unique suggestions
    const uniqueSuggestions = new Set();
    const result: any[] = [];

    suggestions.forEach(product => {
      if (product.name && !uniqueSuggestions.has(product.name)) {
        uniqueSuggestions.add(product.name);
        result.push({ type: 'product', value: product.name });
      }
      if (product.brand && !uniqueSuggestions.has(product.brand)) {
        uniqueSuggestions.add(product.brand);
        result.push({ type: 'brand', value: product.brand });
      }
      if (product.category && !uniqueSuggestions.has(product.category)) {
        uniqueSuggestions.add(product.category);
        result.push({ type: 'category', value: product.category });
      }
      if (product.tags) {
        product.tags.forEach((tag: string) => {
          if (tag && !uniqueSuggestions.has(tag)) {
            uniqueSuggestions.add(tag);
            result.push({ type: 'tag', value: tag });
          }
        });
      }
    });

    res.status(200).json({
      success: true,
      data: result.slice(0, Number(limit))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting search suggestions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get popular search terms
export const getPopularSearches = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    // This would typically come from a search analytics collection
    // For now, we'll return popular categories and brands
    const popularCategories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: Number(limit) },
      { $project: { category: '$_id', count: 1, _id: 0 } }
    ]);

    const popularBrands = await Product.aggregate([
      { $match: { brand: { $exists: true, $ne: null } } },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: Number(limit) },
      { $project: { brand: '$_id', count: 1, _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        popularCategories,
        popularBrands
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting popular searches",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get filter options for search
export const getFilterOptions = async (req: Request, res: Response) => {
  try {
    const [categories, brands, priceRange, discountRange] = await Promise.all([
      // Get unique categories
      Product.distinct('category'),
      
      // Get unique brands
      Product.distinct('brand').then(brands => brands.filter(brand => brand)),
      
      // Get price range
      Product.aggregate([
        { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }
      ]),
      
      // Get discount range
      Product.aggregate([
        { $group: { _id: null, min: { $min: '$discount' }, max: { $max: '$discount' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        categories,
        brands,
        priceRange: priceRange[0] || { min: 0, max: 0 },
        discountRange: discountRange[0] || { min: 0, max: 0 }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting filter options",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
