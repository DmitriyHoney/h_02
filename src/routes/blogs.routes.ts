import { Router } from 'express';
import blogsController from '../controllers/blogs.controller';
const router = Router();
import { createProductBody as validatorMiddleware } from '../validators/blogs.validators';

router.get('/', blogsController.getAll);
router.get('/:id/', blogsController.getOne);
router.post('/', ...validatorMiddleware, blogsController.create);
router.put('/:id/', ...validatorMiddleware, blogsController.update);
router.delete('/:id/', blogsController.deleteOne);
// router.delete('/', blogsController.deleteAll);

export default router;