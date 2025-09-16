import { Router } from 'express';
import { auth } from '../middleware/auth';
import { list, create, update, remove } from '../controllers/todo.controller';

const router = Router();
router.use(auth);
router.get('/', list);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
