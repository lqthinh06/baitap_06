import { Router } from 'express'
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getBestSellers
} from '../controllers/product.controller'

const router = Router()

// Product routes
router.get('/', getAllProducts)
router.get('/bestsellers', getBestSellers)
router.get('/category/:category', getProductsByCategory)
router.get('/:id', getProductById)
router.post('/', createProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router
