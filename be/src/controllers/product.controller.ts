import { Request, Response } from "express";
import Product, { IProduct } from "../models/Product";

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndUpdate(
      { id },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData: Partial<IProduct> = req.body;

    // Generate unique ID if not provided
    if (!productData.id) {
      const count = await Product.countDocuments();
      productData.id = `PROD-${String(count + 1).padStart(4, "0")}`;
    }

    // Generate search keywords from name, brand, category, and tags
    const searchKeywords: string[] = [];
    if (productData.name) {
      searchKeywords.push(...productData.name.toLowerCase().split(' '));
    }
    if (productData.brand) {
      searchKeywords.push(productData.brand.toLowerCase());
    }
    if (productData.category) {
      searchKeywords.push(productData.category.toLowerCase());
    }
    if (productData.tags) {
      searchKeywords.push(...productData.tags.map(tag => tag.toLowerCase()));
    }
    
    // Remove duplicates and empty strings
    productData.searchKeywords = [...new Set(searchKeywords.filter(keyword => keyword.trim()))];

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      data: product,
      message: "Product created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findOneAndUpdate({ id }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
      message: "Product updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findOneAndDelete({ id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get products by category
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });

    res.status(200).json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products by category",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get best sellers
export const getBestSellers = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isBestSeller: true });

    res.status(200).json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching best sellers",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
