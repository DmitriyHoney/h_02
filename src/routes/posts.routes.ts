import { Router, Request, Response } from 'express';
import {createLikeForPostBody, createPostsBody as validatorMiddleware} from '../middlewares/posts.middleware';
import { createCommentsBody } from '../middlewares/comments.middleware';
import { validatorsErrorsMiddleware } from '../middlewares';
import {BaseGetQueryParams, HTTP_STATUSES, LastPostLikes, LikeStatus} from '../types/types';
import postsDomain from '../domain/posts.domain';
import {postCommandRepo, postQueryRepo} from '../repositries/posts.repositry';
import {
    authCheckValidRefreshJWT,
    authMiddleware,
    authMiddlewareJWT,
    getUserByRefreshJWT
} from '../middlewares/auth.middleware';
import { commentsQueryRepo } from '../repositries/comments.repositry';
import { commentsDomain } from "../controllers/comments.controllers";

const router = Router();

router.get('/', getUserByRefreshJWT, async (req: Request<{}, {}, {}, BaseGetQueryParams>, res: Response) => {
    const { pageSize, pageNumber, sortBy, sortDirection } = req.query;
    // @ts-ignore
    const result = await postQueryRepo.find(req.context?.user?.id, pageSize, pageNumber, sortBy, sortDirection, {});
    res.send(result);
});

router.get('/:id/', getUserByRefreshJWT, async (req: Request, res: Response) => {
    // @ts-ignore
    const result = await postQueryRepo.findById(req.context?.user?.id, req.params.id);
    if (!result) {
        res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
        return;
    }
    console.log('result', result);
    res.status(HTTP_STATUSES.OK_200).send(result);
});


router.get('/:postId/comments', getUserByRefreshJWT, async (req: Request<{ postId?: string}, {}, {}, BaseGetQueryParams>, res: Response) => {
    const { pageSize, pageNumber, sortBy, sortDirection } = req.query;

    // @ts-ignore
    const isPostExist = await postQueryRepo.findById(req.context?.user?.id, req.params.postId || 'undefined');
    if (!isPostExist) return res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
    // @ts-ignore
    const result = await commentsQueryRepo.find(req.context.user.id, pageSize, pageNumber, sortBy, sortDirection, { postId: req.params.postId });
    if (!result) return res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');

    res.status(HTTP_STATUSES.OK_200).send(result);
});

router.post('/',  authMiddleware, ...validatorMiddleware, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const id = await postsDomain.create(req.body);
    // @ts-ignore
    const result = await postQueryRepo.findById(req.context?.user?.id, id.toString());
    res.status(HTTP_STATUSES.CREATED_201).send(result);
});

router.put('/:postId/like-status',  authMiddlewareJWT, getUserByRefreshJWT, ...createLikeForPostBody, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    // @ts-ignore
    const post = await postQueryRepo.findById(req.context?.user?.id, req.params.postId);
    if (!post) return res.status(HTTP_STATUSES.NOT_FOUND_404).send();

    let likesInfo = post.extendedLikesInfo;
    // @ts-ignore
    if (!likesInfo.newestLikes) likesInfo.newestLikes = [];
    // @ts-ignore
    const userId = req.context?.user?.id;
    // @ts-ignore
    const existItemLikeStatus: any = likesInfo?.newestLikes.find((i) => i.userId === userId);
    const oldStatus = existItemLikeStatus?.status || LikeStatus.NONE;

    // @ts-ignore
    if (oldStatus === LikeStatus.LIKE) likesInfo.likesCount--;
    // @ts-ignore
    if (oldStatus === LikeStatus.DISLIKE) likesInfo.dislikesCount--;

    const bodyStatus = req.body.likeStatus;
    // @ts-ignore
    if (bodyStatus === LikeStatus.LIKE) likesInfo.likesCount++;
    // @ts-ignore
    else if (bodyStatus === LikeStatus.DISLIKE) likesInfo.dislikesCount++;

    // @ts-ignore
    likesInfo.newestLikes = likesInfo.newestLikes
        // @ts-ignore
        .filter((i) => i.userId !== req.context.user?.id);

    if (bodyStatus !== LikeStatus.NONE) {
        const item: LastPostLikes = {
            // @ts-ignore
            userId: req.context.user?.id,
            login: req.context.user?.login || '',
            status: bodyStatus,
            addedAt: new Date().toISOString()
        }
        likesInfo.newestLikes.push(item);
    }

    // @ts-ignore
    const isUpdated = await postCommandRepo.update(req.params.postId, {
        extendedLikesInfo: likesInfo
    });
    return isUpdated
        ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
        : res.status(HTTP_STATUSES.NOT_FOUND_404).send();
});

router.post('/:postId/comments',  authMiddlewareJWT, ...createCommentsBody, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    // @ts-ignore
    const post = await postQueryRepo.findById(req.context.user.id, req.params.postId);
    if (!post) return res.status(HTTP_STATUSES.NOT_FOUND_404).send();
    
    const createdId = await commentsDomain.create({ 
        ...req.body, 
        postId: req.params.postId,
        commentatorInfo: {
            // @ts-ignore
            userId: req.context.user?.id,
            userLogin: req.context.user?.login
        }
    });
    // @ts-ignore
    const result = await commentsQueryRepo.findById(req.context.user?.id, createdId);
    res.status(HTTP_STATUSES.CREATED_201).send(result);
});

router.put('/:id/', authMiddleware, ...validatorMiddleware, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const isUpdated = await postsDomain.update(req.params.id, req.body);
    return isUpdated
        ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
        : res.status(HTTP_STATUSES.NOT_FOUND_404).send();
});

router.delete('/:id/', authMiddleware, async (req: Request, res: Response) => {
    const isDeleted = await postsDomain.deleteOne(req.params.id);
    return isDeleted
        ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
        : res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
});

export default router;