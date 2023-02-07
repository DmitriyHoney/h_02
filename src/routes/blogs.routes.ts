import { Router } from 'express';
import blogsController from '../controllers/blogs.controller';
const router = Router();
import { createProductBody as validatorMiddleware } from '../validators/blogs.validators';
import { validatorsErrorsMiddleware } from '../validators';

router.get('/', blogsController.getAll);
router.get('/:id/', blogsController.getOne);
router.post('/', ...validatorMiddleware, validatorsErrorsMiddleware, blogsController.create);
router.put('/:id/', ...validatorMiddleware, validatorsErrorsMiddleware, blogsController.update);
router.delete('/:id/', blogsController.deleteOne);
// router.delete('/', blogsController.deleteAll);

export default router;