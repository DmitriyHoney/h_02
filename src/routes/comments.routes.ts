import { Router } from 'express';
import {createCommentsBody as validatorMiddleware, likeCommentsBody} from '../middlewares/comments.middleware';
import { validatorsErrorsMiddleware } from '../middlewares';
import { authMiddlewareJWT } from '../middlewares/auth.middleware';
import {commentsControllers} from "../controllers/comments.controllers";

const router = Router();

router.get('/', commentsControllers.getAll.bind(commentsControllers));
router.get('/:id/', commentsControllers.getOne.bind(commentsControllers));
router.put(
    '/:id/',
    ...validatorMiddleware, validatorsErrorsMiddleware,
    commentsControllers.update.bind(commentsControllers)
);
router.put(
    '/:id/like-status',
    ...likeCommentsBody, validatorsErrorsMiddleware,
    commentsControllers.likeUnlikeComment.bind(commentsControllers)
);
router.delete('/:id/', commentsControllers.update.bind(commentsControllers));


export default router;