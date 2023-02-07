import { Router } from 'express';
import blogsController from '../controllers/blogs.controller';
const router = Router();
import { createProductBody as validatorMiddleware } from '../middlewares/blogs.middleware';
import { authMiddleware, validatorsErrorsMiddleware } from '../middlewares';

router.get('/', blogsController.getAll);
router.get('/:id/', blogsController.getOne);
router.post('/', authMiddleware, ...validatorMiddleware, validatorsErrorsMiddleware, blogsController.create);
router.put('/:id/', authMiddleware, ...validatorMiddleware, validatorsErrorsMiddleware, blogsController.update);
router.delete('/:id/', authMiddleware, blogsController.deleteOne);

export default router;