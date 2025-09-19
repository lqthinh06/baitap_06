import { Router } from 'express';
import {
  getProduct, addProduct, searchProducts, getProductById
} from '../controllers/product.controller';

const router = Router();

router.get('/', getProduct);
router.get('/search', searchProducts);
router.get('/:id', getProductById);
router.post('/', addProduct);

export default router;
