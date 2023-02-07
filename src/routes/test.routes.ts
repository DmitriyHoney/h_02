import { Router } from 'express';
import blogsController from '../controllers/blogs.controller';
const router = Router();

router.delete('/', blogsController.deleteAll);

export default router;