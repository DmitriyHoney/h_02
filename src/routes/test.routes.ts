import { Router } from 'express';
import blogsDomain from '../domain/blogs.domain';
import postsDomain from '../domain/posts.domain';
import usersDomain from '../domain/users.domain';
import { HTTP_STATUSES } from '../types/types';
const router = Router();

router.delete('/', (req, res) => {
    Promise.all([
        blogsDomain.deleteAll(),
        postsDomain.deleteAll(),
        usersDomain.deleteAll()
    ]).then((result) => {
        res.status(HTTP_STATUSES.NO_CONTENT_204).send();
    }).catch((err) => {
        console.error(err);
        res.status(HTTP_STATUSES.SERVER_ERROR_500).send();
    })
});

export default router;