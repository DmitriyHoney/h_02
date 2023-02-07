import { Router } from 'express';
import blogsController from '../controllers/blogs.controller';
import postsController from '../controllers/posts.controller';
const router = Router();

router.delete('/', (req, res) => {
    blogsController.deleteAll(req, res);
    postsController.deleteAll(req, res);
});

export default router;