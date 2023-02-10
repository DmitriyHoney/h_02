import { Router } from 'express';
import blogsController from '../controllers/blogs.controller';
import postsController from '../controllers/posts.controller';
import { HTTP_STATUSES } from '..';
const router = Router();

router.delete('/', (req, res) => {
    Promise.all([
        blogsController.deleteAll(req, res),
        postsController.deleteAll(req, res)
    ]).then((result) => {
        res.status(HTTP_STATUSES.NO_CONTENT_204);
    }).catch((err) => {
        console.error(err);
        res.status(HTTP_STATUSES.SERVER_ERROR_500);
    })
});

export default router;