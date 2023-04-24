import { Router, Request, Response } from 'express';
import { createBlogsBody as validatorMiddleware } from '../middlewares/blogs.middleware';
import { createPostsBodyWithoutBlogId as validatorMiddlewarePosts } from '../middlewares/posts.middleware';
import { validatorsErrorsMiddleware } from '../middlewares';
import { BaseGetQueryParams, HTTP_STATUSES } from '../types/types';
import { blogsQueryRepo } from '../repositries/blogs.repositry';
import { postQueryRepo } from '../repositries/posts.repositry';
import blogsDomain from '../domain/blogs.domain';
import postsDomain from '../domain/posts.domain';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

type GetAllBlogsQuery = {
    searchNameTerm?: string,
} & BaseGetQueryParams

router.get('/', async (req: Request<{}, {}, {}, GetAllBlogsQuery>, res: Response) => {
    const { pageSize, pageNumber, sortBy, sortDirection, searchNameTerm } = req.query;
    const result = await blogsQueryRepo.find(pageSize, pageNumber, sortBy, sortDirection, { searchNameTerm });
    res.send(result);
});

router.get('/:id/', async (req: Request, res: Response) => {
    const result = await blogsQueryRepo.findById(req.params.id);
    if (!result) {
        res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
        return;
    }
    res.status(HTTP_STATUSES.OK_200).send(result);
});

router.get('/:blogId/posts', async (req: Request, res: Response) => {
    const { pageSize, pageNumber, sortBy, sortDirection } = req.query;
    // @ts-ignore
    const result = await postQueryRepo.findByBlogId(pageSize, pageNumber, sortBy, sortDirection, req.params.blogId);
    // @ts-ignore
    if (!result || result.items.length === 0) {
        res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
        return;
    }
    res.status(HTTP_STATUSES.OK_200).send(result);
});

router.post('/:blogId/posts', authMiddleware, ...validatorMiddlewarePosts, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const result1 = await blogsQueryRepo.findById(req.params.blogId);
    if (!result1) {
        res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
        return;
    }
    const createdRow = await postsDomain.create({
        ...req.body,
        blogId: req.params.blogId,
    });
    res.status(HTTP_STATUSES.CREATED_201).send(createdRow);
});

router.post('/', authMiddleware, ...validatorMiddleware, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const id = await blogsDomain.create(req.body);
    // @ts-ignore
    const result = await blogsQueryRepo.findById(id);
    res.status(HTTP_STATUSES.CREATED_201).send(result);
});

router.put('/:id/', authMiddleware, ...validatorMiddleware, validatorsErrorsMiddleware, async (req: Request, res: Response) => {
    const isUpdated = await blogsDomain.update(req.params.id, req.body);
    return isUpdated
        ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
        : res.status(HTTP_STATUSES.NOT_FOUND_404).send();
});

router.delete('/:id/', authMiddleware, async (req: Request, res: Response) => {
    const isDeleted = await blogsDomain.deleteOne(req.params.id);
    return isDeleted
        ? res.status(HTTP_STATUSES.NO_CONTENT_204).send()
        : res.status(HTTP_STATUSES.NOT_FOUND_404).send('Not found');
});

export default router;