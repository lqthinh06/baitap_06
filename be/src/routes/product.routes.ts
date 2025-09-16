import { Router } from 'express';
import {
  getProduct, addProduct, searchProducts 
} from '../controllers/product.controller';

import {
  getProductDetail,
  toggleFavorite, listFavorites,
  recordView, getRecentlyViewed,
  getSimilarProducts, getProductStats,
  getProductsByIds
} from '../controllers/product.extra.controller';
import { authRequired } from '../middlewares/auth';

const router = Router();

router.get('/', getProduct);
router.get('/search', searchProducts);
router.post('/', addProduct);

router.get('/by-ids', getProductsByIds);
router.get('/:id', getProductDetail);
router.post('/:id/favorite', authRequired, toggleFavorite);
router.get('/favorites', authRequired, listFavorites);
router.post('/:id/view', recordView);               // optional auth
router.get('/recently-viewed', authRequired, getRecentlyViewed);
router.get('/:id/similar', getSimilarProducts);
router.get('/:id/stats', getProductStats);

export default router;
