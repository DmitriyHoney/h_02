import { Router } from 'express';
import {createCommentsBody as validatorMiddleware, likeCommentsBody} from '../middlewares/comments.middleware';
import { validatorsErrorsMiddleware } from '../middlewares';
import { authMiddlewareJWT } from '../middlewares/auth.middleware';
import {commentsControllers} from "../controllers/comments.controllers";

const router = Router();

router.get('/', authMiddlewareJWT, commentsControllers.getAll.bind(commentsControllers));
router.get('/:id/', authMiddlewareJWT, commentsControllers.getOne.bind(commentsControllers));
router.put(
    '/:id/',
    authMiddlewareJWT, ...validatorMiddleware, validatorsErrorsMiddleware,
    commentsControllers.update.bind(commentsControllers)
);
router.put(
    '/:id/like-status',
    authMiddlewareJWT, ...likeCommentsBody, validatorsErrorsMiddleware,
    commentsControllers.likeUnlikeComment.bind(commentsControllers)
);
router.delete('/:id/', authMiddlewareJWT, commentsControllers.update.bind(commentsControllers));


export default router;