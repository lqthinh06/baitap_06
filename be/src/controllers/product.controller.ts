// be/src/controllers/product.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import Product from '../models/Product';
import { es } from '../search/es';
import { ES_INDEX, indexProduct } from '../search/indexer';

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    Product.countDocuments()
  ]);

  res.json({
    page, limit, total,
    hasMore: page * limit < total,
    products: products.map(p => ({
      id: p.id.toString(),
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.image,
      rating: p.rating,
      sold: p.sold,
      discount: p.discount,
      category: p.category,
      views: p.views
    }))
  });
});

export const addProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, price, originalPrice, image, rating, sold, discount, category, views } = req.body;

  const doc = await Product.create({
    name, price, originalPrice, image, rating, sold, discount, category, views
  });

  // index vào ES
  await indexProduct({
    id: doc.id.toString(),
    name: doc.name,
    price: doc.price,
    originalPrice: doc.originalPrice,
    image: doc.image,
    rating: doc.rating,
    sold: doc.sold,
    discount: doc.discount || 0,
    category: doc.category || 'other',
    views: doc.views || 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  });

  res.status(201).json({ message: "Product created", product: doc });
});

// 🔎 Fuzzy Search + Filters
export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    minDiscount,
    minViews,
    sort,         // "popular" | "price_asc" | "price_desc" | "newest"
    page = '1',
    limit = '20'
  } = req.query as Record<string, string>;

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const size = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const from = (pageNum - 1) * size;

  // build query
  const must: any[] = [];
  const filter: any[] = [];

  if (q && q.trim()) {
    must.push({
      multi_match: {
        query: q,
        type: "best_fields",
        fields: ["name^3", "description", "category"],
        fuzziness: "AUTO",         // Fuzzy
        operator: "and"
      }
    });
  }

  if (category) {
    filter.push({ term: { category } });
  }
  if (minPrice || maxPrice) {
    filter.push({
      range: { price: {
        gte: minPrice ? Number(minPrice) : undefined,
        lte: maxPrice ? Number(maxPrice) : undefined
      } }
    });
  }
  if (minDiscount) {
    filter.push({ range: { discount: { gte: Number(minDiscount) } } });
  }
  if (minViews) {
    filter.push({ range: { views: { gte: Number(minViews) } } });
  }

  // sort
  let sortClause: any[] = [];
  if(sort){
    console.log("server:",sort);
  }
  switch (sort) {
    
    case 'price_asc': sortClause = [{ price: 'asc' }]; break;
    case 'price_desc': sortClause = [{ price: 'desc' }]; break;
    case 'newest': sortClause = [{ createdAt: 'desc' }]; break;
    default: sortClause = [{ views: 'desc' }, { sold: 'desc' }]; // popular
  }

   const resp = await es.search({
    index: ES_INDEX,
    from,
    size,
    query: must.length || filter.length
        ? { bool: { must: must.length ? must : undefined, filter: filter.length ? filter : undefined } }
        : { match_all: {} },
    sort: sortClause
    });


  const hits = (resp.hits.hits || []) as any[];
  const total = typeof resp.hits.total === 'number' ? resp.hits.total : resp.hits.total?.value || 0;

  const products = hits.map(h => {
    const s = h._source;
    return {
      id: s.id,
      name: s.name,
      price: s.price,
      originalPrice: s.originalPrice,
      image: s.image,
      rating: s.rating,
      sold: s.sold,
      discount: s.discount,
      category: s.category,
      views: s.views
    };
  });

  res.json({
    page: pageNum,
    limit: size,
    total,
    hasMore: pageNum * size < total,
    products
  });
});
