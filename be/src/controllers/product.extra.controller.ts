import { Request, Response } from "express";
import { AuthedRequest } from "../middleware/auth";
import Product from "../models/Product";
import Review from "../models/Review";
import Order from "../models/Order";
import RecentlyViewed from "../models/RecentlyViewed";
import { es } from "../search/es";
import { ES_INDEX } from "../search/indexer";
import mongoose from "mongoose";

// GET /api/products/:id/similar
export const getSimilarProducts = async (req: Request, res: Response) => {
  const { id } = req.params;
  const base = await Product.findById(id);
  if (!base) return res.status(404).json({ message: "Not found" });

  // Ưu tiên ES: same category + more_like_this theo name
  const resp = await es.search({
    index: ES_INDEX,
    size: 12,
    query: {
      bool: {
        must: [
          { term: { category: base.category || "other" } },
          {
            more_like_this: {
              fields: ["name", "description"],
              like: base.name,
              min_term_freq: 1,
              min_doc_freq: 1
            }
          }
        ],
        must_not: [{ term: { id: base.id.toString() } }]
      }
    }
  });

  const hits = (resp.hits.hits || []) as any[];
  const products = hits.map(h => {
    const s = h._source;
    return {
      id: s.id, name: s.name, price: s.price, originalPrice: s.originalPrice,
      image: s.image, rating: s.rating, sold: s.sold, discount: s.discount,
      category: s.category, views: s.views
    };
  });

  res.json({ products });
};

// POST /api/products/:id/view  (ghi nhận đã xem + tăng views)
export const addViewAndTrack = async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId; // có thể undefined nếu không auth

  const doc = await Product.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
  if (!doc) return res.status(404).json({ message: "Not found" });

  if (userId) {
    // upsert list đã xem (đầu mảng, không trùng)
    const rv = await RecentlyViewed.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: doc._id } } }, // remove nếu đã có để đưa lên đầu
      { new: true, upsert: true }
    );
    await RecentlyViewed.updateOne(
      { user: userId },
      { $push: { items: { $each: [{ product: doc._id, viewedAt: new Date() }], $position: 0 } } }
    );
    // giữ tối đa 50
    await RecentlyViewed.updateOne(
      { user: userId },
      { $push: { items: { $each: [], $slice: 50 } } }
    );
  }

  res.json({ ok: true, views: doc.views });
};

// GET /api/me/recently-viewed
export const getRecentlyViewed = async (req: AuthedRequest, res: Response) => {
  const userId = req.userId!;
  const rv = await RecentlyViewed.findOne({ user: userId })
    .populate({ path: "items.product", model: "Product" });

  if (!rv) return res.json({ products: [] });

  const products = rv.items
    .map(i => i.product as any)
    .filter(Boolean)
    .map(p => ({
      id: p._id.toString(),
      name: p.name, price: p.price, originalPrice: p.originalPrice,
      image: p.image, rating: p.rating, sold: p.sold,
      discount: p.discount, category: p.category, views: p.views
    }));

  res.json({ products });
};

// GET /api/products/:id/stats  (đếm khách mua & số bình luận)
export const getProductStats = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

  const [ buyersAgg, commentsCnt ] = await Promise.all([
    Order.aggregate([
      { $match: { "items.product": new mongoose.Types.ObjectId(id), status: { $in: ["paid","shipped","completed"] } } },
      { $group: { _id: "$user" } },
      { $count: "buyers" }
    ]),
    Review.countDocuments({ product: id })
  ]);

  const buyers = buyersAgg[0]?.buyers || 0;
  res.json({ buyers, comments: commentsCnt });
};
