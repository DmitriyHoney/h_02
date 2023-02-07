import { Router } from 'express';
import blogsController from '../controllers/blogs.controller';
const router = Router();

router.get('/', blogsController.getAll);
router.get('/:id/', blogsController.getOne);
router.post('/', blogsController.create);
router.put('/:id/', blogsController.update);
router.delete('/:id/', blogsController.deleteOne);
// router.delete('/', blogsController.deleteAll);

export default router;