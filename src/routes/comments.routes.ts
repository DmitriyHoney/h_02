import { Router } from 'express';
import {createCommentsBody as validatorMiddleware, likeCommentsBody} from '../middlewares/comments.middleware';
import { validatorsErrorsMiddleware } from '../middlewares';
import {authCheckValidRefreshJWT, authMiddlewareJWT, getUserByRefreshJWT} from '../middlewares/auth.middleware';
import {commentsControllers} from "../controllers/comments.controllers";

const router = Router();

router.get('/', getUserByRefreshJWT, commentsControllers.getAll.bind(commentsControllers));
router.get('/:id/', getUserByRefreshJWT, commentsControllers.getOne.bind(commentsControllers));

router.put(
    '/:id/',
    authMiddlewareJWT,
    ...validatorMiddleware, validatorsErrorsMiddleware,
    commentsControllers.update.bind(commentsControllers)
);
router.put(
    '/:id/like-status',
    authMiddlewareJWT,
    ...likeCommentsBody, validatorsErrorsMiddleware,
    commentsControllers.likeUnlikeComment.bind(commentsControllers)
);
router.delete('/:id/', authMiddlewareJWT, commentsControllers.update.bind(commentsControllers));


export default router;