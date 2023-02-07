import { Router } from 'express';
import postsController from '../controllers/posts.controller';
const router = Router();
import { createPostsBody as validatorMiddleware } from '../middlewares/posts.middleware';
import { authMiddleware, validatorsErrorsMiddleware } from '../middlewares';

router.get('/', postsController.getAll);
router.get('/:id/', postsController.getOne);
router.post('/', authMiddleware, ...validatorMiddleware, validatorsErrorsMiddleware, postsController.create);
router.put('/:id/', authMiddleware, ...validatorMiddleware, validatorsErrorsMiddleware, postsController.update);
router.delete('/:id/', authMiddleware, postsController.deleteOne);

export default router;