import { Router, Request, Response } from 'express';
import { createCommentsBody as validatorMiddleware } from '../middlewares/comments.middleware';
import { validatorsErrorsMiddleware } from '../middlewares';
import { BaseGetQueryParams, HTTP_STATUSES } from '../types/types';
import { commentsQueryRepo } from '../repositries/comments.repositry';
import { authMiddlewareJWT } from '../middlewares/auth.middleware';
import commentsDomain from '../domain/comments.domain';

const router = Router();

router.get('/', async (req: Request<{}, {}, {}, BaseGetQueryParams>, res: Response) => {
    const { pageSize, pageNumber, sortBy, sortDirection } = req.query;
    const result = await commentsQueryRepo.find(pageSize, pageNumber, sortBy, sortDirection);
    res.send(result);
});

router.put('/:id/', authMiddlewareJWT, ...validatorMiddleware, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const isCommentOwnUser = await checkCommentOwnUser(req.params.id, req?.context?.user?.id);
    if (!isCommentOwnUser) return res.status(HTTP_STATUSES.FORBIDDEN_403).send();

    const isUpdated = await commentsDomain.update(req.params.id, req.body);
    isUpdated 
        ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
        : res.status(HTTP_STATUSES.NOT_FOUND_404).send();
});

router.delete('/:id/', authMiddlewareJWT, async (req: Request, res: Response) => {
    const isCommentOwnUser = await checkCommentOwnUser(req.params.id, req?.context?.user?.id);
    if (!isCommentOwnUser) return res.status(HTTP_STATUSES.FORBIDDEN_403).send();

    const isDeleted = await commentsDomain.deleteOne(req.params.id);
    return isDeleted
        ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
        : res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
});

async function checkCommentOwnUser(commentId: string, userId: string | undefined) {
    const row = await commentsQueryRepo.findById(commentId);
    return row?.commentatorInfo?.userId === userId;
}

export default router;