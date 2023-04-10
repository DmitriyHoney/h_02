import { Router } from 'express';
import blogsDomain from '../domain/blogs.domain';
import postsDomain from '../domain/posts.domain';
import activeDeviceSessionsDomain from '../domain/activeDeviceSessions.domain';
import { HTTP_STATUSES } from '../types/types';
import { commentsDomain } from "../controllers/comments.controllers";
import container from "../composition-roots";
import {UserDomain} from "../domain/users.domain";
const router = Router();

const userDomain = container.resolve(UserDomain);

router.delete('/', (req, res) => {
    Promise.all([
        blogsDomain.deleteAll(),
        postsDomain.deleteAll(),
        userDomain.deleteAll(),
        commentsDomain.deleteAll(),
        activeDeviceSessionsDomain.deleteAll(),
    ]).then((result) => {
        res.status(HTTP_STATUSES.NO_CONTENT_204).send();
    }).catch((err) => {
        console.error(err);
        res.status(HTTP_STATUSES.SERVER_ERROR_500).send();
    })
});

export default router;