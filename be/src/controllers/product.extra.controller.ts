import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import Product from '../models/Product';
import User from '../models/User';
import Order from '../models/Order';   
import Review from '../models/Review'; 
import { es } from '../search/es';
import { ES_INDEX } from '../search/indexer';

// GET /api/products/:id (chi tiết)
export const getProductDetail = asyncHandler(async (req: Request, res: Response) => {
  const doc = await Product.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ product: doc });
});

// POST /api/products/:id/favorite
export const toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user._id;
  const productId = new mongoose.Types.ObjectId(req.params.id);

  const user = await User.findById(userId).select('favorites');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isFav = user.favorites.some(id => id.equals(productId));
  if (isFav) {
    await Promise.all([
      User.updateOne({ _id: userId }, { $pull: { favorites: productId } }),
      Product.updateOne({ _id: productId }, { $inc: { wishlistedCount: -1 } })
    ]);
  } else {
    await Promise.all([
      User.updateOne({ _id: userId }, { $addToSet: { favorites: productId } }),
      Product.updateOne({ _id: productId }, { $inc: { wishlistedCount: 1 } })
    ]);
  }
  res.json({ favorited: !isFav });
});

// GET /api/products/favorites
export const listFavorites = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user._id;
  const user = await User.findById(userId).populate({
    path: 'favorites',
    select: 'name price originalPrice image rating sold discount category views'
  });
  res.json({ products: user?.favorites ?? [] });
});

// POST /api/products/:id/view
export const recordView = asyncHandler(async (req: Request, res: Response) => {
  const productId = new mongoose.Types.ObjectId(req.params.id);
  await Product.updateOne({ _id: productId }, { $inc: { views: 1 } });

  // @ts-ignore
  if (req.user?._id) {
    // @ts-ignore
    const userId = req.user._id;
    await User.updateOne({ _id: userId }, { $pull: { recentlyViewed: { product: productId } } });
    await User.updateOne({ _id: userId }, { $push: { recentlyViewed: { product: productId, viewedAt: new Date() } } });
    await User.updateOne({ _id: userId }, { $push: { recentlyViewed: { $each: [], $slice: -50 } } });
  }
  res.json({ ok: true });
});

// GET /api/products/recently-viewed
export const getRecentlyViewed = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user._id;
  const user = await User.findById(userId)
    .select('recentlyViewed')
    .populate({ path: 'recentlyViewed.product', select: 'name price originalPrice image rating sold discount category views' });

  const items = user?.recentlyViewed
    ?.sort((a: any, b: any) => +new Date(b.viewedAt) - +new Date(a.viewedAt))
    .map((x: any) => x.product)
    .filter(Boolean) ?? [];

  res.json({ products: items });
});

// GET /api/products/:id/similar?limit=12
export const getSimilarProducts = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const limit = Math.min(parseInt((req.query.limit as string) || '12'), 24);

  // Thử ES
  try {
    const esResp = await es.search({
      index: ES_INDEX,
      size: limit,
      query: {
        more_like_this: {
          fields: ['name', 'category', 'description'],
          like: [{ _index: ES_INDEX, _id: id }],
          min_term_freq: 1,
          min_doc_freq: 1
        }
      }
    });
    const hits = (esResp.hits.hits || []).filter((h: any) => h._id !== id);
    if (hits.length) {
      return res.json({
        products: hits.map((h: any) => {
          const s = h._source;
          return {
            id: s.id, name: s.name, price: s.price,
            originalPrice: s.originalPrice, image: s.image,
            rating: s.rating, sold: s.sold, discount: s.discount,
            category: s.category, views: s.views
          };
        })
      });
    }
  } catch (e: any) {
    console.warn('ES similar fallback:', e?.message);
  }

  // Fallback Mongo
  const current = await Product.findById(id).select('category price');
  if (!current) return res.json({ products: [] });

  const low = Math.floor((current.price || 0) * 0.7);
  const high = Math.ceil((current.price || 0) * 1.3);

  const mongo = await Product.find({
    _id: { $ne: current._id },
    category: current.category,
    price: { $gte: low, $lte: high }
  })
    .sort({ sold: -1, views: -1 })
    .limit(limit)
    .select('name price originalPrice image rating sold discount category views');

  res.json({ products: mongo });
});

// GET /api/products/:id/stats
export const getProductStats = asyncHandler(async (req: Request, res: Response) => {
  const productId = new mongoose.Types.ObjectId(req.params.id);
  const product = await Product.findById(productId).select('views wishlistedCount');
  if (!product) return res.status(404).json({ message: 'Not found' });

  // Nếu chưa có Order/Review, comment 2 khối dưới và trả buyers/commenters = 0
  const buyersAgg = await Order.aggregate([
    { $unwind: '$items' },
    { $match: { 'items.productId': productId } },
    { $group: { _id: '$userId' } },
    { $count: 'buyers' }
  ]);
  const buyers = buyersAgg[0]?.buyers ?? 0;

  const commentersAgg = await Review.aggregate([
    { $match: { productId } },
    { $group: { _id: '$userId' } },
    { $count: 'commenters' }
  ]);
  const commenters = commentersAgg[0]?.commenters ?? 0;

  res.json({
    views: product.views,
    wishlisted: product.wishlistedCount || 0,
    buyers,
    commenters
  });
});

// GET /api/products/by-ids?ids=a,b,c
export const getProductsByIds = asyncHandler(async (req: Request, res: Response) => {
  const idsParam = (req.query.ids as string) || '';
  const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean);
  if (!ids.length) return res.json({ products: [] });

  const docs = await Product.find({ _id: { $in: ids } })
    .select('name price originalPrice image rating sold discount category views');
  const map = new Map(docs.map(d => [d.id.toString(), d]));
  const ordered = ids.map(id => map.get(id)).filter(Boolean);
  res.json({ products: ordered });
});
