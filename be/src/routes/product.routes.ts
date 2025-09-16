import { Router } from 'express';
import {
  getProduct, addProduct, searchProducts 
} from '../controllers/product.controller';

const router = Router();

router.get('/', getProduct);
router.get('/search', searchProducts);
router.post('/', addProduct);

export default router;
