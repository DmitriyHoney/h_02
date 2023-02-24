import { Router, Request, Response } from 'express';
import { createPostsBody as validatorMiddleware } from '../middlewares/posts.middleware';
import { createCommentsBody } from '../middlewares/comments.middleware';
import { validatorsErrorsMiddleware } from '../middlewares';
import { BaseGetQueryParams, HTTP_STATUSES } from '../types/types';
import postsDomain from '../domain/posts.domain';
import { postQueryRepo } from '../repositries/posts.repositry';
import { authMiddleware, authMiddlewareJWT } from '../middlewares/auth.middleware';
import { commentsQueryRepo } from '../repositries/comments.repositry';
import commentsDomain from '../domain/comments.domain';

const router = Router();

router.get('/', async (req: Request<{}, {}, {}, BaseGetQueryParams>, res: Response) => {
    const { pageSize, pageNumber, sortBy, sortDirection } = req.query;
    const result = await postQueryRepo.find(pageSize, pageNumber, sortBy, sortDirection, {});
    res.send(result);
});

router.get('/:id/', async (req: Request, res: Response) => {
    const result = await postQueryRepo.findById(req.params.id);
    if (!result) {
        res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
        return;
    }
    res.status(HTTP_STATUSES.OK_200).send(result);
});


router.get('/:postId/comments', async (req: Request<{ postId?: string}, {}, {}, BaseGetQueryParams>, res: Response) => {
    const { pageSize, pageNumber, sortBy, sortDirection } = req.query;

    const isPostExist = await postQueryRepo.findById(req.params.postId || 'undefined');
    if (!isPostExist) return res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
    
    const result = await commentsQueryRepo.find(pageSize, pageNumber, sortBy, sortDirection, { postId: req.params.postId });
    if (!result) return res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');

    res.status(HTTP_STATUSES.OK_200).send(result);
});

router.post('/',  authMiddleware, ...validatorMiddleware, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const id = await postsDomain.create(req.body);
    const result = await postQueryRepo.findById(id);
    res.status(HTTP_STATUSES.CREATED_201).send(result);
});

router.post('/:postId/comments',  authMiddlewareJWT, ...createCommentsBody, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const post = await postQueryRepo.findById(req.params.postId);
    if (!post) return res.status(HTTP_STATUSES.NOT_FOUND_404).send();
    
    const createdId = await commentsDomain.create({ 
        ...req.body, 
        postId: req.params.postId,
        commentatorInfo: {
            userId: req.context.user?.id,
            userLogin: req.context.user?.login
        }
    });
    const result = await commentsQueryRepo.findById(createdId);
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