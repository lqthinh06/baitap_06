import { Router } from 'express';
import {
  searchProducts,
  getSearchSuggestions,
  getPopularSearches,
  getFilterOptions
} from '../controllers/search.controller';

const router = Router();

// Search routes
router.get('/', searchProducts);                    // Main search endpoint
router.get('/suggestions', getSearchSuggestions);   // Autocomplete suggestions
router.get('/popular', getPopularSearches);         // Popular search terms
router.get('/filters', getFilterOptions);           // Available filter options

export default router;
