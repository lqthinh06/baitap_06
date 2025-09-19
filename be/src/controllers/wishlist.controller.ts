import { Response } from "express";
import Wishlist from "../models/Wishlist";
import Product from "../models/Product";
import { AuthedRequest } from "../middleware/auth";

// POST /api/wishlist/:productId (toggle)
export const toggleWishlist = async (req: AuthedRequest, res: Response) => {
  const userId = req.userId!;
  const { productId } = req.params;

  const exists = await Wishlist.findOne({ user: userId, product: productId });
  if (exists) {
    await Wishlist.deleteOne({ _id: exists._id });
    return res.json({ liked: false });
  }
  await Wishlist.create({ user: userId, product: productId });
  return res.json({ liked: true });
};

// GET /api/wishlist
export const getWishlist = async (req: AuthedRequest, res: Response) => {
  const userId = req.userId!;
  const items = await Wishlist.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("product");
  res.json({
    products: items.map(i => ({
      id: (i.product as any)._id.toString(),
      name: (i.product as any).name,
      price: (i.product as any).price,
      originalPrice: (i.product as any).originalPrice,
      image: (i.product as any).image,
      rating: (i.product as any).rating,
      sold: (i.product as any).sold,
      discount: (i.product as any).discount,
      category: (i.product as any).category,
      views: (i.product as any).views,
      likedAt: i.createdAt
    }))
  });
};

// GET /api/wishlist/check/:productId
export const checkWishlist = async (req: AuthedRequest, res: Response) => {
  const userId = req.userId!;
  const { productId } = req.params;
  const exists = await Wishlist.exists({ user: userId, product: productId });
  res.json({ liked: Boolean(exists) });
};
